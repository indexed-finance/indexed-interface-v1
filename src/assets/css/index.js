import { makeStyles } from '@material-ui/core/styles'

import markets from './routes/markets'
import categories from './routes/categories'
import pool from './routes/pool'
import governance from './routes/governance'
import propose from './routes/propose'
import index from './routes/index'
import proposal from './routes/proposal'
import approvals from './components/approvals'
import mint from './components/mint'
import trade from './components/trade'
import burn from './components/burn'
import table from './components/table'
import weights from './components/weights'
import tabs from './components/tabs'
import list from './components/list'
import navigation from './components/navigation'

let styles = {
  categories,
  markets,
  governance,
  proposal,
  propose,
  pool,
  index,
  navigation,
  approvals,
  mint,
  trade,
  burn,
  tabs,
  weights,
  list,
  navigation,
  table
}

 export default function getStyles(target){
   return makeStyles((theme) => styles[target].setStyle(theme))
}
