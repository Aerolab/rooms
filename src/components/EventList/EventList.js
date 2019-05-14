import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import './EventList.css'

export default class EventList extends PureComponent {

  static propsTypes = {
    events: PropTypes.array,
  }

  static defaultProps = {
    events: [],
  }

  render() {
    const { events } = this.props

    return events.length > 0 && (
      <div className="EventList">
        { events.map(event => (
          <div className="EventItem">
            <span className="EventTime">{moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}</span> {event.summary + (event.private ? ' 👀' : '')}
          </div>
        ))}
      </div>
    )
  }
}
