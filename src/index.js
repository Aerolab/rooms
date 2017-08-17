import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'
import App from './App'
import './index.css'

render((
  <BrowserRouter>
    <Route path="/:room?" component={App} />
  </BrowserRouter>
), document.querySelector('#app'))
