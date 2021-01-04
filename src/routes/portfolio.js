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

export default function Governance(){
  const [ metadata, setMetadata ] = useState({})
  const history = useHistory()
  const classes = useStyles()

  let { dispatch, state } = useContext(store)

  useEffect(() => {
    if(!state.load){
      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, [])

  let { height, margin, width, wallet, paddingLeft, tableHeight } = style.getFormatting({ native: state.native })

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='space-between'>
        <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item xs={12} md={5} lg={5} xl={5}>
            <Canvas native={state.native}>
              <div className={classes.wallet} style={{ height: wallet }}>
                <p> PORTFOLIO VALUE </p>
                <h2> $10,053.53<Delta value={5.55} /> </h2>
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
          <Container margin={margin} padding="1em 0em" title='PORTFOLIO' >
           <div className={classes.proposals} style={{ height: tableHeight }}>
            <ListWrapper dense style={{ width }}>
              {[0].map((p, index) => {

                return (
                  <Item key={index} button>
                    <ListItemText primary={''}
                      secondary={
                        <> </>
                      }
                    />
                    <ListItemText
                      primary={
                        <> </>
                      }
                    />
                    <SecondaryAction>
                      <ButtonPrimary variant='outlined'>
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
