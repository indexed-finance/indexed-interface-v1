import React, { Fragment, useContext } from 'react'

import { useWeb3 } from '../../hooks/useWeb3';
import ButtonPrimary from './primary'

export default function Web3RequiredPrimaryButton(props) {
  const hooks = useWeb3();
  const { onClick, label, disabled, ...rest } = props;

  if (hooks.loggedIn) {
    return <ButtonPrimary {...props}>
      {label}
    </ButtonPrimary>
  }
  return <ButtonPrimary
    onClick={hooks.connectWeb3}
    {...rest}
  >
    Connect Wallet
  </ButtonPrimary>
}