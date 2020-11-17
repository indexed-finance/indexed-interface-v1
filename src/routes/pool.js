import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { store } from '../state'
import { InitializerStateProvider } from '../state/initializer'
import UninitializedPool from '../components/pool/uninitialized-pool'
import InitializedPool from '../components/pool/initialized-pool'

const dummy = {
    address: '0x0000000000000000000000000000000000000000',
    assets: [ ],
    name: '',
    symbol: '',
    price: '',
    supply: '',
    marketcap: '',
    liquidity: [],
    volume: '',
    active: null,
    credit: 0,
    history: [],
    type: <span> &nbsp;&nbsp;&nbsp;&nbsp;</span>
};

export default function Pool(){
  const [ data, setData ] = useState(dummy)

  let { state, dispatch } = useContext(store)
  let { address } = useParams()

  useEffect(() => {
    if(!state.load) dispatch({ type: 'LOAD', payload: true });
  }, [])

  useEffect(() => {
    const retrievePool = async() => {
      let { indexes } = state

      if(Object.keys(indexes).length > 0 && data.address === dummy.address){
        let target = Object.entries(indexes).find(x => x[1].address === address)

        setData(target[1])
      }
    }
    retrievePool()
  }, [ state.indexes ])

  let { active } = data

  if (active == false) return <InitializerStateProvider>
    <UninitializedPool address={address} metadata={data} />
  </InitializerStateProvider>
  else return <InitializedPool address={address} metadata={data} />
}
