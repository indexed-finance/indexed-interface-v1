import React, { useEffect } from 'react'

import { makeStyles, withStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import { usePalette } from 'react-palette'

import { tokenMetadata } from '../assets/constants/parameters'

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
    marginTop: 10,
    width: 50
  },
  alternative: {
    color: '#999999'
  },
  wrapper: {
    float: 'left',
    marginRight: 20
  }
});

export default function Weight({ asset }) {
  let { image } = tokenMetadata[asset.symbol]
  let { data } = usePalette(image)
  const classes = useStyles()

  const BorderLinearProgress = withStyles((theme) => ({
    root: {
      height: 17.5,
      borderRadius: 10,
      marginTop: 5,
      marginBottom: 5,
      width: 225
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: data.vibrant,
    },
  }))(LinearProgress)

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <img src={image} className={classes.asset} />
      </div>
      <div className={classes.percentage}>
        <span className={classes.title}> {asset.name} [{asset.symbol}] </span>
        <BorderLinearProgress variant="determinate" value={asset.weight * 100} />
        <span className={classes.alternative}>
          {asset.balance.toLocaleString()} {asset.symbol} ≈ ${(asset.balance * asset.price).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
