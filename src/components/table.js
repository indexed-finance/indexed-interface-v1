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
  borderRadius: 10
})

const columns = [
  { id: 'name', label: 'Category', minWidth: 200 },
  {
    id: 'symbol',
    label: 'Symbol',
    minWidth: 25 ,
    align: 'center',
    format: (value) => `[${value.toLocaleString('en-US')}]`,
  },
  {
    id: 'price',
    label: 'Price',
    minWidth: 200,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'delta',
    label: '\u0394',
    minWidth: 50,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'marketcap',
    label: 'Marketcap',
    minWidth: 170,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'liquidity',
    label: 'Liquidity',
    minWidth: 150,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'volume',
    label: 'Volume',
    minWidth: 150,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
];

function createData(name, symbol, price, delta, marketcap, liquidity, volume ) {
  return { name, symbol, price, delta, marketcap, liquidity, volume }
}

const rows = [
  createData('Cryptocurrency', 'CCI', 7232.23, 4.34, 125000.18, 304321.22, 1232232.34),
  createData('Decentralized Finance', 'DEFII', 10553.11, 2.11, 100232.18, 1250023.11, 1204232.23),
  createData('Governance', 'GOVI', 25731.23, 1.12, 75000.11, 100000.11, 500000.12)
];

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  container: {
    maxHeight: 'calc(100vh - 280px)',
  },
})

export default function StickyHeadTable({ triggerMarket }) {
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
            {rows.map((row) => {
              console.log(row)
              return (
                <Row onClick={() => triggerMarket(row.symbol)} hover tabIndex={-1} key={row.code}>
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
