import React from 'react'

import { styled, useTheme } from '@material-ui/core/styles'

import ExitIcon from '@material-ui/icons/ExitToApp'
import Button from '@material-ui/core/Button'

const Exit = styled(ExitIcon)({
  fontSize: '1rem'
})

const shortenHash = receipt => {
  let length = receipt.length
  let z4 = receipt.substring(0, 4)
  let l4 = receipt.substring(length-4, length)
  return `${z4}...${l4}`
}

export default function TransactionButton(props){
  const theme = useTheme()
  let { secondary } = theme.palette

  const Restyled = styled(Button)({
    border: 'none',
    color: secondary.main,
    padding: 0,
    margin: 0,
    '&:hover': {
      color: '#00e79a',
      fontWeight: 'bold',
      background: 'inherit',
      '& o': {
        color: `${secondary.main}`,
      }
    }
  })

  return (
    <a style={{ 'text-decoration': 'none' }}
      href={`https://${process.env.REACT_APP_ETH_NETWORK === 'rinkeby' ? 'rinkeby.' : ''}etherscan.io/tx/${props.value}`}
      target='_blank'>
      <Restyled>
        <o>{shortenHash(props.value)}</o>&nbsp;<Exit/>
      </Restyled>
    </a>
  )
}
