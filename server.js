const moment = require('moment')
const calendar = require('./calendar')
const express = require('express')
const history = require('connect-history-api-fallback')
const cors = require('cors');

// use it before all route definitions
const app = express()
const port = process.env.PORT || 3165
app.use(cors({origin: 'http://localhost:3161'}));

app.get('/api/rooms/:room', function (req, res, next) {
  let roomSlug = req.params.room
  if (!calendar.roomExists(roomSlug)) { res.status(404).json({ error: "Room not found" }); next(); return; }

  var now = moment()

  calendar.getSchedule(req.params.room, now, (err, schedule) => {
    console.log(schedule)
    if (err) { res.status(500).json({ error: err }); next(); return; }

    res.json({
      name: calendar.getRoomName(roomSlug),
      schedule: schedule
    })
  })
})


// Quickly book a room for 15'. No args needed (for the time being)
app.post('/api/rooms/:room', function (req, res, next) {
  let roomSlug = req.params.room
  if (!calendar.roomExists(roomSlug)) { res.status(404).json({ error: "Room not found" }); next(); return; }

  let now = moment()

  calendar.getSchedule(req.params.room, now, (err, schedule) => {
    console.log(schedule)
    if (err) { res.status(500).json({ error: err}); next(); return; }

    let freeSlot = schedule.find((s) => now.isBetween(s.start, s.end) && s.available )
    if( ! freeSlot ) { res.status(409).json({ error: "Room is busy right now" }); next(); return; }

    let event = {
      start: now.startOf('minute'),
      end: moment.min(now.clone().add(15, 'minute'), freeSlot.end), // Make sure we don't overbook the room
      summary: 'Flash meeting'
    }

    calendar.bookEvent(req.params.room, event, (err, newEvent) => {
      if (err) { res.status(500).json({ error: err }); next(); return; }

      schedule.push(newEvent)
      schedule = calendar.unifySchedule(schedule)

      res.json({
        name: calendar.getRoomName(roomSlug),
        schedule: schedule
      })
    })

  })
})

app.use(history())
app.use(express.static('public'))

app.listen(port, function(err) {
  if (err) {
    console.error("Error starting server:\n", err.stack)
    process.exit(1)
  }
  console.log('API available at port '+ port);
});
