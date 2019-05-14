const express = require('express')
const history = require('connect-history-api-fallback')
const api = require('./api')
const compression = require('compression')

const app = express()
const port = process.env.PORT || 3000
const isProduction = process.env.NODE_ENV === 'production'

if( isProduction ) {
  app.use(compression())
}

app.get('/api/rooms/:room', api.getRoom)
// Quickly book a room for 15'. No args needed (for the time being)
app.post('/api/rooms/:room', api.quickBook)
app.post('/api/rooms/:room/:start/:end', api.quickBook)
app.delete('/api/rooms/:room/:eventId', api.removeBooking)


app.use(history())

if( isProduction ) {
  app.use(express.static('dist'))
} else {
  app.use(express.static('public'))
  app.use(require('nwb/express')(express))
}


app.listen(port, (err) => {
  if (err) {
    console.error("Error starting server:\n", err.stack)
    process.exit(1)
  }
  console.log('API available at port '+ port);
});
