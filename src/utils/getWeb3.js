import Web3 from 'web3'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Torus from "@toruslabs/torus-embed"
import Fortmatic from "fortmatic"

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: '442bad44b92344b7b5294e4329190fea'
    }
  },
  fortmatic: {
    package: Fortmatic,
    options: {
      key: 'pk_test_F0261A757AD16AD0'
    }
  },
  torus: {
    package: Torus,
    options: {
      networkParams: {
        chainId: 1,
        networkId: 1
      },
    }
  }
}

export const getCachedWeb3 = async () => {
  const web3Modal = new Web3Modal({
    network: 'mainnet',
    cacheProvider: true,
    providerOptions
  });
  if (web3Modal.cachedProvider) {
    const provider = await web3Modal.connect();
    return new Web3(provider);
  }
  return null;
}

export const getWeb3 = () => (
  new Promise(async(resolve, reject) => {
    try {
      const web3Modal = new Web3Modal({
        network: 'mainnet',
        cacheProvider: true,
        providerOptions
      })
      web3Modal.clearCachedProvider()

      const provider = await web3Modal.connect()
      let web3 = new Web3(provider.wc || provider)

      resolve(web3)
    } catch(e){
      console.log('PROVIDER ERR', e)
      resolve(e)
    }
  })
);
