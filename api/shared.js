const moment = require('moment-timezone')
const timezone = 'America/Argentina/Buenos_Aires'

const newFreeSlot = (props) => ({
  id: null,
  recurringEventId: null,
  attendees: [],
  start: moment().format(),
  end: moment().format(),
  summary: 'Free',
  organizer: null,
  private: false,
  available: true,
  ...props
})

const getFreeSlots = (events) => {
  const now = moment().tz(timezone)
  let slots = []
  events.sort((a, b) => moment.utc(a.start).diff(moment.utc(b.start)))

  slots.push(newFreeSlot({
    start: now.clone().startOf('day').format(),
    end: events.length ? moment(events[0].start).format() : now.clone().endOf('day').format()
  }))

  for (let i = 0; i < events.length; i++) {
    let current = events[i]
    let next = events[i + 1] || events[events.length - 1]

    if (!current.available) {
      let overlappedEvent = events.filter((event) => moment(current.end).isBetween(event.start, event.end)).sort((a, b) => a.end - b.end).pop()

      if (overlappedEvent) {
        current = overlappedEvent
      }

      if (moment(next.start).isAfter(current.end)) {
        slots.push(newFreeSlot({
          start: moment(current.end).format(),
          end: moment(next.start).format(),
        }))
      }
    }
  }

  if (events.length > 0) {
    slots.push(newFreeSlot({
      start: moment(events[events.length - 1].end).format(),
      end: now.clone().endOf('day').format()
    }))
  }

  return slots
}

const unifySchedule = (events) => {
  // Make sure to remove the "fake" free slots first. 
  // Otherwise this creates issues when reindexing an existing unified schedule.
  const busySlots = [...events].filter((e) => ! e.available || e.id);
  const freeSlots = getFreeSlots(busySlots);

  return busySlots.concat(freeSlots).sort((a, b) => moment.utc(a.start).diff(moment.utc(b.start)));
}

module.exports = {
  timezone,
  getFreeSlots,
  unifySchedule,
  newFreeSlot
}
