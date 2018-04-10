import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"

import Layout from "./components/Layout"
import store from "./store"
import './index.css'
import './App.css'
const app = document.querySelector('#app')

ReactDOM.render(<Provider store={store}>
  <Layout />
</Provider>, app);
