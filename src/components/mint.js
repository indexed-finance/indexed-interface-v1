import React, { useState, useEffect, useContext } from 'react'

import { toWei, toHex, fromWei, toTokenAmount, BigNumber  } from '@indexed-finance/indexed.js/dist/utils/bignumber';
import { makeStyles, styled } from '@material-ui/core/styles'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import Grid from '@material-ui/core/Grid'

import { TX_CONFIRM, TX_REJECT, TX_REVERT, WEB3_PROVIDER } from '../assets/constants/parameters'
import { tokenMetadata } from '../assets/constants/parameters'
import { toChecksumAddress } from '../assets/constants/functions'
import { balanceOf, getERC20, allowance } from '../lib/erc20'
import { toContract } from '../lib/util/contracts'

import style from '../assets/css/components/mint'
import getStyles from '../assets/css'

import BPool from '../assets/constants/abi/BPool.json'
import NumberFormat from '../utils/format'
import ButtonPrimary from './buttons/primary'
import Adornment from './inputs/adornment'
import Input from './inputs/input'
import Approvals from './approval-form'

import { store } from '../state'
import { useMintState } from '../state/mint';

const OutputInput = styled(Input)({
  width: 250,
  marginTop: 75
})

const RecieveInput = styled(Input)({
  width: 250,
})

const Trigger = styled(ButtonPrimary)({
  marginTop: -7.5
})

const useStyles = getStyles(style)

function generate(element) {
  return [0, 1, 2].map((value) =>
    React.cloneElement(element, {
      key: value,
    }),
  )
}

function toFixed(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return parseFloat(num.toString().match(re)[0]);
}

export default function Mint({ market, metadata }) {
  let [pool, setPool] = useState(undefined)

  const [ single, setSingle ] = useState(false)
  const [ rates, setRates ] = useState([])
  const classes = useStyles()
  const { useToken, mintState, bindPoolAmountInput, setHelper } = useMintState();


  let { state, dispatch } = useContext(store);

  const mint = () => console.log('Would have minted tokens!');

  useEffect(() => {
    const updatePool = async() => {
      if (!mintState.pool) {
        let poolHelper = state.helper.initialized.find(i => i.pool.address === metadata.address);
        setPool(poolHelper);
        setHelper(poolHelper);
      }
    }
    updatePool()
  }, [ state.web3.injected ])

  let width = !state.native ? '417.5px' : '100vw'

  return (
    <div className={classes.root}>
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <RecieveInput label="RECIEVE" variant='outlined'
          helperText={<o className={classes.helper}>
            BALANCE: {0}
          </o>}
          {
            ...(bindPoolAmountInput)
          }
          InputProps={{
            endAdornment: market,
            inputComponent: NumberFormat
          }}
        />
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} style={{ width: '100%'}}>
        <div className={classes.demo}>
          <Approvals
            width='100%'
            height='calc(40vh - 75px)'
            // targetAddress={metadata.address}
            useToken={useToken}
            tokens={mintState.tokens}
          />
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Trigger onClick={mint}> MINT </Trigger>
      </Grid>
    </Grid>
    </div>
  );
}
