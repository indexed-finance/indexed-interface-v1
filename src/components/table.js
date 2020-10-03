import React, { Fragment } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableContainer from '@material-ui/core/TableContainer'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { styled } from '@material-ui/core/styles'

const Row = styled(TableRow)({
  border: '3px solid #666666',
  cursor: 'pointer',
  '& .Mui-selected': {
    backgroundColor: '#66FFFF !important'
  }
})

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

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  container: {
    maxHeight: 'calc(100vh - 280px)',
    overflowX: 'hidden'
  },
})

export default function StickyHeadTable({ indexes, market, triggerMarket }) {
  const classes = useStyles()

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
            {Object.values(indexes).map((row, index) => {

              return (
                <Row selected={market == row.symbol} onClick={() => triggerMarket(row.symbol)} hover tabIndex={-1} key={row.code}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format && typeof value === 'number' ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </Row>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Fragment>
  );
}
