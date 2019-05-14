import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import './TimelineEvent.css'

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default class TimelineEvent extends Component {

  render() {
    const {event, isPrev, isNext} = this.props;
    
    if( ! event ) {
      return (
      <div className="TimelineEvent">
        {isNext ?
          <div className="subtitle">Próxima reunión:</div>
          :
          <div className="subtitle">Reunión anterior:</div>
        }
        <div className="title">Sala Libre</div>
      </div>
      )
    }

    const startDate = event ? moment(event.start) : null;
    const endDate = event ? moment(event.end) : null;
    const duration = endDate.diff(startDate, 'minutes');
    const now = moment();

    if( event.available ) {
      return (
        <div className="TimelineEvent">
          {isNext ?
            now.isSame(startDate, 'day') ?
              <div className="subtitle">A partir de las {startDate.format('HH:mm')}hs</div>
              :
              <div className="subtitle">A partir del {startDate.format('dddd')} a las {startDate.format('HH:mm')}hs</div>
            :
            now.isSame(endDate, 'day') ?
              <div className="subtitle">Anteriormente a las {endDate.format('HH:mm')}hs</div>
              :
              <div className="subtitle">Anteriormente el {endDate.format('dddd')} a las {endDate.format('HH:mm')}hs</div>
          }
          {isNext ? 
            now.isSame(endDate, 'day') ?
              <div className="title">Sala Libre por {duration >= 120 ? `${Math.floor(duration/60)} horas` : `${duration} minutos`}</div>
              :
              <div className="title">Sala Libre el resto del día</div>
            :
            <div className="title">Sala Libre</div>
          }
        </div>
      )
    }

    return (
      <div className="TimelineEvent">
        {isNext ?
          now.isSame(startDate, 'day') ?
            <div className="subtitle">Próxima reunión de {startDate.format('HH:mm')} a {endDate.format('HH:mm')}hs</div>
            :
            now.clone().add(1, 'day').isSame(startDate, 'day') ?
              <div className="subtitle">Próxima reunión mañana de {startDate.format('HH:mm')} a {endDate.format('HH:mm')}hs</div>
              :
              <div className="subtitle">Próxima reunión el {startDate.format('dddd')} de {startDate.format('HH:mm')} a {endDate.format('HH:mm')}hs</div>
          :
          now.isSame(endDate, 'day') ?
            <div className="subtitle">Última reunión de {startDate.format('HH:mm')} a {endDate.format('HH:mm')}hs</div>
            :
            now.clone().add(-1, 'day').isSame(startDate, 'day') ?
              <div className="subtitle">Última reunión ayer de {startDate.format('HH:mm')} a {endDate.format('HH:mm')}hs</div>
              :
              <div className="subtitle">A long time ago in a galaxy far, far away...</div>
        }
        <div className="title">{event.summary}</div>
      </div>
    )
  }

}
