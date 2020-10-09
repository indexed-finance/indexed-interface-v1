import { makeStyles } from '@material-ui/core/styles'

 export default function getStyles(style){
   return makeStyles((theme) => style.setStyle(theme))
}
