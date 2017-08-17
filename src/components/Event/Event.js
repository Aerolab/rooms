import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import './Event.css'

export default class Event extends PureComponent {

  static propsTypes = {
    current: PropTypes.bool,
    event: PropTypes.object
  }

  static defaultProps = {
    current: false,
    event: null
  }

  render() {
    const { current, event } = this.props
    let time = event ? (current ? event.end : event.start) : 0

    return event && (
      <div className="Event">
        <div className="name">{event.summary + (event.private ? ' 👀' : '')}</div>
        <div className="badge">{current ? 'Ends' : 'Starts'} at {moment(time).format('HH:mm')}</div>
      </div>
    )
  }
}
