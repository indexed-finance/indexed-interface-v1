import React from 'react'

import ExitIcon from '@material-ui/icons/ExitToApp'
import { styled } from '@material-ui/core/styles'
import { formatBalance, BigNumber } from '@indexed-finance/indexed.js'

import ButtonTransaction from '../components/buttons/transaction'

import IERC20 from '../assets/constants/abi/IERC20.json';
import { ZERO_ADDRESS } from '../assets/constants/addresses';
import { toContract } from './util/contracts'

export function getERC20(web3, tokenAddress){
   return toContract(web3, IERC20.abi, tokenAddress)
}

export async function allowance(web3, tokenAddress, sender, spender){
  let contract = getERC20(web3, tokenAddress)

  return await contract.methods.allowance(sender, spender).call()
}

export async function balanceOf(web3, tokenAddress, owner){
  let contract = getERC20(web3, tokenAddress)

  return await contract.methods.balanceOf(owner).call()
}

export async function getEvents(web3, poolAddress) {
  let contract = getERC20(web3, poolAddress)
  let symbol = await contract.methods.symbol().call()
  let events = []

  let mints = contract.events.Transfer({
    fromBlock: 11398653,
    toBlock: 'latest',
    filter: {
      from: ZERO_ADDRESS,
     },
  }).on('data', function(event, error){
    let { blockNumber, transactionHash, returnValues } = event
    let { from, to, value } = returnValues
    let transferAmount = parseFloat(formatBalance(new BigNumber(value), 18, 2))
    let amount = transferAmount.toLocaleString()

    events.push({
      type: 'MINT',
      event: `${amount} ${symbol}`,
      tx: <ButtonTransaction value={transactionHash} />,
      blockNumber
    })
  })

  let burns = contract.events.Transfer({
    fromBlock: 11420540,
    toBlock: 'latest',
    filter: {
      to: ZERO_ADDRESS
    },
  }).on('data', function(event, error){
    let { blockNumber, transactionHash, returnValues } = event
    let { from, to, value } = returnValues
    let transferAmount = parseFloat(formatBalance(new BigNumber(value), 18, 2))
    let amount = transferAmount.toLocaleString()

    events.push({
      type: 'BURN',
      event: `${amount} ${symbol}`,
      tx: <ButtonTransaction value={transactionHash} />,
      blockNumber
    })
  })

  return await Promise.all([ mints, burns ]).then(() => events)
}
