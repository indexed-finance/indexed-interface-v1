import React, { Fragment, useState, useEffect, useContext } from "react"

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
import { useHistory, Link } from "react-router-dom";
import { BigNumber, formatBalance } from '@indexed-finance/indexed.js'

import Ndx from '../assets/constants/abi/Ndx.json'
import ButtonPrimary from '../components/buttons/primary'
import ButtonSecondary from '../components/buttons/secondary'
import Container from '../components/container'
import Input from '../components/inputs/input'
import Radio from '../components/inputs/radio'
import Select from '../components/inputs/select'
import Canvas from '../components/canvas'
import Progress from '../components/progress'
import Stacked from '../components/charts/stacked'

import { TX_CONFIRMED, TX_REVERTED } from '../assets/constants/parameters'
import { balanceOf } from '../lib/erc20'
import { toContract } from '../lib/util/contracts'
import { store } from '../state'
import { getProposals } from '../api/gql'

import style from '../assets/css/routes/governance'
import getStyles from '../assets/css'

const NDX = '0x2342084baced2081093de5729de81fcb9de77ca6'
const NA = '0x0000000000000000000000000000000000000000'
const INACTIVE = () => <span id='inactive'>INACTIVE</span>
const DELEGATED = () => <span id='delegated'>DELEGATED</span>
const ACTIVE = () => <span id='registered'>ACTIVE</span>

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

const dummy = { snapshots: [], active: 0, inactive: 0, delegated: 0}

const useStyles = getStyles(style)

