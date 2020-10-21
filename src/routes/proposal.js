import React, { Fragment, useEffect, useState, useContext } from 'react'

import { makeStyles, styled, withStyles } from '@material-ui/core/styles'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import Grid from '@material-ui/core/Grid'
import Lozenge from '@atlaskit/lozenge'
import jazzicon from '@metamask/jazzicon'
import ReactMarkdown from 'react-markdown'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';
import { useParams } from 'react-router-dom'

import GovernorAlpha from '../assets/constants/abi/GovernorAlpha.json'
import Ndx from '../assets/constants/abi/Ndx.json'

import ButtonPrimary from '../components/buttons/primary'
import Container from '../components/container'
import Radio from '../components/inputs/radio'
import Progress from '../components/progress'
import Canvas from '../components/canvas'

import { toContract } from '../lib/util/contracts'
import style from '../assets/css/routes/proposal'
import getStyles from '../assets/css'
import { store } from '../state'
import { getProposal } from '../api/gql'

const DAO = '0x5220b03Cc2F5f8f38dC647636d71582a38365E72'
const NDX = '0xe366577a6712591c2e6f76fdcb96a99ac30a74c3'

const useStyles = getStyles(style)

const proposal = [
  { function: 'addCategory()', contract: 'PoolController', parameters: ['GOVERNANCE', 'GOV'] },
  { function: 'deployIndex()', contract: 'PoolController', parameters: ['GOVERNANCE INDEX 3', 'GOVI3', '100'] },
  { function: 'startLiquidityOffering()', contract: 'BPool', parameters: ['GOVI3', '0x455543'] }
]

const votes = [
  { address: '0xd0e744efcb37f1604124a809cd539d311974d1fd', choice: 'FOR', weight: '100 NDX' },
  { address: '0x989ce64cadfe60c433537790159ebeffc6490b5b', choice: 'FOR', weight: '503 NDX' },
  { address: '0x5f15b597e1117d804a7c0e1a247ddf93599c088e', choice: 'FOR', weight: '12 NDX' },
  { address: '0xf25d276e73201f3564a93a3f98c9684984452f44', choice: 'AGAINST', weight: '5 NDX' },
  { address: '0xc521047cc8a7335ea4f2062f0d02f7e6efcc8bdb', choice: 'FOR', weight: '34 NDX' },
  { address: '0x097310d37f2ee805204861ed7449fee50366bee5', choice: 'AGAINST', weight: '750 NDX' },
]

const source = `
Given the recent traction of governance tokens in the space, it is a clear primer
to decentralisation for any modern-day crypto protocol. The ability to give users
the right to delegate their perspectives is a powerful tool to be reckoned with,
there is clear evidence in this when we look to notorious decentralized applications
like [Uniswap](https://uniswap.exchange) (UNI), [Compound](https://compound.finance)
(COMP) and [Balancer](https://Balancer.exchange) (BAL), with regards to their recent
pushes of democratization through allocating votes as tokenised goods.

> Governance tokens combined marketcaps total to $5,300,000,000 as of typing

I propose that we make this niche of the crypto asset class, into it's own incubated
indexes so that, individuals can proactively invest (and potentially participate?) in
the leading forms of distributed governance in the market today.

~~~
NAME: GOVERNANCE
SYMBOL: GOV
~~~

With this I also propose that, that a liquidity offering is held to bootstrap the first
fund within this category, I suggest the initial assets and weights should be aligned such
as so:

~~~
NAME: GOVERNANCE INDEX 3
SYMBOL: GOVI3
SIZE: 3

COMP: 30%
UNI: 50%
BAL: 20%
~~~

Cast your votes people, to agree or disagree is up to you.

`

const dummy = { title: null, description: null, votes: [], for: 0, against: 0, state: 0, action: null, expiry: 0, proposer: '0x0000000000000000000000000000000000000000', targets: [], calldatas: [], signatures: [] }

