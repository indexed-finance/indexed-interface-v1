import React, { useEffect } from 'react'

import { makeStyles, withStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import { usePalette } from 'react-palette'

import { tokenMetadata } from '../../assets/constants/parameters'
import style from '../../assets/css/components/weights'
import getStyles from '../../assets/css'
import { BigNumber, formatBalance } from '@indexed-finance/indexed.js'

const useStyles = getStyles(style)

export default function WeightedToken({ token }) {
  let { image } = tokenMetadata[token.symbol];
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
  }))(LinearProgress);

  let formattedBalance = +formatBalance(new BigNumber(token.balance), token.decimals, 4);
  const weight = formatBalance(token.weight, 18, 4);

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <img src={image} className={classes.asset} />
      </div>
      <div className={classes.percentage}>
        <span className={classes.title}>
          <div className={classes.name}>
            {token.name}
          </div>
          <span>[{token.symbol}] </span>
        </span>
        <BorderLinearProgress variant="determinate" value={weight * 100} />
        <span className={classes.alternative}>
          {
            (formattedBalance).toLocaleString()
          } {token.symbol} ≈ ${(formattedBalance * token.priceUSD).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