export default function Governance(){
  const [ proposals, setProposals ] = useState([])
  const [ phase, setPhase ] = useState(INACTIVE)
  const [ status, setStatus ] = useState(null)
  const [ metadata, setMetadata ] = useState(dummy)
  const history = useHistory()
  const classes = useStyles()

  let { dispatch, state } = useContext(store)

  const getAccountMetadata = async() => {
    let { web3, account } = state

    if(web3.injected) {
      let contract = toContract(web3.injected, Ndx.abi, NDX)
      let isDelegated = await contract.methods.delegates(account).call()
      let balance = await contract.methods.balanceOf(account).call()
      let amount = (parseFloat(balance)/Math.pow(10, 18))
      .toLocaleString({ minimumFractionDigits: 2 })

      if(isDelegated != NA) setPhase(<Delegate show={true}/>)
      else setPhase(<Activate trigger={renderDelegation}/>)

      getStatus(isDelegated)
      dispatch({ type: 'BALANCE',
        payload: {
          balances: {
            'NDX': { address: NDX, amount }
          }
        }
      })
    }
  }

  const delegateAddress = async(address) => {
    let { web3, account } = state
    let contract = toContract(web3.injected, Ndx.abi, NDX)

    try{
      await contract.methods.delegate(address).send({ from: account })
      .on('confirmaton', async(conf, receipt) => {
        if(conf == 0){
          if(receipt.status == 1) {
            let isDelegated = await contract.methods.delegates(state.account).call()
            dispatch(TX_CONFIRMED(receipt.transactionHash))
            getStatus(isDelegated)
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
    } catch(e) {}
  }


  const goBack = () => {
    setPhase(<Activate trigger={renderDelegation} />)
  }

  const renderDelegation = () => {
    setPhase(<Delegate show={false} />)
  }

  const getStatus = (delegate) => {
    if(delegate == state.account) {
      setStatus(ACTIVE)
    } else if(delegate != NA){
      setStatus(DELEGATED)
    } else {
      setStatus(INACTIVE)
    }
  }

  function Init(){
    return (
      <center style={{ paddingTop: '50%' }}>
        <p> Connect your web3 provider to continue </p>
      </center>
    )
  }

  function Activate({ trigger }){
    const [ selection, setSelection ] = useState(null)

    const handleSelection = (event) => {
      setSelection(event.target.value)
    }

    const submit = async() => {
      if(selection == 0) {
        await delegateAddress(state.account)
      }
      await trigger()
    }

    return(
      <Fragment>
        <p> You have not setup your wallet for voting yet, either for individual voting, or delegation. </p>
        <label>
          <b style={{ float: 'left'}}>
            INDIVIDUAL <Radio value={0} checked={selection == 0} onClick={handleSelection} color='#00e79a' />
          </b>
          <b style={{ float: 'right'}}>
            DELEGATION <Radio value={1} checked={selection == 1} onClick={handleSelection} color='orange' />
          </b>
          <ButtonPrimary onClick={submit}> INITIALISE </ButtonPrimary>
        </label>
      </Fragment>
    )
  }

  function Delegate({ show }){
    const [ input, setInput ] = useState(null)

    const handleInput = (event) => {
      setInput(event.target.value)
    }

    const submit = async() => {
      if(input != null) {
        await delegateAddress(input)
      }
    }

    return(
      <Fragment>
        <p> Allocate your votes to another address:</p>
        <AddressInput onChange={handleInput} value={input} variant="outlined" label='ADDRESS'/>
        <ButtonPrimary onClick={submit} margin={{  marginTop: 12.5, marginLeft: 25 }}> DELEGATE </ButtonPrimary>
        {show && (
          <Link to='/propose'>
            <ButtonSecondary style={{ marginTop: 12.5, marginLeft: 0, float:'left' }}> CREATE PROPOSAL </ButtonSecondary>
          </Link>
        )}
        {!show && (
          <ButtonPrimary onClick={goBack} style={{ marginTop: 12.5, marginLeft: 0, float:'left' }}> GO BACK </ButtonPrimary>
        )}
      </Fragment>
    )
  }

  useEffect(() => {
    getAccountMetadata()
  }, [ state.web3.injected ])

  useEffect(() => {
    const retrieveProposals = async() => {
      let { proposals, dailyDistributionSnapshots } = await getProposals()

      let length = dailyDistributionSnapshots.length - 1
      let { active, inactive, delegated } = dailyDistributionSnapshots[length]

      setMetadata({
        snapshots: dailyDistributionSnapshots,
        active: parseFloat(formatBalance(new BigNumber(active), 18, 0)).toLocaleString(),
        inactive: parseFloat(formatBalance(new BigNumber(inactive), 18, 0)).toLocaleString(),
        delegated: parseFloat(formatBalance(new BigNumber(delegated), 18, 0)).toLocaleString(),
       })
      setProposals(proposals)
    }

    if(state.web3.injected) {
      getAccountMetadata()
    }
    retrieveProposals()
    setPhase(<Init />)
  }, [])

  let { height, margin, width, wallet, paddingLeft } = style.getFormatting({ native: state.native })

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='space-between'>
        <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item xs={12} md={5} lg={5} xl={5}>
            <Canvas native={state.native}>
              <div className={classes.wallet} style={{ height: wallet }}>
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
                  <h3> TOTAL VOTERS: 4</h3>
                  <h4> SHARE VALUE: $0.00</h4>
                </div>
                {!state.native && (
                  <div className={classes.legend} style={{ paddingLeft }}>
                    <ul>
                      <li> {metadata.active} NDX<div className={classes.one}/> </li>
                      <li> {metadata.inactive} NDX<div className={classes.two}/></li>
                      <li> {metadata.delegated} NDX<div className={classes.three}/> </li>
                    </ul>
                  </div>
                )}
                <Stacked ready={metadata !== dummy} metadata={metadata.snapshots} height={height} />
              </div>
            </Canvas>
          </Grid>
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={12} className={classes.root}>
          <Container margin={margin} padding="1em 0em" title='PROPOSALS'>
           <div className={classes.proposals}>
            <ListWrapper dense style={{ width }}>
              {proposals.map((p, index) => {
                let f = () => history.push(`/proposal/${p.id.toLowerCase()}`)
                let againstVotes = formatBalance(new BigNumber(p.against), 18, 4)
                let forVotes = formatBalance(new BigNumber(p.for), 18, 4)
                let stateLabel ='active'

                if(parseInt(p.state) > 0) {
                  stateLabel = 'rejected'
                }

                let values = { for: parseInt(p.for), against: parseInt(p.against) }

                return (
                  <Item key={p.id} button onClick={f}>
                    <ListItemText primary={<label>{p.description}</label>}
                      secondary={
                        <div id='active'>
                          <Lozenge isBold>
                            {stateLabel}
                            </Lozenge>
                          <o> {proposals.length - (parseInt(index) + 1)} • {p.expiry}</o>
                        </div>
                      }
                    />
                    <ListItemText
                      primary={
                        <div className={classes.progress}>
                          <Progress width={200} color='#00e79a' values={values} option='for'/> <span> {forVotes} NDX </span>
                        </div>
                      }
                      secondary={
                        <div className={classes.progress}>
                          <Progress width={200} color='#ff005a' values={values} option='against' /> <span> {againstVotes} NDX</span>
                        </div>
                      }
                    />
                    <SecondaryAction>
                      {!isNaN(p.state)  && (
                        <ButtonPrimary variant='outlined'>
                          VOTE
                        </ButtonPrimary>
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
