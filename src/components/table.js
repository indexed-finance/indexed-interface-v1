import React, { Fragment } from 'react'

import { makeStyles, useTheme } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableContainer from '@material-ui/core/TableContainer'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { styled } from '@material-ui/core/styles'
import ContentLoader from "react-content-loader"

const Row = styled(TableRow)({
  border: '3px solid #666666',
  cursor: 'pointer',
  '& .Mui-selected': {
    backgroundColor: 'rgba(102,	255, 255) !important',
    backgroundOpacity: 1
  }
})

const Loader = ({ theme }) => (
    <ContentLoader
      speed={1}
      width={1250}
      height={300}
      viewBox="0 0 1250 300"
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

const columns = [
  { id: 'name', label: 'CATEGORY', minWidth: 225 },
  {
    id: 'symbol',
    label: 'SYMBOL',
    minWidth: 25 ,
    align: 'center',
    format: (value) => `[${value.toLocaleString('en-US')}]`,
  },
  {
    id: 'price',
    label: 'PRICE',
    minWidth: 200,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'delta',
    label: '\u0394',
    minWidth: 25,
    align: 'center',
    format: (value) => `%${value.toLocaleString('en-US')}`,
  },
  {
    id: 'marketcap',
    label: 'MARKETCAP',
    minWidth: 200,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'volume',
    label: 'VOLUME',
    minWidth: 200,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
];

export default function StickyHeadTable({ state, market, triggerMarket }) {

  const useStyles = makeStyles({
    root: {
      width: '100%',
    },
    container: {
      overflowX: !state.native ? 'hidden' : 'scroll',
      height: !state.native ? 'calc(100vh - 500px)' : 'calc(100vh - 400px)',
    },
  })

  const classes = useStyles()
  const theme = useTheme()

  return (
    <Fragment className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader className={classes.table}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {state.request && Object.values(state.indexes).map((row, index) => {
              let backgroundColor = row.active ? 'inherit' : 'rgba(255, 165, 0, 0.6)'

              return (
                <Row selected={market == row.symbol} style={{ backgroundColor }} onClick={() => triggerMarket(row.symbol)} hover tabIndex={-1} key={row.code}>
                  {columns.map((column) => {
                    const value = row[column.id];

                    if(!row.active && (column.id != 'name' && column.id != 'symbol')) {
                      return <TableCell key={column.id} align={column.align} />
                    } else {
                      return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format && typeof value === 'number' ? column.format(value) : value}
                      </TableCell>
                      )
                    }
                  })}
                </Row>
              );
            })}
            {!state.request && (
              <Loader theme={theme} />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Fragment>
  );
}
