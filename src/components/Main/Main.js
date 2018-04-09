import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import './Main.css'

export default class Main extends PureComponent {

  static propsTypes = {
    label: PropTypes.string,
    state: PropTypes.string,
    time: PropTypes.string,
    children: PropTypes.element
  }

  static defaultProps = {
    label: '',
    time: '',
    state:''
  }

  render() {
    const { children, label, time, state } = this.props

    return (
      <div className="Main">
        <div className="illustration">
          <img src={`${state}.svg`}/>
        </div>
        <div className="info">
          <div className="label">{label}</div>
          <div className="time">{time}</div>
        </div>
        { children }
      </div>
    )
  }
}
