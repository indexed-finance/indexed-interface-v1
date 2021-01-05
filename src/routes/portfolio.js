import React, { Fragment, useState, useEffect, useContext } from "react"

import { styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import { useHistory, Link } from "react-router-dom";
import { BigNumber, formatBalance } from '@indexed-finance/indexed.js'
import { useTheme } from '@material-ui/core/styles'

import Ndx from '../assets/constants/abi/Ndx.json'
import ButtonPrimary from '../components/buttons/primary'
import ButtonSecondary from '../components/buttons/secondary'
import Container from '../components/container'
import Input from '../components/inputs/input'
import Canvas from '../components/canvas'
import Progress from '../components/progress'
import Delta from '../components/utils/delta'

import { TX_CONFIRMED, TX_REVERTED, TX_PENDING } from '../assets/constants/parameters'
import { isAddress } from '../assets/constants/functions'
import { categoryMetadata, tokenMetadata } from '../assets/constants/parameters'
import { NDX, ZERO_ADDRESS } from '../assets/constants/addresses'
import { toContract } from '../lib/util/contracts'
import { store } from '../state'

import style from '../assets/css/routes/portfolio'
import getStyles from '../assets/css'

const ListWrapper = styled(List)({
  flex: '1 1 auto',
  overflowY: 'scroll'
})

const Item = styled(ListItem)({
  borderBottom: '2px solid #666666',
  height: 75,
  '& label': {
    fontSize: 17.5
  }
})

const SecondaryAction = styled(ListItemSecondaryAction)({
  '& label': {
    color: '#999999'
  }
})

const useStyles = getStyles(style)

export default function Portfolio(){
  const [ pools, setPools ] = useState([])
  const history = useHistory()
  const classes = useStyles()
  const theme = useTheme()

  let { dispatch, state } = useContext(store)

  useEffect(() => {
    let availableAssets = []
    let indices = Object.entries(state.indexes)

    console.log(indices)

    if(state.request && pools.length == 0){
      for(let x = 0; x < indices.length; x++){
        let pool = indices[x][1]
        let lp = pool

        availableAssets.push(pool)
        availableAssets.push({
          ...pool,
          symbol: `UNIV2-ETH-${lp.symbol}`
        })
      }

      setPools(availableAssets)
    }
  }, [ state.request, state.indexes ])

  useEffect(() => {
    if(!state.load){
      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, [])

  let { height, margin, width, wallet, paddingLeft, tableHeight } = style.getFormatting({ native: state.native })
  let mode = theme.palette.primary.main !== '#ffffff' ? 'light' : 'dark'

  console.log(mode)

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='space-between'>
        <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item xs={12} md={5} lg={5} xl={5}>
            <Canvas native={state.native}>
              <div className={classes.wallet} style={{ height: wallet }}>
                <p> PORTFOLIO VALUE </p>
                <h2> $1,053,423.53<Delta value={5.55} /> </h2>
              </div>
            </Canvas>
          </Grid>
          <Grid item xs={12} md={7} lg={7} xl={7}>
            <Canvas native={state.native}>
              <div className={classes.account} style={{ height: wallet }}>

              </div>
            </Canvas>
          </Grid>
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={12} className={classes.root}>
          <Container margin={margin} padding="1em 0em 0em 0em" title='PORTFOLIO' >
           <div className={classes.proposals} style={{ height: tableHeight }}>
            <ListWrapper dense style={{ width }}>
              {pools.map((value, index) => {

                console.log(categoryMetadata[value.category].circular[mode])

                return (
                  <Item key={index} button>
                    <ListItemText style={{ width: 87.5 }} primary={
                      <span>
                        <div style={{ width: 75, float: 'left' }}>
                          <img src={categoryMetadata[value.category].circular[mode]}
                            style={{ marginBottom: value.symbol.includes('UNI') ? 10 : 0, width: 30 }}
                          />
                          {value.symbol.includes('UNI') && (
                            <span style={{ marginLeft: -5 }}>
                              <img src={tokenMetadata['UNI'].image} style={{ width: 30 }} />
                            </span>
                          )}
                        </div>
                        <span style={{ marginLeft: 15, width: 25 }}> {value.name} </span>
                      </span>
                    }
                    />
                    <ListItemText
                      primary={<>
                        <span style={{ float: 'left', marginRight: 25, width: 200 }}>
                          {Math.floor(Math.random() * 300).toLocaleString()} {value.symbol}
                        </span>
                        <Progress values={{ for: Math.floor(Math.random() * 100), against: Math.floor(Math.random() * 100) }} width={150} color='#00e79a' option='for'/>
                        <span style={{ marginLeft: 50, color: '#666666'}}>${Math.floor(Math.random() * 10000).toLocaleString()} </span>
                      </>}
                    />
                    <SecondaryAction>
                      <ButtonPrimary variant='outlined' margin={{ margin: 0 }}>
                        CLAIM
                      </ButtonPrimary>
                    </SecondaryAction>
                  </Item>
                )
              })}
            </ListWrapper>
           </div>
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}
