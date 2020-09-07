import Web3 from 'web3'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Torus from "@toruslabs/torus-embed"
import Fortmatic from "fortmatic"

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: '1c6549e97ff24d9a99ba4e007b538de6'
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

const getWeb3 = () => (
  new Promise(async(resolve, reject) => {
    try {
      const web3Modal = new Web3Modal({
        network: 'mainnet',
        cacheProvider: true,
        providerOptions
      })
      web3Modal.clearCachedProvider()

      const provider = await web3Modal.connect()
      let web3 = new Web3(provider)

      resolve(web3)
    } catch(e){
      resolve(e)
    }
  })
);

export default getWeb3
