import React, { Fragment, useContext } from 'react'

import { useWeb3 } from '../../hooks/useWeb3';
import ButtonPrimary from './primary'
import { useTranslation } from 'react-i18next';

export default function Web3RequiredPrimaryButton(props) {
  const hooks = useWeb3();
  const { onClick, label, disabled, ...rest } = props;
  const { t } = useTranslation()

  if (hooks.loggedIn) {
    return <ButtonPrimary {...props}>
      {label}
    </ButtonPrimary>
  }
  return <ButtonPrimary
    onClick={hooks.connectWeb3}
    {...rest}
  >
    {t('connect')} 
  </ButtonPrimary>
}
