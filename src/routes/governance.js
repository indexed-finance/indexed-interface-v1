import React, { Fragment, useState, useEffect, useContext } from "react"

import ParentSize from '@vx/responsive/lib/components/ParentSize'
import { styled, makeStyles, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Checkbox from '@material-ui/core/Checkbox'
import Avatar from '@material-ui/core/Avatar'
import Lozenge from '@atlaskit/lozenge'
import LinearProgress from '@material-ui/core/LinearProgress'
import { useHistory } from "react-router-dom";


import Ndx from '../assets/constants/abi/Ndx.json'
import ButtonPrimary from '../components/buttons/primary'
import Container from '../components/container'
import Input from '../components/inputs/input'
import Radio from '../components/inputs/radio'
import Select from '../components/inputs/select'
import Canvas from '../components/canvas'
import Stacked from '../components/charts/stacked'

import style from '../assets/css/routes/governance'
import { toContract } from '../lib/util/contracts'
import getStyles from '../assets/css'
import { store } from '../state'

const NDX = '0xe366577a6712591c2e6f76fdcb96a99ac30a74c3'
const NA = '0x0000000000000000000000000000000000000000'

const selections = [[{ value: 0, label: null }]];

const Liquidity = styled(Button)({
  border: '2px solid #009966',
  color: '#999999',
  borderRadius: 5,
  padding: '.5em 2.5em',
  '&:hover': {
    color: '#009966',
    fontWeight: 'bold'
  }
})

const getPhase = phase => {
  if(phase == 'passed') return 'positive'
  else if(phase == 'rejected') return 'removed'
  else if(phase == 'active') return 'new'
  else if(phase == 'executed') return 'inprogress'
}

const ProgressFor = withStyles((theme) => ({
  root: {
    height: 12.5,
    borderRadius: 10,
    width: 200,
    float: 'left'
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: '#00e79a',
  },
}))(LinearProgress)

const ProgressAgainst = withStyles((theme) => ({
  root: {
    height: 12.5,
    borderRadius: 10,
    width: 200,
    float: 'left'
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: '#ff005a',
  },
}))(LinearProgress)

const AddressInput = styled(Input)({
  marginTop: 0,
  marginBottom: 7.5,
  width: '100%'
})

const ListWrapper = styled(List)({
  height: 'calc(100vh - 475px)',
  flex: '1 1 auto',
  overflowY: 'scroll'
})

const Item = styled(ListItem)({
  borderBottom: '2px solid #666666',
  height: 100,
  '& label': {
    fontSize: 17.5
  }
})

const SecondaryAction = styled(ListItemSecondaryAction)({
  '& label': {
    color: '#999999'
  }
})

const ListAvatar = styled(ListItemAvatar)({
  marginRight: 25
})

const useStyles = getStyles(style)

export default function Governance(){
  const [ proposals, setProposals ] = useState([])
  const [ phase, setPhase ] = useState(<span />)
  const [ status, setStatus ] = useState(null)
  const [ chart, setChart ] = useState(<span/>)
  const history = useHistory()
  const classes = useStyles()

  let { dispatch, state } = useContext(store)

  function Activate(){
    const [ selection, setSelection ] = useState(null)

    const handleSelection = (event) => {
      setSelection(event.target.value)
    }

    return(
      <Fragment>
        <p> You have not setup your wallet for voting yet,
          either for individual voting, or delegation.
        </p>
        <label>
          <b style={{ float: 'left'}}>
            INDIVIDUAL <Radio value={0} checked={selection == 0} onClick={handleSelection} color='#00e79a' />
          </b>
          <b style={{ float: 'right'}}>
            DELEGATION <Radio value={1} checked={selection == 1} onClick={handleSelection} color='orange' />
          </b>
          <ButtonPrimary> INITIALISE </ButtonPrimary>
        </label>
      </Fragment>
    )
  }

  const renderDelegate = () => {
    return(
      <Fragment>
        <p> Allocate your votes to another address:</p>
        <AddressInput variant="outlined" label='ADDRESS'/>
        <ButtonPrimary> DELEGATE </ButtonPrimary>
      </Fragment>
    )
  }

  useEffect(() => {
    const getAccountMetadata = async() => {
      let { web3 } = state

      if(web3.injected) {
        let contract = toContract(web3.injected, Ndx.abi, NDX)
        let isDelegated = await contract.methods.delegates(state.account).call()
        let balance = await contract.methods.balanceOf(state.account).call()
        let amount = (parseFloat(balance)/Math.pow(10, 18)).toLocaleString(
          undefined, { minimumFractionDigits: 2 }
        )

        if(isDelegated != NA) {
          if(isDelegated == state.account) {
            setStatus(<span id='registered'>ACTIVE</span>)
          } else {
            setStatus(<span id='delegated'>DELEGATED</span>)
          }
          setPhase(renderDelegate())
        } else {
          setStatus(<span id='inactive'>INACTIVE</span>)
          setPhase(<Activate />)
        }

        dispatch({ type: 'BALANCE',
          payload: {
            balances: {
              'NDX': { address: NDX, amount }
            }
          }
        })
      }
    }
    getAccountMetadata()
  }, [ state.web3.injected ])

  useEffect(() => {
    setProposals(state.proposals)
  }, [])

  let { height, margin, percent, width } = style.getFormatting(state)

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='space-between'>
        <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item xs={12} md={5} lg={5} xl={5}>
            <Canvas native={state.native}>
              <div className={classes.wallet}>
                <h3> BALANCE: {state.balances['NDX'].amount} NDX </h3>
                <h4> STATUS: {status}</h4>
                {phase}
              </div>
            </Canvas>
          </Grid>
          <Grid item xs={12} md={7} lg={7} xl={7}>
            <Canvas native={state.native}>
              <div className={classes.chart}>
                <div className={classes.stats}>
                  <h3> TOTAL VOTERS: 384</h3>
                  <h4> SHARE VALUE: $250.34</h4>
                </div>
                {!state.native && (
                  <div className={classes.legend}>
                    <ul>
                      <li> 50,124.35 NDX<div className={classes.one}/> </li>
                      <li> 15,433.07 NDX<div className={classes.two}/></li>
                      <li> 680.44 NDX<div className={classes.three}/> </li>
                    </ul>
                  </div>
                )}
                <Stacked height={height} />
              </div>
            </Canvas>
          </Grid>
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={12} className={classes.root}>
          <Container margin={margin} padding="1em 2em" title='PROPOSALS' percentage={percent}>
           <div className={classes.proposals}>
            <ListWrapper dense style={{ width }}>
              {Object.entries(proposals).map(([key, value], index) => {
                let f = () => history.push(`/proposal/${key}`)

                return (
                  <Item key={key} button onClick={f}>
                    <ListItemText primary={<label>{value.title}</label>}
                      secondary={
                        <div id={value.phase}>
                          <Lozenge isBold>
                            {value.phase}
                            </Lozenge>
                          <o> {Object.keys(proposals).length - (parseInt(index) + 1)} • {value.time}</o>
                        </div>
                      }
                    />
                    <ListItemText
                      primary={
                        <div className={classes.progress}>
                          <ProgressFor variant="determinate" value={value.yes} /> <span> {value.for}</span>
                        </div>
                      }
                      secondary={
                        <div className={classes.progress}>
                          <ProgressAgainst variant="determinate" value={value.no} /> <span> {value.against}</span>
                        </div>
                      }
                    />
                    <SecondaryAction>
                      {value.action && (
                        <ButtonPrimary variant='outlined'>
                          {value.label}
                        </ButtonPrimary>
                      )}
                      {!value.action && (
                        <label> {value.label}</label>
                      )}
                    </SecondaryAction>
                  </Item>
                );
              })}
            </ListWrapper>
           </div>
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}
