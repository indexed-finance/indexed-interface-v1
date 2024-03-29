import React, { Fragment, useState, useEffect, useContext } from "react"

import { styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText'
import Lozenge from '@atlaskit/lozenge'
import { useHistory, Link } from "react-router-dom";
import { BigNumber, formatBalance } from '@indexed-finance/indexed.js'

import Ndx from '../assets/constants/abi/Ndx.json'
import ButtonPrimary from '../components/buttons/primary'
import ButtonSecondary from '../components/buttons/secondary'
import Container from '../components/container'
import Input from '../components/inputs/input'
import Radio from '../components/inputs/radio'
import Canvas from '../components/canvas'
import Progress from '../components/progress'
import Stacked from '../components/charts/stacked'

import { TX_CONFIRMED, TX_REVERTED, TX_PENDING } from '../assets/constants/parameters'
import { isAddress } from '../assets/constants/functions'
import { NDX, ZERO_ADDRESS } from '../assets/constants/addresses'
import { toContract } from '../lib/util/contracts'
import { store } from '../state'

import style from '../assets/css/routes/governance'
import getStyles from '../assets/css'
import { getProposalState } from "../utils/proposal";

const INACTIVE = () => <span id='inactive'>INACTIVE</span>
const DELEGATED = () => <span id='delegated'>DELEGATED</span>
const ACTIVE = () => <span id='registered'>ACTIVE</span>

const AddressInput = styled(Input)({
  marginTop: 0,
  marginBottom: 7.5,
  width: '100%'
})

const ListWrapper = styled(List)({
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

const dummy = { snapshots: [], active: 0, inactive: 0, delegated: 0, voters: 0 }

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

      if(isDelegated !== ZERO_ADDRESS) setPhase(<Delegate show={true}/>)
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

  const delegateAddress = async(address, fallback) => {
    let { web3, account } = state
    let contract = toContract(web3.injected, Ndx.abi, NDX)

    try{
      await contract.methods.delegate(address).send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', async(conf, receipt) => {
        if(conf === 0){
          if(receipt.status == 1) {
            let isDelegated = await contract.methods.delegates(state.account).call()
            dispatch(TX_CONFIRMED(receipt.transactionHash))
            getStatus(isDelegated)
            fallback()
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
    if(delegate === state.account) {
      setStatus(ACTIVE)
    } else if(delegate !== ZERO_ADDRESS){
      setStatus(DELEGATED)
    } else {
      setStatus(INACTIVE)
    }
  }

  function Init(){
    return (
      <center style={{ paddingTop: 25 }}>
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
        await delegateAddress(state.account, trigger)
      } else {
        await trigger()
      }
    }

    return(
      <Fragment>
        <p style={{ marginBottom: 0 }}> You have not setup your wallet for voting yet, either for individual voting, or delegation. </p>
        <label style={{ width: '92.5%' }}>
          <b style={{ float: 'left'}}>
            INDIVIDUAL <Radio value={0} checked={selection == 0} onClick={handleSelection} color='#00e79a' />
          </b>
          <b style={{ float: 'right'}}>
            DELEGATION <Radio value={1} checked={selection == 1} onClick={handleSelection} color='orange' />
          </b>
        </label>
        <Grid item>
          <ButtonPrimary margin={{ marginLeft: 0 }} onClick={submit}> INITIALISE </ButtonPrimary>
        </Grid>
      </Fragment>
    )
  }

  function Delegate({ show }){
    const [ input, setInput ] = useState(null)
    const [ error, setError ] = useState(undefined)

    const handleInput = (event) => {
      setInput(event.target.value)
    }

    const clearInput = () => setInput(null)

    const submit = async() => {
       setError(undefined)

      if(isAddress(input)){
        await delegateAddress(input, clearInput)
      } else {
        setError('INVALID ADDRESS')
      }
    }

    return(
      <Fragment>
        <Grid item>
          <p style={{ marginTop: 5 }}> Delegate your votes to another address:</p>
          <AddressInput error={!!error} helperText={error} onChange={handleInput} value={input} variant="outlined" label='ADDRESS'/>
        </Grid>
        <Grid item>
          <ButtonPrimary onClick={submit} margin={{ marginTop: !state.native ? 0 : 5, marginLeft: 25, float: 'right' }}> DELEGATE </ButtonPrimary>
          {show && state.balances['NDX'].amount >= 100000 && (
            <Link to='/propose'>
              <ButtonSecondary style={{ margin: 0, marginTop: !state.native ? 0 : 12.5, float:'left' }}> CREATE PROPOSAL </ButtonSecondary>
            </Link>
          )}
          {!show && (
            <ButtonPrimary onClick={goBack} style={{ margin: 0, marginTop: !state.native ? 0 : 12.5,  float:'left' }}> GO BACK </ButtonPrimary>
          )}
        </Grid>
      </Fragment>
    )
  }

  useEffect(() => {
    getAccountMetadata()
  }, [ state.web3.injected ])

  useEffect(() => {
    const retrieveProposals = async() => {
      let { proposals, dailyDistributionSnapshots } = state.governance
      proposals = [...proposals];

      if((proposals.length > 0 || dailyDistributionSnapshots.length > 0) && state.request){
        let length = dailyDistributionSnapshots.length - 1
        let { active, inactive, delegated, voters } = dailyDistributionSnapshots[length]
        let recentBlock = await state.web3[process.env.REACT_APP_ETH_NETWORK].eth.getBlock('latest')

        setMetadata({
          snapshots: dailyDistributionSnapshots,
          active: parseFloat(formatBalance(new BigNumber(active), 18, 0)).toLocaleString(),
          inactive: parseFloat(formatBalance(new BigNumber(inactive), 18, 0)).toLocaleString(),
          delegated: parseFloat(formatBalance(new BigNumber(delegated), 18, 0)).toLocaleString(),
          voters: parseFloat(voters).toLocaleString(),
          block: recentBlock.number
        })
        proposals.sort((a, b) => b.id - a.id);
        setProposals(proposals)

        if(state.web3.injected) {
          getAccountMetadata()
        }
      }
    }
    retrieveProposals()
  }, [ , state.request, state.governance ])

  useEffect(() => {
    if(!state.load){
      dispatch({
        type: 'LOAD', payload: true
      })
    }
    setPhase(<Init />)
  }, [])

  let { height, margin, width, wallet, paddingLeft, tableHeight } = style.getFormatting({ native: state.native })

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='space-between'>
        <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item xs={12} md={5} lg={5} xl={5}>
            <Canvas native={state.native}>
              <div className={classes.wallet} style={{ height: wallet }}>
                <h3> BALANCE: {state.balances['NDX'].amount} NDX </h3>
                <h4> STATUS: {status}</h4>
                <Grid container direction='column' alignItems='flex-start' justify='space-between' style={{ height: `calc(${wallet} - 24%)` }}>
                  {phase}
                </Grid>
              </div>
            </Canvas>
          </Grid>
          <Grid item xs={12} md={7} lg={7} xl={7}>
            <Canvas native={state.native}>
              <div className={classes.chart}>
                <div className={classes.stats}>
                  <h3> TOTAL VOTERS: {metadata.voters}</h3>
                  <h4> NDX: $0.00</h4>
                </div>
                {!state.native && (
                  <div className={classes.legend} style={{ paddingLeft }}>
                    <ul>
                      <li> {metadata.inactive} NDX<div className={classes.one}/> </li>
                      <li> {metadata.active} NDX<div className={classes.two}/></li>
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
          <Container margin={margin} padding="1em 0em" title='PROPOSALS' >
           <div className={classes.proposals} style={{ height: tableHeight }}>
            <ListWrapper dense style={{ width }}>
              {proposals.map((p, index) => {
                let f = () => history.push(`/proposal/${p.id.toLowerCase()}`)
                let againstVotes = formatBalance(new BigNumber(p.against), 18, 4)
                let forVotes = formatBalance(new BigNumber(p.for), 18, 4)
                let proposalState = getProposalState(p, metadata.block)

                let values = { for: parseInt(p.for), against: parseInt(p.against) }

                return (
                  <Item key={p.id} button onClick={f}>
                    <ListItemText primary={<label>{p.title}</label>}
                      secondary={
                        <div id={proposalState}>
                          <Lozenge isBold>
                            {proposalState}
                            </Lozenge>
                          <o> {p.id} • {p.expiry}</o>
                        </div>
                      }
                    />
                    <ListItemText
                      primary={
                        <div className={classes.progress}>
                          <Progress width={200} color='#00e79a' values={values} option='for'/>
                          <span> {parseFloat(forVotes).toLocaleString()} NDX</span>
                        </div>
                      }
                      secondary={
                        <div className={classes.progress}>
                          <Progress width={200} color='#f44336' values={values} option='against' />
                          <span> {parseFloat(againstVotes).toLocaleString()} NDX</span>
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
