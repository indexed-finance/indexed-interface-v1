import React from 'react'
import ReactDOM from 'react-dom'

import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import {  Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import * as serviceWorker from './utils/serviceWorker'
import { StateProvider } from './state'

import Navigation from './components/navigation'
import Root from './routes/root'

import './assets/css/root.css'

const theme = createMuiTheme({
  typography: {
    fontFamily: "San Francisco"
  },
  palette: {
    primary: {
      main: '#666666',
    },
    secondary: {
      main: '#999999',
    },
  }
});

ReactDOM.render(
  <StateProvider>
    <ThemeProvider theme={theme}>
      <Navigation />
        <Router>
          <Switch>
            <Route path='/'>
              <Root />
            </Route>
          </Switch>
        </Router>
      </ThemeProvider>
    </StateProvider>,
  document.getElementById('root')
);
