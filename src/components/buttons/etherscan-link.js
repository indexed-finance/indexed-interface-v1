import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import LaunchIcon from '@material-ui/icons/Launch';
import Link from '@material-ui/core/Link';

export function EtherscanUrl(props) {
  const { type, entity } = props;
  const network = process.env.REACT_APP_ETH_NETWORK
  let subdomain = network === 'mainnet' ? '' : `${network}.`;
  let relPath = '';
  switch (type) {
    case 'tx':
      relPath = `tx/${entity}`;
      break;
    case 'account':
    case 'contract':
      relPath = `address/${entity}`
      break;
    case 'token':
      relPath = `token/${entity}`;
      break;
    case 'countdown':
      relPath = `block/${entity}`;
      break;
    default: break
  }

  return `https://${subdomain}etherscan.io/${relPath}`;
}

export default function EtherScanLink({
  type,
  entity,
  ImageComponent = LaunchIcon,
  ...rest
}) {
  const etherscanUrl = EtherscanUrl({ type, entity });
  return <IconButton
    disableRipple
    style={{ padding: 0, margin: 0, marginLeft: 10 }}
    component={(_props) =>
      <Link target="_blank" href={etherscanUrl} rel='noopener noreferrer' {..._props} />
    }
    {...rest}
    size='medium'
  >
    <ImageComponent />
  </IconButton>
}
