import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './BookNow.css'

export default class BookNow extends Component {

    const { minutes } = this.props

    return (
      <button className="BookNow">{`Book now for ${Math.min(15, minutes)}'`}</button>
    )
  }

}
