import React from 'react'

import ExitIcon from '@material-ui/icons/ExitToApp'
import { styled } from '@material-ui/core/styles'

import IERC20 from '../assets/constants/abi/IERC20.json';
import { toContract } from './util/contracts'

import ButtonTransaction from '../components/buttons/transaction'

const Exit = styled(ExitIcon)({
  fontSize: '1rem'
})

function hash(value, og) {
  return (
    <a style={{ 'text-decoration': 'none' }} href={`https://rinkeby.etherscan.io/tx/${og}`} target='_blank'>
      <ButtonTransaction> <o>{value}</o>&nbsp;<Exit/> </ButtonTransaction>
    </a>
  )
}

const shortenHash = receipt => {
  let length = receipt.length
  let z4 = receipt.substring(0, 4)
  let l4 = receipt.substring(length-4, length)
  return `${z4}...${l4}`
}

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
  let recentBlock = await web3.eth.getBlock('latest')
  let symbol = await contract.methods.symbol().call()
  let events = []

  let mints = contract.events.Transfer({
    fromBlock: recentBlock.number - parseInt(recentBlock.number * .275),
    filter: {
      from: '0x0000000000000000000000000000000000000000',
     },
  }).on('data', function(event, error){
    let { blockNumber, transactionHash, returnValues } = event
    let { from, to, value } = returnValues

    let amount = (parseFloat(value)/Math.pow(10,18)).toLocaleString({ minimumFractionDigits:  3 })

    events.push(
      { time: blockNumber, event: `MINT ${amount} ${symbol}`, tx: hash(shortenHash(transactionHash), transactionHash) },
    )
  })
  let burns = contract.events.Transfer({
    fromBlock: recentBlock.number - parseInt(recentBlock.number * .275),
    filter: {
      to: '0x0000000000000000000000000000000000000000'
    },
  }).on('data', function(event, error){
    let { blockNumber, transactionHash, returnValues } = event
    let { from, to, value } = returnValues

    let amount = (parseFloat(value)/Math.pow(10,18)).toLocaleString({ minimumFractionDigits:  3 })

    events.push(
      { time: blockNumber, event: `BURN ${amount} ${symbol}`, tx: hash(shortenHash(transactionHash), transactionHash) },
    )
  })

  return await Promise.all([ mints, burns ]).then(() => events)
}
