import React from 'react'
import ReactDOM from 'react-dom'

import * as serviceWorker from './utils/serviceWorker'

import { StateProvider } from './state'
import Root from './routes/root'

import './assets/css/root.css'

ReactDOM.render(
  <StateProvider>
      <Root />
  </StateProvider>,
  document.getElementById('root')
);
