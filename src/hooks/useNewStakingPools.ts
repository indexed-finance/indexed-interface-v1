import { IndexedStakingSubgraphClient } from '@indexed-finance/subgraph-clients'
import { AllStakingInfoData } from '@indexed-finance/subgraph-clients/dist/staking/types'
import { useEffect, useState } from 'react'
import { getETHPrice } from '../api/gql'

const mainnetClient = IndexedStakingSubgraphClient.forNetwork('mainnet')
const rinkebyClient = IndexedStakingSubgraphClient.forNetwork('rinkeby')

export function useStakingClient(): IndexedStakingSubgraphClient | undefined {
  const network = process.env.REACT_APP_ETH_NETWORK
  if (network === 'mainnet') {
    return mainnetClient
  }
  if (network === 'rinkeby') {
    return rinkebyClient
  }
  return undefined
}

export function useEtherPrice(): number | undefined {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(undefined);
  function update() {
    if (loading) return;
    setLoading(true)
    getETHPrice().then((price_) => {
      setPrice(price_);
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }
  useEffect(() => update(), []);
  return price;
}

export function useNewStakingInfo(): AllStakingInfoData | undefined {
  const client = useStakingClient()
  const [data, setData] = useState<AllStakingInfoData | undefined>()

  useEffect(() => {
    if (!client) return undefined
    client.getStakingInfo().then((info) => setData(info))
  }, [ client ])

  return data
}