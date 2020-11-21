import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import Button from '@material-ui/core/Button';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { styled } from '@material-ui/core/styles'
import { useHistory } from "react-router-dom";

import style from '../assets/css/components/list'
import getStyles from '../assets/css'

const Row = styled(TableRow)({
  borderBottom: '2px solid #666666 !important',
  borderTop: '2px solid #666666 !important',
  borderRadius: 2.5
})

const Head = styled(TableHead)({
  background: 'white !important',
  borderBottom: 'solid 2px #666666',
  margin: 0,
  zIndex: 1
})

const useStyles = getStyles(style)

export default function StickyHeadTable({ width, height, action, data, columns, props, href }) {
  const classes = useStyles()
  const history = useHistory()

  return (
    <Fragment>
      <TableContainer className={classes.container} style={{ width, maxHeight: height }}>
        <Table stickyHeader className={classes.table}>
          <Head className={classes.head}>
            <TableRow>
              {columns.map((column, i) => (
                <TableCell
                  className={classes.head}
                  key={i}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </Head>
          <TableBody className={classes.body}>
            {data.map((row, i) => {
              let f = () => {}

              if(href){
                f = () => history.push(`/pool/${row.address}`)
              }

              return (
                <Row key={i} hover tabIndex={-1} key={row.code} onClick={f}>
                  {columns.map((column, i) => {
                    const value = row[column.id];
                    const isMarket = value == 'BUY' || value == 'SELL'
                    const isIndex = value == 'MINT' || value == 'BURN'
                    let color

                    if(isMarket){
                      if(value === 'BUY') color = '#00e79a'
                      else color = '#ff005a'
                    } else if(isIndex) {
                      if(value === 'MINT') color = '#00e79a'
                      else color = '#ff005a'
                    }

                    if(column.id === 'action') {
                      let Action = action

                      return (
                        <TableCell key={column.id} align={column.align}>
                          <Action metadata={props[row.symbol]} />
                        </TableCell>
                      )
                    } else {
                      return (
                        <TableCell style={{ color }} key={column.id} align={column.align}>
                          {column.format && typeof value === 'number' ? column.format(value) : value}
                        </TableCell>
                      )
                    }
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
