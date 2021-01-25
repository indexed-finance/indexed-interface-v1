import { Theme, makeStyles } from '@material-ui/core/styles'
import { SetStyleType } from './routes/categories'

type PropsClasses = Record<keyof SetStyleType, string>
type StyleType = {
  setStyle: (theme: Theme) => SetStyleType
}
 export default function getStyles(style: StyleType): any {
   return makeStyles<Theme, SetStyleType>((theme): any => style.setStyle(theme))
}
