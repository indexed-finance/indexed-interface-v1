import React, { Fragment, useEffect, useState, useContext, useMemo } from 'react'

import Grid from '@material-ui/core/Grid'
import Lozenge from '@atlaskit/lozenge'
import jazzicon from '@metamask/jazzicon'
import ReactMarkdown from 'react-markdown'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import CountDown from 'react-countdown';
import { useParams } from 'react-router-dom'
import { toBN, formatBalance } from '@indexed-finance/indexed.js'

import GovernorAlpha from '../assets/constants/abi/GovernorAlpha.json'
import Ndx from '../assets/constants/abi/Ndx.json'

import ButtonPrimary from '../components/buttons/primary'
import Container from '../components/container'
import Radio from '../components/inputs/radio'
import Progress from '../components/progress'
import Canvas from '../components/canvas'

import { getProposalState, parseProposalCalls } from '../utils/proposal';

import { TX_CONFIRMED, TX_REVERTED, TX_PENDING, initialProposalState } from '../assets/constants/parameters'
import { NDX, DAO } from '../assets/constants/addresses'
import { toContract } from '../lib/util/contracts'
import style from '../assets/css/routes/proposal'
import getStyles from '../assets/css'
import { store } from '../state'
import { EtherscanUrl } from '../components/buttons/etherscan-link'
import { Link } from '@material-ui/core'
const dateFormat = require("dateformat");

const govABI = require('../assets/constants/abi/GovernorAlpha.json');

const useStyles = getStyles(style)

function Blockie({ address, id, width, border }) {
  let classes = useStyles()

  useEffect(() => {
    let element = document.getElementById(id)
    let parsed =  parseInt(address.slice(2, 10), 16)
    let blockie = jazzicon(width, parsed)

    blockie.style.float = 'left'
    blockie.style.borderRadius = '50px'
    blockie.style.border = `${border} solid #666666`

    element.appendChild(blockie)
  }, [ address ])

  return(
    <div className={classes.profile}>
      <a target='_blank' href={`https://etherscan.io/address/${address}`}>
        <div id={id} />
      </a>
    </div>
  )
}

