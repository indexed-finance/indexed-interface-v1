import React, { Fragment } from 'react'

import { useTheme } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableContainer from '@material-ui/core/TableContainer'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { styled } from '@material-ui/core/styles'
import ContentLoader from "react-content-loader"

import { poolNativeColumns, poolDesktopColumns } from '../assets/constants/parameters'
import style from '../assets/css/components/table'
import getStyles from '../assets/css'

const useStyles = getStyles(style)

const Row = styled(TableRow)({
  borderBottom: '3px solid #666666',
  cursor: 'pointer',
  '& .Mui-selected': {
    backgroundColor: 'rgba(102,	255, 255) !important',
    backgroundOpacity: 1
  },
  '&:hover': {
    backgroundOpacity: '0.875 !important'
  }
})

const Loader = ({ theme }) => (
    <ContentLoader
      speed={1}
      width={2000}
      height={300}
      viewBox="0 0 2000 300"
      backgroundColor={theme.palette.primary.main}
      foregroundColor='rgba(153, 153, 153, 0.5)'
    >
      <rect x="0" y="0" rx="3" ry="3" width="100%" height="45" />
      <rect x="0" y="50" rx="3" ry="3" width="100%" height="45" />
      <rect x="0" y="100" rx="3" ry="3" width="100%" height="45" />
      <rect x="0" y="150" rx="3" ry="3" width="100%" height="45" />
      <rect x="0" y="200" rx="3" ry="3" width="100%" height="45" />
    </ContentLoader>
)


export default function StickyHeadTable(props) {
  let { market, triggerMarket, state } = props
  let { request, native, indexes } = state
  let { overflowX, padding } = style.getFormatting(native)
  const classes = useStyles()
  const theme = useTheme()

  return (
    <div className={classes.root}>
      <TableContainer style={{ overflowX  }} >
        <Table stickyHeader className={classes.table} dense={state.native}>
          <TableHead>
            <Row>
              {(state.native ? (window.innerWidth > 320 ? poolNativeColumns : poolNativeColumns.filter((i) => i.id !== 'delta')) : poolDesktopColumns)
                .map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </Row>
          </TableHead>
          <TableBody>
            {request && Object.values(indexes).map((row, index) => {

              return (
                <Row selected={market === row.symbol} onClick={() => triggerMarket(row.symbol)} onMouseEnter={() => { if (market === row.symbol || state.native) return; triggerMarket(row.symbol) }} hover tabIndex={-1} key={index}>
                {(state.native ? (window.innerWidth > 320 ? poolNativeColumns : poolNativeColumns.filter((i) => i.id !== 'delta')) : poolDesktopColumns)
                    .map((column, i) => {
                    const value = row[column.id];
                    if(!row.active && (column.id !== 'name' && column.id !== 'symbol')) {
                      return <TableCell key={column.id + row.symbol + i} align={column.align} />
                    } else if(column.id === 'delta') {
                      return (
                        <TableCell key={column.id + row.symbol + i} align={column.align} style={{ padding }}>
                          <span style={{ color: value > 0 ? '#00e79a': '#ff005a'}}>
                            ({value > 0 ? '+' : ''}{value}%)
                          </span>
                        </TableCell>
                       )
                    } else {
                      return (
                        <TableCell key={column.id + row.symbol + i} align={column.align} style={{ padding }}>
                          {(column.format && typeof value === 'number') ? column.format(value) : value}
                        </TableCell>
                      )
                    }
                  })}
                </Row>
              );
            })}
            {!request && (
              <Loader theme={theme} />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
