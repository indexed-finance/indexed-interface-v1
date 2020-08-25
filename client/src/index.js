import React from 'react'
import ReactDOM from 'react-dom'

import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import {  Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import * as serviceWorker from './utils/serviceWorker'
import { StateProvider } from './state'

import Navigation from './components/navigation'
import Index from './routes/index'
import Root from './routes/root'
import Demo from './routes/demo'

import './assets/css/root.css'

const theme = createMuiTheme({
  typography: {
    fontFamily: "San Francisco Bold"
  },
  palette: {
    primary: {
      main: '#333333',
    },
    secondary: {
      main: '#999999',
    },
  }
});

ReactDOM.render(
  <StateProvider>
    <ThemeProvider theme={theme}>
      <Router>
        <Navigation />
        <Switch>
          <Route exact path='/'>
            <Root />
          </Route>
          <Route path='/index/:name'>
            <Index />
          </Route>
          <Route path='/demo'>
            <Demo />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  </StateProvider>,
document.getElementById('root'))
