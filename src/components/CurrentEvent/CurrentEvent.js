import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import './CurrentEvent.css'

export default class CurrentEvent extends PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      showRemoveButton: false
    }
  }

  render() {
    const { event, prevEvent, nextEvent, onBook, onRemoveBooking } = this.props;

    if( ! event ) {
      return <div></div>
    }

    const now = moment();
    const remainingMinutes = -now.diff(event.end, 'minutes');
    const remainingSeconds = -now.diff(event.end, 'seconds');
    const showRemoveButton = event.isFlashEvent && event.id;

    if( event.available ) {
      return (
        <div className="CurrentEvent is-available">
          { remainingMinutes <= 120 ?
              remainingMinutes > 0 ?
                <div className="time">Por {remainingMinutes} minutos</div>
                :
                <div className="time">Por {remainingSeconds} segundos</div>
            :
            now.isSame(event.end, 'day') ?
              <div className="time">Hasta las {moment(event.end).format('HH:mm')}hs</div>
              :
              now.isSame(prevEvent.end, 'day') ?
                <div className="time">El resto del día</div>
                :
                <div className="time">Todo el día</div>
          }

          <div className="title">Sala Libre</div>

          { remainingMinutes >= 5 &&
            <div className="actions">
              <button className="Button" onClick={() => onBook({
                start: now.clone().startOf('minute'),
                end: moment.min(now.clone().add(15, 'minutes').endOf('minute'), moment(event.end))
              })}>{`Reservar ${Math.min(15, remainingMinutes)} minutos`}</button>

              <a className="Link" onClick={() => onBook({
                start: now.clone().startOf('minute'),
                end: moment.min(now.clone().add(60, 'minutes').endOf('minute'), moment(event.end))
              })}>{ remainingMinutes >= 60 ? `Reservar una hora` : `Reservar hasta la próxima reunión` }</a>
            </div>
          }

        </div>
      ) 
    }

    return (
      <div className="CurrentEvent">
        {now.isSame(event.end, 'day') ?
          remainingMinutes < 60 ?
            remainingMinutes > 0 ?
              <div className="time">Quedan {remainingMinutes} minutos</div>
              :
              <div className="time">Quedan {remainingSeconds} segundos</div>
            :
            <div className="time">Hasta las {moment(event.end).format('HH:mm')}hs</div>
          :
          <div className="time">El resto del día</div>
        }

        <div className={`title ${event.summary && event.summary.length > 30 ? 'small' : ''} `}>{event.summary ? event.summary : 'Evento Privado'}</div>

        {event.organizer && ! event.isFlashEvent && 
          <div className="booker">Agendado por <strong>{event.organizer.displayName || event.organizer.email}</strong></div>
        }

        {event.isFlashEvent &&
          <div className={`actions ${showRemoveButton ? 'is-visible' : 'is-hidden'} `}>
            <a className="Link" onClick={() => showRemoveButton && onRemoveBooking(event)}>Liberar Reserva</a>
          </div>
        }
      </div>
    )
  }
}
