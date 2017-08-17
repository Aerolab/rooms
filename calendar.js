const rooms = require('./rooms.json')
const key = require('./rooms-client.json')

const google = require('googleapis')
const moment = require('moment-timezone')

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/calendar'],
  null
)


const calendar = google.calendar({
  version: 'v3',
  auth: jwtClient
})


const roomExists = function(roomSlug, date) {
  let room = rooms[roomSlug]
  return room ? true : false
}

const getRoomName = function(roomSlug, date) {
  let room = rooms[roomSlug]
  return room ? room.name : null
}

// Docs: https://developers.google.com/apis-explorer/#p/calendar/v3/

const getEvents = function(roomSlug, date, cb) {
  let room = rooms[roomSlug]
  if( ! room ) { cb('Room does not exist', null); return; }

  calendar.events.list({
    calendarId: room.id,
    timeMin: date.clone().startOf('day').format(),
    timeMax: date.clone().endOf('day').format(),
  }, function (err, response) {
    if( err ) { return cb(err, null) }

    // Normalize the events to prevent leaking private data
    response.items = response.items.map((e) => normalizeEvent(e, date)).filter((e) => e !== null )
    response.items.sort((a,b) => a.start - b.start)
    cb(null, response)
  })
}


const normalizeEvent = function(apiEvent, now) {
  if (apiEvent.status !== 'confirmed' || ! apiEvent.start || ! apiEvent.end) { return null }

  let event = {
    //id: apiEvent.id,
    //status: apiEvent.status,
    start: apiEvent.start ? moment(apiEvent.start.dateTime) : null,
    end: apiEvent.end ? moment(apiEvent.end.dateTime) : null,
    summary: (apiEvent.visibility === 'private') ? 'Private event' : apiEvent.summary,
    organizer: apiEvent.organizer,
    private: (apiEvent.visibility === 'private'),
    available: false
  }

  // Here's a fun fact: The start and end dates for repeating events
  // ARE THE DATES OF THE FIRST FUCKING EVENT. Hence, this pile of crap.
  // We pick the start of the minute for all dates because Google Calendar tends to overbook events by up to 59"
  event.start = now.clone().set({ 'hours': event.start.hours(), 'minutes': event.start.minutes() }).startOf('minute')
  event.end = now.clone().set({ 'hours': event.end.hours(), 'minutes': event.end.minutes() }).startOf('minute')

  return event
}


const getCurrentEvent = function(events, now) {
  return events.find((e) => now.isBetween(e.start, e.end)) || null
}


const getNextEvent = function(events, now) {
  events = events.slice().sort((a,b) => a.start - b.start)
  for(let e of events) {
    if( now.isAfter(e.end) ) { continue }
    if( now.isBefore(e.start) ) { return e }
  }
  return null
}


const getFreeSlots = function(events, now) {
  // Add two fake bookings at the start and end of the day to easily get the slots in between all the events
  events = events.slice().sort((a,b) => a.start - b.start)
  events.unshift({ start: now.clone().startOf('day'), end: now.clone().startOf('day') })
  events.push({ start: now.clone().endOf('day'), end: now.clone().endOf('day') })

  let slots = []
  for(let i=0; i<events.length; i++) {
    let current = events[i]
    let next = events[i+1] || events[events.length-1]

    if (current.status !== 'cancelled') {
      // This is because if you put an event in between another event, the free slots will be based on the "inside" one,
      // making the next free slot start earlier than it should.
      let containingEvent = events.filter((e) => current.end.isBetween(e.start, e.end)).sort((a, b) => a.end - b.end).pop() || null
      if (containingEvent) { current = containingEvent }

      if (next.start - current.end > 0) {
        slots.push({ 
          start: current.end.clone(), 
          end: next.start.clone(), 
          summary: 'Free',
          organizer: null,
          available: true,
          private: false
        })
      }
    }
  }

  return slots
}


const getNextFreeSlot = function(events, now) {
  // If the room is free now, return that slot. Otherwise, pick the next one
  let slots = getFreeSlots(events, now)
  let freeSlot = slots.find((s) => now.isBetween(s.start, s.end)) || null
  if( ! freeSlot ) { freeSlot = slots.find((s) => now.isBefore(s.start)) || null }

  return freeSlot
}


// Get all the busy and free slots as a single unified schedule
const getSchedule = function(room, now, cb) {

  now = now.clone()

  getEvents(room, now, (err, response) => {
    if (err || ! response) { cb(true, null); return; }

    let events = response.items || []
    let schedule = unifySchedule(events)
    cb(null, schedule)

  })
}

// Unify the busy and free slots as one
const unifySchedule = function(events) {
  let now = moment()
  events = events.filter((e) => ! e.available)
  let busySlots = events.slice()
  let freeSlots = getFreeSlots(events, now)

  let schedule = busySlots.concat(freeSlots).sort((a,b) => a.start - b.start)

  return schedule
}


const bookEvent = function(roomSlug, booking, cb) {
  let room = rooms[roomSlug]
  if( ! room ) { cb('Room does not exist', null); return; }

  let now = moment()

  calendar.events.insert({
    calendarId: room.id,
    resource: {
      summary: booking.summary,
      start: { dateTime: moment(booking.start).format() },
      end: { dateTime: moment(booking.end).format() }
    }
  }, function (err, response) {
    if( err ) { return cb('Couldn\'t create the event', null) }
    let event = normalizeEvent(response, now)
    cb(null, event)
  })
}


module.exports = {
  roomExists,
  getRoomName,
  getEvents,
  getCurrentEvent,
  getNextEvent,
  getFreeSlots,
  getNextFreeSlot,
  getSchedule,
  unifySchedule,
  bookEvent
}