export default function Proposal(){
  const [ component, setComponent ] = useState({ blockie: null, list: null })
  const [ isTransaction, setTransaction ] = useState(false)

  let { state, dispatch, handleTransaction } = useContext(store)
  let { id } = useParams()
  let { native } = state

  const [ metadata, setMetadata ] = useState(initialProposalState)
  // const [ weight, setWeight ] = useState(null)
  const [ input, setInput ] = useState(1);
  const [latestBlock, setLatestBlock] = useState(null);

  const classes = useStyles()

  const handleInput = (event) => {
    setInput(event.target.value)
  }

  const weight = useMemo(() => {
    const currentVotes = parseFloat(formatBalance(toBN(input == 1 ? metadata.against : metadata.for), 18, 4));
    const { amount } = parseFloat(state.balances['NDX'])
    let weight = 0;
    if (amount > 0) {
      if (currentVotes > 0) {
        weight = ((parseFloat(amount) / (currentVotes)) * 100).toFixed(2)
      } else {
        weight = 100;
      }
    }
    return weight;
  }, [ state.balances['NDX'], metadata.for, metadata.against, input ])

  const vote = async() => {
    let { web3, account } = state
    let decision = parseInt(input) === 1

    try {
      let contract = toContract(web3.injected, GovernorAlpha.abi, DAO)

      await contract.methods.castVote(id, decision).send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', (conf, receipt) => {
        if(conf === 0){
          if(receipt.status == 1) {
            dispatch(TX_CONFIRMED(receipt.transactionHash))
            setTransaction(true)
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
    } catch(e) {}
  }

  function Votes({ logs }) {
    return(
      <Fragment>
        {logs.map((value, i) => {
         let { id, voter, option, weight } = value
         const color = option ? '#00e79a' : '#f44336'
         const votingWeight = parseFloat(formatBalance(toBN(weight), 18, 2)).toLocaleString()
         const label = option ? '+' : '-'

         return (
            <ListItem button component='a' key={value.address} style={{ zIndex: 1}} target='_blank'
              href={`https://${process.env.REACT_APP_ETH_NETWORK === 'rinkeby' ? 'rinkeby.' : ''}etherscan.io/tx/${id}`}
            >
              <ListItemAvatar>
                <Blockie border='3px' width={35} id={voter} address={voter} />
               </ListItemAvatar>
               <ListItemText
                  primary={`${voter.substring(0, 6)}...${voter.substring(38, 64)}`}
                  secondary={<label style={{ color }}>{label}{votingWeight} NDX</label>}
                />
              <ListItemSecondaryAction />
           </ListItem>
          )
        })}
      </Fragment>
    )
  }

  function getProposalCalls() {
    const calls = parseProposalCalls(metadata);
    const mdLines = [];
    calls.forEach((propCall, i) => {
      const {
        target,
        targetName,
        fnName,
        paramsDisplay
      } = propCall;
      console.log(propCall)
      const etherscanUrl = EtherscanUrl({ type: 'account', entity: target });
      const text = `${1 + i}. [${targetName}](${etherscanUrl}).${fnName}(${paramsDisplay})`;
      mdLines.push(text);
    });
    return mdLines.join('\n');
  }

  useEffect(() => {
    if (state.governance.proposals.length === 0) return;
    const retrieveProposal = async() => {
      let proposal = state.governance.proposals.find(p => p.id === id)
      let recentBlock = await state.web3[process.env.REACT_APP_ETH_NETWORK].eth.getBlock('latest');

      setLatestBlock(parseInt(recentBlock.number));

      setComponent({
        blockie: <Blockie border='5px' width={radius} id='blockie' address={proposal.proposer} />,
        list: <Votes logs={proposal.votes} />
      })

      setMetadata(proposal)

      let { web3 } = state

      if(web3.injected) {
        let contract = toContract(web3.injected, Ndx.abi, NDX)
        let balance = await contract.methods.getPriorVotes(state.account, proposal.startBlock).call()
        let amount = formatBalance(toBN(balance), 18, 4)

        dispatch({ type: 'BALANCE',
          payload: {
            balances: {
              'NDX': { address: NDX, amount }
            }
          }
        })
      }
    }
    retrieveProposal()
  }, [ , state.governance ]);

  useEffect(() => {
    if(!state.load) {
      dispatch({ type: 'LOAD', payload: true })
    }
  }, []);

  async function execute() {
    const gov = toContract(state.web3.injected, govABI.abi, DAO);
    const fn = gov.methods.execute(metadata.id);
    await handleTransaction(fn.send({ from: state.account }))
      .then(() => {
        setMetadata({ ...metadata, state: 3 });
      });
  }

  function DisplayActionBox() {
    const propState = getProposalState(metadata, latestBlock);
    console.log(state.balances['NDX'].amount)
    if (propState === 'active') {
      return <div className={classes.modal}>
        <label>
          <b style={{ float: 'left'}}>
            FOR <Radio value={1} checked={input == 1} onClick={handleInput} color='#00e79a' />
          </b>
          <b style={{ float: 'right'}}>
            AGAINST <Radio value={0} checked={input == 0} onClick={handleInput} color='#f44336' />
          </b>
        </label>
        <p> VOTES: {parseFloat(state.balances['NDX'].amount).toLocaleString()} NDX </p>
        <p> IMPACT: <span> {weight || 0}% </span> </p>
        <ButtonPrimary variant='outlined' style={{ marginBottom: 25 }} onClick={vote} disabled={!(state.balances['NDX'].amount) || !parseFloat(state.balances['NDX'].amount)}>
          VOTE
        </ButtonPrimary>
      </div>
    }
    function DisplayVotes() {
      return <label>
        <b style={{ float: 'left'}}>
          FOR {formatBalance(toBN(metadata.for), 18, 4)}
        </b>
        <b style={{ float: 'right'}}>
          AGAINST {formatBalance(toBN(metadata.against), 18, 4)}
        </b>
      </label>
    }
    if (propState === 'expired') {
      return <div className={classes.modal}>
        
        <p> Proposal Has Expired </p>
      </div>
    }
    if (propState === 'canceled') {
      return <div className={classes.modal}>
        <DisplayVotes />
        <p> Proposal Canceled </p>
      </div>
    }
    if (propState === 'queued') {
      const timestamp = (metadata.eta * 1000);
     
      if (new Date().getTime() > timestamp) {
        return <div className={classes.modal}>
          <DisplayVotes />
          <p>Proposal Ready To Be Executed</p>
          <ButtonPrimary variant='outlined' style={{ marginBottom: 25 }} disabled={!state.account} onClick={execute}>Execute</ButtonPrimary>
        </div>
      }
      const readyDate = new Date(timestamp);
      const dateString = dateFormat(readyDate, 'UTC:mmm d, yyyy, h:MM TT');
      return <div className={classes.modal}>
        <DisplayVotes />
        <p>Ready At: {dateString} UTC</p>
        <p>Time Left: <CountDown date={timestamp} /></p>
      </div>
    }
    return <div className={classes.modal}>
      <DisplayVotes />
      <p>Proposal Has Been Executed</p>
    </div>
  }

  let { margin, marginX, width, paddingLeft, progress, radius, marginTop } = style.getFormatting({ native })

  let forVotes = formatBalance(toBN(metadata.for), 18, 2)
  let againstVotes = formatBalance(toBN(metadata.against), 18, 2)
  let values = { for: parseInt(metadata.for), against: parseInt(metadata.against) }

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='space-evenly'>
        <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item xs={12} md={8} lg={8} xl={8}>
            <Canvas native={state.native}>
              <div className={classes.proposal}>
                <div className={classes.header}>
                  {component.blockie}
                  <div className={classes.title} style={{ width }}>
                    <div className={classes.lozenge}>
                      <div id={getProposalState(metadata, latestBlock)}>
                        <Lozenge isBold> {getProposalState(metadata, latestBlock)} </Lozenge>
                      </div>
                    </div>
                    <h3> {metadata.title}</h3>
                    {!state.native && (
                      <div className={classes.reciept}>
                        <span>{metadata.proposer.substring(0, 6)}...{metadata.proposer.substring(38, 64)} • </span>
                        <Link target="_blank" href={EtherscanUrl({ type: 'countdown', entity: metadata.expiry })} rel='noreferrer'>
                          End Block: {metadata.expiry}
                        </Link>
                      </div>
                    )}
                  </div>
                  {state.native && (
                    <div className={classes.author} style={{ marginTop }}>
                      <p>{metadata.proposer.substring(0, 4)}...{metadata.proposer.substring(38, 64)} </p>
                      <p>{metadata.expiry} </p>
                    </div>
                  )}
              </div>
              <div className={classes.results}>
                <div className={classes.option}>
                  <div className={classes.vote}> FOR </div>
                  <span className={classes.progress}>
                    <Progress color='#00e79a' width={progress} values={values} option='for' />
                    <span> {parseFloat(forVotes).toLocaleString()} NDX</span>
                  </span>
                </div>
                <div className={classes.option}>
                  <div className={classes.vote}> AGAINST </div>
                  <span className={classes.progress}>
                    <Progress color='#f44336' width={progress} values={values} option='against' />
                    <span> {parseFloat(againstVotes).toLocaleString()} NDX</span>
                  </span>
                </div>
              </div>
            </div>
          </Canvas>
        </Grid>
        <Grid item xs={12} md={4} lg={4} xl={4}>
          <div className={classes.column}>
            <Canvas native={state.native}>
              <DisplayActionBox />
            </Canvas>
            <Container margin={marginX} title='VOTES' padding='1em 0em'>
              <div className={classes.log} style={{ overflow: 'auto' }}>
                <List dense classes={classes.table}>
                  {component.list}
                </List>
              </div>
            </Container>
          </div>
        </Grid>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
        <Grid item xs={12} md={8} lg={8} xl={8}>
           <Container title='DETAILS' margin={margin} padding="1em 0em">
            <div className={classes.body} style={{ overflowWrap: 'anywhere' }}>
              <div className={classes.metadata}>
                <ul>
                  <ReactMarkdown source={getProposalCalls()} />
                </ul>
              </div>
              <div className={classes.markdown}>
                <ReactMarkdown source={metadata.description} />
              </div>
            </div>
          </Container>
        </Grid>
      </Grid>
    </Grid>
  </Fragment>
  )
}
