import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './BookNow.css'

export default class BookNow extends Component {

  static propTypes = {
    book: PropTypes.func,
    minutes: PropTypes.number
  }

  static defaultProps = {
    book: () => { },
    minutes: 15
  }

  render() {
    const { book, minutes } = this.props

    return (
      <button className="BookNow" onClick={book}>{`Book now for ${Math.min(15, minutes)}'`}</button>
    )
  }

}
