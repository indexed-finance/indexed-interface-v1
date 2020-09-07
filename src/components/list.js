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

const useStyles = (height) => makeStyles({
  root: {
    width: '100%',
    padding: 0
  },
  container: {
    maxHeight: 150,
    padding: 0
  },
  table: {
    margin: 0,
    padding: 0,
    margin: 0
  }
});

export default function StickyHeadTable({ height, action, data, columns }) {
  const classes = useStyles();

  return (
    <Fragment>
      <TableContainer className={classes.container} style={{ maxHeight: height }}>
        <Table stickyHeader className={classes.table}>
          <Head className={classes.head}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  className={classes.head}
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </Head>
          <TableBody className={classes.body}>
            {data.map((row) => {
              return (
                <Row hover tabIndex={-1} key={row.code}>
                  {columns.map((column) => {
                    const value = row[column.id];

                    if(column.id === 'action') {
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {action}
                        </TableCell>
                      )
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
          </TableBody>
        </Table>
      </TableContainer>
    </Fragment>
  );
}
