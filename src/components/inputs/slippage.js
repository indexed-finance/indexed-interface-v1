import React from "react";
import Chip from "@material-ui/core/Chip";

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
}));

export default function Slippage({ slippage, setSlippage }) {
  const classes = useStyles();
  const options = [1, 2];
  return (<div className={classes.root}>
    Max. Slippage:
    {
      options.map((pct, i) => <Chip
        key={i}
        label={`${pct}%`}
        {...((slippage === (pct / 100)) ? {} : {variant: 'outlined'})}
        // variant={(slippage === pct / 100) ? 'default' : 'outlined'}
        size='small'
        color='secondary'
        onClick={() => setSlippage(pct / 100)}
      />)
    }
  </div>)
  // return <Grid /* container direction='row' wrap='nowrap' */ item xs={12} md={12} lg={12} xl={12} alignContent='flex-start' direction='row'>
  // <Typography variant='body2'>Max. Slippage:</Typography>
  // {
  //       options.map((pct, i) => <Chip
  //         key={i}
  //         label={`${pct}%`}
  //         variant='outlined'
  //         size='small'
  //         color='secondary'
  //         onClick={() => setSlippage(pct / 100)}
  //       />)
  //     }
  //   {/* <Grid item xs={7} md={7} lg={7} xl={7}>
  //     <Typography variant='body2'>Max. Slippage:</Typography>
  //   </Grid>
  //   <Grid item xs={5} md={5} lg={5} xl={5}>
  //     {
  //       options.map((pct, i) => <Chip
  //         key={i}
  //         label={`${pct}%`}
  //         variant='outlined'
  //         size='small'
  //         color='secondary'
  //         onClick={() => setSlippage(pct / 100)}
  //       />)
  //     }
  //   </Grid> */}
  // </Grid>
}