export default function Proposal(){
  let { state, dispatch } = useContext(store)
  let { id } = useParams()

  const [ metadata, setMetadata ] = useState(dummy)
  const [ weight, setWeight ] = useState(null)
  const [ input, setInput ] = useState(null)
  const classes = useStyles()

  const handleInput = (event) => {
    let weight = event.target.value == 1 ? metadata.for : metadata.against
    let { amount } = state.balances['NDX']

    if(weight > 0) {
      weight = ((parseFloat(amount) / (parseInt(weight)/Math.pow(10, 18))) * 100)
    } else {
      weight = 100
    }

    setInput(event.target.value)
    setWeight(weight)
  }

  const vote = async() => {
    let { web3, account } = state
    let contract = toContract(web3.injected, GovernorAlpha.abi, DAO)
    let decision = input === 1

    await contract.methods.castVote(id, decision).send({ from: account })
  }

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
    }, [])

    return(
      <div className={classes.profile}>
        <a target='_blank' href={`https://etherscan.io/address/${address}`}>
          <div id={id} />
        </a>
      </div>
    )
  }

  useEffect(() => {
    const getAccountMetadata = async() => {
      let { web3 } = state

      if(web3.injected) {
        let contract = toContract(web3.injected, Ndx.abi, NDX)
        let balance = await contract.methods.balanceOf(state.account).call()
        let amount = (parseFloat(balance)/Math.pow(10, 18)).toLocaleString(
          undefined, { minimumFractionDigits: 2 }
        )

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
    const retrieveProposal = async() => {
      let proposal = await getProposal(id)
      setMetadata(proposal)
    }
    retrieveProposal()
  }, [])

  let { margin, width, progress, radius, percent } = style.getFormatting(state)

  let forVotes = (parseFloat(metadata.for)/Math.pow(10, 18)).toLocaleString()
  let againstVotes = (parseFloat(metadata.against)/Math.pow(10, 18)).toLocaleString()
  let stateLabel ='active'

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='space-evenly'>
        <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item xs={12} md={8} lg={8} xl={8}>
            <Canvas native={state.native}>
              <div className={classes.proposal}>
                <div className={classes.header}>
                  <Blockie border='5px' width={radius} id='blockie' address={metadata.proposer} />
                  <div className={classes.title} style={{ width }}>
                    <div className={classes.lozenge}>
                      <div id={stateLabel}>
                        <Lozenge isBold> {stateLabel} </Lozenge>
                      </div>
                    </div>
                    <h3> {metadata.description}</h3>
                    {!state.native && (
                      <div className={classes.reciept}>
                        <span>{metadata.proposer.substring(0, 6)}...{metadata.proposer.substring(38, 64)} • </span>  {metadata.expiry}
                      </div>
                    )}
                  </div>
                  {state.native && (
                    <p>{metadata.proposer.substring(0, 4)}...{metadata.proposer.substring(38, 64)} </p>
                  )}
                  {state.native && (
                    <p>{metadata.expiry} </p>
                  )}
              </div>
              <div className={classes.results}>
                <div className={classes.option}>
                  <div className={classes.vote}> AGAINST </div>
                  <span className={classes.progress}>
                    <Progress color='#ff005a' width={progress} value={parseInt(metadata.for)} /> <span> {forVotes}</span>
                  </span>
                </div>
                <div className={classes.option}>
                  <div className={classes.vote}> FOR </div>
                  <span className={classes.progress}>
                    <Progress color='#00e79a' width={progress} value={parseInt(metadata.against)} /> <span> {againstVotes}</span>
                  </span>
                </div>
              </div>
            </div>
          </Canvas>
        </Grid>
        <Grid item xs={12} md={4} lg={4} xl={4}>
          <div className={classes.column}>
            <Canvas native={state.native}>
              <div className={classes.modal}>
                <label>
                  <b style={{ float: 'left'}}>
                    FOR <Radio value={1} checked={input == 1} onClick={handleInput} color='#00e79a' />
                  </b>
                  <b style={{ float: 'right'}}>
                    AGAINST <Radio value={0} checked={input == 0} onClick={handleInput} color='#ff005a' />
                  </b>
                </label>
                <p> WEIGHT: {state.balances['NDX'].amount} NDX </p>
                <p> IMPACT: <span> {weight}% </span> </p>
                <ButtonPrimary variant='outlined' style={{ marginBottom: 25 }} onClick={vote}>
                  VOTE
                </ButtonPrimary>
              </div>
            </Canvas>
          </div>
        </Grid>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
        <Grid item xs={12} md={8} lg={8} xl={8}>
           <Container title='DETAILS' margin={margin} padding="1em 0em" percentage={percent}>
            <div className={classes.body}>
              <div className={classes.metadata}>
                <ul>
                  {metadata.targets.map((contract, i) => (
                    <Fragment>
                      <span> {i}. </span>
                        <li>
                          Call <ReactMarkdown source={" `" + metadata.signatures[i] + "` "}/> in
                          <ReactMarkdown source={" [" + contract + "] "}/>
                          with parameters;
                          <ReactMarkdown source={" `" + metadata.calldatas[i] + "` "}/>
                        </li>
                    </Fragment>
                  ))}
                </ul>
              </div>
              <div className={classes.markdown}>
                <ReactMarkdown source={metadata.description} />
              </div>
            </div>
          </Container>
        </Grid>
        <Grid item xs={12} md={4} lg={4} xl={4}>
          <Canvas native={state.native}>
            <div className={classes.log}>
              <List dense classes={classes.table}>
                {metadata.votes.map((value) => {
                   let { id, voter, option, weight } = value
                   const color = option ? '#00e79a' : '#ff005a'
                   const label = option ? 'FOR' : 'AGAINST'

                   return (
                     <ListItem key={value.address} button href='https://google.com'>
                       <ListItemAvatar>
                         <Blockie border='3px' width={35} id={voter} address={voter} />
                       </ListItemAvatar>
                        <ListItemText
                          primary={`${voter.substring(0, 6)}...${voter.substring(38, 64)}`}
                          secondary={<b style={{ color }}>{label}</b>}
                        />
                        <ListItemSecondaryAction />
                     </ListItem>
                    )
                  })}
              </List>
            </div>
          </Canvas>
        </Grid>
      </Grid>
    </Grid>
  </Fragment>
  )
}
