import React, { Fragment, useState, useEffect, useContext } from "react";

import { Link } from 'react-router-dom'
import { styled } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'

import ButtonPrimary from '../components/buttons/primary'
import Container from '../components/container'
import Spline from '../components/charts/spline'
import Pie from '../components/charts/pie'
import Canvas from '../components/canvas'
import Table from '../components/table'

import indexed from '../assets/images/indexed.png'
import { store } from '../state'

const dummy = {
    address: '0x0000000000000000000000000000000000000000',
    assets: [ ],
    name: '',
    symbol: '',
    price: '',
    supply: '',
    marketcap: '',
    history: []
}

const Trigger = styled(ButtonPrimary)({
  padding: '.3em 2.125em',
  marginTop: 25,
  marginLeft: 'auto',
  float: 'right',
})

const Wrapper = styled(Paper)({
  borderLeft: '5px solid #666666',
  borderRight: '3px solid #666666',
  borderTop: '3px solid #666666',
  borderBottom: '3px solid #666666',
  borderTopLeftRadius: 200,
  borderBottomLeftRadius: 200,
  borderTopRightRadius: 10,
  borderBottomRightRadius: 10,
  width: '32.5%',
  height: '13.5em',
  boxShadow: 'none',
  background: 'white',
  position: 'absolute',
  marginTop: '-.2em',
  right: '3.5%'
})

export default function Markets(){
  const [ market, setMarket ] = useState(dummy)
  const [ pie, setPie ] = useState(<Fragment />)
  let { state, dispatch } = useContext(store)

  const changeMarket = (market) => {
    setMarket(state.indexes[market])
  }

  useEffect(() => {
    if(Object.keys(state.indexes).length > 0){
      setMarket(state.indexes['DEFII5'])
    }
  }, [ state.indexes ])

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item>
          <Canvas>
            <div className='market-select'>
              <h2> {market.name} [{market.symbol}] </h2>
              <h3> {market.price} </h3>
            </div>
            <Spline metadata={market} />
            <Wrapper>
              <Pie metadata={market} />
              <ul className='market-options'>
                <li>ADDRESS:
                  <span>
                    {market.address.substring(0, 6)}...{market.address.substring(38, 64)}
                  </span>
                </li>
                <li>SUPPLY: <span>{market.supply}</span> </li>
                <li>OUTFLOW: <span></span> </li>
                <li>INFLOW: <span></span></li>
                <li>TVL: <span>{market.marketcap}</span></li>
                <Link to={`index/${market.symbol.toLowerCase()}`}>
                  <Trigger> EXPLORE </Trigger>
                </Link>
              </ul>
            </Wrapper>
          </Canvas>
        </Grid>
        <Grid item>
          <Container margin="2em" percentage='11%' title='INDEXES' components={
            <Table indexes={state.indexes} market={market.symbol} triggerMarket={changeMarket} />
          }/>
        </Grid>
      </Grid>
    </Fragment>
  )
}