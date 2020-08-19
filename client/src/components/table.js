import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { styled } from '@material-ui/core/styles'

const Row = styled(TableRow)({
  border: '3px solid #666666',
  borderRadius: 10
})

const columns = [
  { id: 'name', label: 'Name', minWidth: 250 },
  {
    id: 'price',
    label: 'Price',
    minWidth: 100,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'delta',
    label: '\u0394',
    minWidth: 170,
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
    minWidth: 170,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'volume',
    label: 'Volume',
    minWidth: 170,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
];

function createData(name, price, delta, marketcap, liquidity, volume ) {
  return { name, price, delta, marketcap, liquidity, volume };
}

const rows = [
  createData('Cryptocurrency Index [CCII]', 7232.23, 4.34, 125000.18, 304321.22, 1232232.34),
  createData('DeFi Index [DEFII]', 10553.11, 2.11, 100232.18, 1250023.11, 1204232.23),
  createData('Governance Index [GOVII]', 25731.23, 1.12, 75000.11, 100000.11, 500000.12)
];

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  container: {
    maxHeight: 440,
  },
});

export default function StickyHeadTable() {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Fragment className={classes.root}>
      <TableContainer className={classes.container}>
        <Table className={classes.table}>
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
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              return (
                <Row hover tabIndex={-1} key={row.code}>
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
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Fragment>
  );
}
