const moment = require('moment')
const calendar = require('./calendar')
const {unifySchedule} = require('./shared')

const getRoom = async (req, res, next) => {
  const room = calendar.getRoom(req.params.room)

  if (!room) {
    res.status(404).json({ error: 'Room not found' })
    return
  }

  const schedule = await calendar.getEvents(room.slug)
  res.json({
    name: room.name,
    position: room.position,
    schedule: schedule
  })
}

const quickBook = async (req, res, next) => {
  const room = calendar.getRoom(req.params.room);
  const now = moment();

  if (!room) {
    res.status(404).json({ error: 'Room not found' })
    return
  }

  const schedule = await calendar.getEvents(room.slug)

  let freeSlot = schedule.find((s) => now.isBetween(s.start, s.end) && s.available)

  if (!freeSlot) {
    res.status(409).json({ error: 'Room is busy right now' })
    return
  }

  const start = req.params.start ? moment(req.params.start) : now.clone().startOf('minute');
  const end = req.params.end ? moment(req.params.end) : now.clone().add(15, 'minute').endOf('minute');

  let event = {
    start: moment.max(start, moment(freeSlot.start)), // Make sure we don't overbook the room
    end: moment.min(end, moment(freeSlot.end)), // Make sure we don't overbook the room
    summary: 'Flash Meeting',
    available: false
  }

  try {
    const newEvent = await calendar.bookEvent(room.slug, event);
    schedule.push(newEvent);

    res.json({
      name: room.name,
      position: room.position,
      schedule: unifySchedule(schedule)
    });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'API Not Available. Couldn\'t book event.' })
    return
  }
}

const removeBooking = async (req, res, next) => {
  const room = calendar.getRoom(req.params.room);
  const eventId = req.params.eventId;

  if (!room) {
    res.status(404).json({ error: 'Room not found' })
    return
  }

  const schedule = await calendar.getEvents(room.slug);
  const event = schedule.find(e => e.id === eventId);

  if( ! event || ! event.isFlashEvent ) {
    res.status(400).json({ error: 'That\'s not a flash booking' })
    return
  }

  try {
    // Remove the event and rebuild the schedule without the event
    await calendar.removeEvent(room.slug, event.id);
    const newSchedule = schedule.filter(e => e.id !== eventId)

    res.json({
      name: room.name,
      position: room.position,
      schedule: unifySchedule(newSchedule)
    });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'API Not Available. Couldn\'t remove event.' })
    return
  }
}

module.exports = {
  getRoom,
  quickBook,
  removeBooking
}
