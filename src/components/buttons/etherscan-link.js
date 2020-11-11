import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import LaunchIcon from '@material-ui/icons/Launch';
import Link from '@material-ui/core/Link';

export default function EtherScanLink(props) {
  const { network, type, entity } = props;
  let subdomain = network === 'mainnet' ? '' : `${network}.`;
  let relPath = '';
  switch (type) {
    case 'tx':
      relPath = `tx/${entity}`;
      break;
    case 'account':
    case 'contract':
      relPath = `account/${entity}`
      break;
    case 'token':
      relPath = `token/${entity}`;
      break;
    default: break 
  }

  const etherscanUrl = `https://${subdomain}etherscan.io/${relPath}`;
  return <IconButton
    component={(props) =>
      <Link target="_blank" href={etherscanUrl} rel='noreferrer' {...props} />
    }
    size='small'
  >
    <LaunchIcon />
  </IconButton>
}