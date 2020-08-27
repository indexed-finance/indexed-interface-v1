import React, { useEffect } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 20,
    borderRadius: 10,
    marginTop: 2.5,
    marginBottom: 2.5,
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: '#999999',
  },
}))(LinearProgress);

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    fontSize: 12,
  },
  title: {
    fontSize: 15,
  },
  percentage: {
    float: 'right'
  },
  asset: {
    width: 50
  },
  alternative: {
    color: '#999999'
  },
  wrapper: {
    float: 'left',
    marginRight: 20
  },
  progress: {
    bar: {
      borderRadius: 5,
      backgroundColor: '#999999',
    },
  }
});

export default function Weight({ image, name, holdings, value, color }) {
  const classes = useStyles();

  const BorderLinearProgress = withStyles((theme) => ({
    root: {
      height: 20,
      borderRadius: 10,
      marginTop: 2.5,
      marginBottom: 2.5,
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: color,
    },
  }))(LinearProgress);

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <img src={image} className={classes.asset} />
      </div>
      <div className={classes.percentage}>
        <span className={classes.title}> {name} </span>
        <BorderLinearProgress className={classes.progress} variant="determinate" value={value} />
        <span className={classes.alternative}> {holdings}</span>
      </div>
    </div>
  );
}
