import React from "react";
import Chip from "@material-ui/core/Chip";

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
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
    SLIPPAGE:
    {
      options.map((pct, i) => <Chip
        key={i}
        label={`${pct}%`}
        {...((slippage === (pct / 100)) ? {} : {variant: 'outlined'})}
        // variant={(slippage === pct / 100) ? 'default' : 'outlined'}
        size='small'
        style={{ marginLeft: 12.5 }}
        color='secondary'
        onClick={() => setSlippage(pct / 100)}
      />)
    }
  </div>)

}
