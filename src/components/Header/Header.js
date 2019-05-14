import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import './Header.css'

export default class Header extends PureComponent {

  static propsTypes = {
    current: PropTypes.bool,
    event: PropTypes.object,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    current: false,
    event: null,
    onClick: null,
  }

  render() {
    const { name, position } = this.props

    return (
      <div className="Header">
        <div className="name">{ name }</div>
        <img className={ `position ${position}` } src={'./arrow.svg'}/>
      </div>
    )
  }
}
