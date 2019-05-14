import React, { Component } from 'react'
import Helmet from 'react-helmet'
import moment from 'moment-timezone'
import cn from 'classnames'
import './App.css'
import {unifySchedule, newFreeSlot} from '../api/shared'

import Header from './components/Header/Header'
import CurrentEvent from './components/CurrentEvent/CurrentEvent'
import Event from './components/Event/Event'
import EventList from './components/EventList/EventList'
import TimelineEvent from './components/TimelineEvent/TimelineEvent'

moment.locale('es');

export default class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      name: '',
      position: 'left',
      slug: props.match.params.room,
      now: moment(),
      schedule: [],
      isLoading: true,
      isAvailable: false,
      prevEvent: null,
      currentEvent: null,
      nextEvent: null
    }
  }

  componentWillMount() {
    this.fetchSchedule()
    // Update the calendar every 30 seconds
    this.fetchInterval = setInterval(() => this.fetchSchedule(), 30 * 1000)
    // Update the app state every second
    this.updateInterval = setInterval(() => this.updateState(), 1 * 1000)

    // Check the app for upgrades
    this.upgradeInterval = setInterval(() => this.checkForUpgrade(), 60 * 1000)

    // Restart the client at midnight
    this.restartTimeout = setTimeout(() => {
      window.location.reload()
    }, moment().endOf('day').valueOf() - Date.now());

    this.checkForUpgrade();
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
    clearInterval(this.updateInterval);
    clearInterval(this.upgradeInterval);
    clearTimeout(this.restartTimeout);
  }

  checkForUpgrade = async () => {
    try {
      const indexReq = await fetch(`/${this.state.slug}`);
      if (indexReq.status !== 200) return;

      const html = await indexReq.text();

      if( ! this.prevHTML ) this.prevHTML = html;

      // If there's a new release reload the app
      if( this.prevHTML !== html ) {
        window.location.reload();
      }
    } catch(e) {
      console.error(e);
    }
  }

  fetchSchedule = async () => {
    try {
      const roomReq = await fetch(`/api/rooms/${this.state.slug}`);
      if (roomReq.status !== 200) throw new Error('API Unavailable');

      const roomData = await roomReq.json();
      this.setState({
        ...roomData,
        schedule: unifySchedule(roomData.schedule),
        isLoading: false
      }, this.updateState);
    } catch(e) {
      console.error(e);
    }
  }

  book = async (eventData) => {
    let { now, schedule, currentEvent } = this.state

    if (! currentEvent.available) return;

    // Push a fake flash event into the schedule to update the UI instantly
    if( ! eventData ) {
      eventData = {
        available: false,
        start: now.startOf('minute').format(),
        end: moment.min(now.clone().add(15, 'minute').endOf('minute'), moment(currentEvent.end)).format(),
        summary: 'Flash Meeting',
        isFlashEvent: true
      }
    }

    eventData.available = eventData.available || false;
    eventData.summary = eventData.available || 'Flash Meeting';
    eventData.start = moment(eventData.start).format();
    eventData.end = moment(eventData.end).format();
    eventData.isFlashEvent = true;

    // Make a bunch of fake events to put in-place. This is because running unifySchedule is very slow
    const eventIndex = schedule.findIndex((e) => e.id === currentEvent.id);
    const newSchedule = [
      ...(schedule.slice(0, eventIndex)), 
      newFreeSlot({ start: currentEvent.start, end: eventData.start }), 
      eventData, 
      newFreeSlot({ start: eventData.end, end: currentEvent.end }), 
      ...(schedule.slice(eventIndex))
    ];
    this.updateState(newSchedule, true);

    // Reschedule the fetchInterval so we don't get an update while creating the event. 
    // The booking takes a few seconds, so it's prone to race conditions.
    clearInterval(this.fetchInterval);
    this.fetchInterval = setInterval(() => this.fetchSchedule(), 30 * 1000);
    
    // Do the API request so we get the actual booked event. Should look about the same
    try {
      const bookingReq = await fetch(`/api/rooms/${this.state.slug}/${moment(eventData.start).format()}/${moment(eventData.end).format()}`, { method: 'POST' });
      if (bookingReq.status !== 200) throw new Error('API Unavailable');

      const roomData = await bookingReq.json();
      this.setState({
        ...roomData
      });
      this.updateState(roomData.schedule);
    } catch(e) {
      console.error(e);
      this.fetchSchedule();
    }
  }

  removeBooking = async (event) => {
    const { now, schedule } = this.state
    if( ! event.isFlashEvent ) return;

    // Remove the flash event from the schedule to update the UI instantly
    const newSchedule = [...schedule].filter(e => e.id !== event.id);

    this.updateState(newSchedule);

    try {
      const roomReq = await fetch(`/api/rooms/${this.state.slug}/${event.id}`, { method: 'DELETE' });
      if (roomReq.status !== 200) throw new Error('API Unavailable');
      const roomData = await roomReq.json();
    } catch(e) {
      console.error(e);
      this.fetchSchedule();
    }
  }

  toggleNextEvents = () => {
    const { openNextEvents } = this.state
    this.setState({ openNextEvents: !openNextEvents })
  }
  
  updateState(newSchedule, skipUnify) {
    const now = moment();
    const schedule = newSchedule ? skipUnify ? newSchedule : unifySchedule(newSchedule) : this.state.schedule;

    const currentTime = now.format('HH:mm:ss');
    const currentEvent = schedule.find((e) => now.isBetween(e.start, e.end));
    const prevEvent = schedule.filter((e) => e.end <= currentEvent.start && e.id).pop();
    const nextEvent = schedule.find((e) => e.start == currentEvent.end);

    const isAvailable = currentEvent ? currentEvent.available : true

    this.setState({
      now,
      currentTime,
      currentEvent,
      prevEvent,
      nextEvent,
      isAvailable,
      schedule
    })
  }

  render() {
    const { name, position, isAvailable, isLoading, currentEvent, prevEvent, nextEvent, currentTime } = this.state

    if( isLoading ) {
      return <div className="App loading">Cargando...</div>
    }

    return (
      <div className={cn('App', position)}>
        <Helmet>
          <title>{name}</title>
          <link rel="icon" type="image/x-icon" href={`/${isAvailable ? 'free' : 'busy'}.ico`} />
        </Helmet>
        <TimelineEvent event={prevEvent} isPrev />
        <CurrentEvent event={currentEvent} time={currentTime} prevEvent={prevEvent} nextEvent={nextEvent} onBook={this.book} onRemoveBooking={this.removeBooking} />
        <TimelineEvent event={nextEvent} isNext />
      </div>
    )
  }
}
