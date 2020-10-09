import { makeStyles } from '@material-ui/core/styles'

import markets from './routes/markets'
import categories from './routes/markets'
import pool from './routes/pool'
import governance from './routes/governance'
import propose from './routes/propose'
import index from './routes/index'
import proposal from './routes/proposal'

let styles = {
  markets,
  governance,
  proposal,
  propose,
  pool,
  index
}

 export default function getStyles(target){
   return makeStyles((theme) => styles[target].setStyle(theme))
}
