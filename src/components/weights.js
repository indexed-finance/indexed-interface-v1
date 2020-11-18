import React, { useEffect, useState } from 'react'


import { fromWei } from '@indexed-finance/indexed.js/dist/utils/bignumber';
import { makeStyles, withStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import { usePalette } from 'react-palette'


import { tokenMetadata } from '../assets/constants/parameters'
import style from '../assets/css/components/weights'
import getStyles from '../assets/css'
import { formatBalance } from '@indexed-finance/indexed.js'

const useStyles = getStyles(style)

const dummy = { balance: 0, name: null, symbol: null, weight: 0 }

export default function Weight({ asset }) {
  const [ metadata, setMetadata ] = useState(dummy)
  let { image } = tokenMetadata[asset.symbol]
  let { data } = usePalette(image)
  const classes = useStyles()

  const BorderLinearProgress = withStyles((theme) => ({
    root: {
      height: 17.5,
      borderRadius: 10,
      marginTop: 5,
      marginBottom: 5,
      width: 300
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: data.vibrant,
    },
  }))(LinearProgress)

  useEffect(() => {
    let {
      weight, symbol, name, balance, percentOfDesired,
      decimals, targetBalance, currentBalance
    } = asset

    let target = weight ? weight : targetBalance;
    let displayBalance = balance ? formatBalance(balance, decimals, 4) : currentBalance
    let isGeneric = target == weight;
    let float = isGeneric ? 'right' : null

    if(target && metadata == dummy){
      let desiredWeight = isGeneric ? formatBalance(target, decimals, 4) : target
      let displayPercent = !isGeneric ? percentOfDesired : desiredWeight * 100
      let title = isGeneric ? `≈ $${(displayBalance * asset.priceUSD).toLocaleString()}`
      : `/ ${desiredWeight.toLocaleString()} ${symbol}`

      setMetadata({
        percent: displayPercent,
        weight: desiredWeight,
        balance: +displayBalance,
        symbol, name, title,
        float
      })
    }
  }, [ asset ])

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <img src={image} className={classes.asset} />
      </div>
      <div className={classes.precentage} style={{ float: metadata.float }}>
        <span className={classes.title}> {metadata.name} [{metadata.symbol}] </span>
        <BorderLinearProgress variant="determinate" value={metadata.percent} />
        <span className={classes.alternative}>
          {metadata.balance.toLocaleString()} {metadata.symbol} {metadata.title}
        </span>
      </div>
    </div>
  );
}
