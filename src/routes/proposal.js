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

import ButtonPrimary from '../components/buttons/primary'
import Container from '../components/container'
import Radio from '../components/inputs/radio'
import Progress from '../components/progress'
import Canvas from '../components/canvas'

import style from '../assets/css/routes/proposal'
import getStyles from '../assets/css'
import { store } from '../state'

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

export default function Proposal(){
  let { state } = useContext(store)
  let { tx } = useParams()

  const [ metadata, setMetadata ] = useState(state.proposals[tx])
  const classes = useStyles()

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

  let { margin, width, progress, radius, percent } = styled.getFormatting(state)

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='space-evenly'>
        <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item xs={12} md={8} lg={8} xl={8}>
            <Canvas native={state.native}>
              <div className={classes.proposal}>
                <div className={classes.header}>
                  <Blockie border='5px' width={radius} id='blockie' address={metadata.author} />
                  <div className={classes.title} style={{ width }}>
                    <div className={classes.lozenge}>
                      <div id={metadata.phase}>
                        <Lozenge isBold> {metadata.phase} </Lozenge>
                      </div>
                    </div>
                    <h3> {metadata.title}</h3>
                    {!state.native && (
                      <div className={classes.reciept}>
                        <span>{metadata.author.substring(0, 6)}...{metadata.author.substring(38, 64)} • </span>  {metadata.time}
                      </div>
                    )}
                  </div>
                  {state.native && (
                    <p>{metadata.author.substring(0, 4)}...{metadata.author.substring(38, 64)} </p>
                  )}
                  {state.native && (
                    <p>{metadata.time} </p>
                  )}
              </div>
              <div className={classes.results}>
                <div className={classes.option}>
                  <div className={classes.vote}> AGAINST </div>
                  <span className={classes.progress}>
                    <Progress color='#ff005a' width={progress} variant="determinate" value={metadata.no} /> <span> {metadata.against}</span>
                  </span>
                </div>
                <div className={classes.option}>
                  <div className={classes.vote}> FOR </div>
                  <span className={classes.progress}>
                    <Progress color='#00e79a' width={progress} variant="determinate" value={metadata.yes} /> <span> {metadata.for}</span>
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
                  <b style={{ float: 'left'}}> FOR <Radio color='#00e79a' /></b>
                  <b style={{ float: 'right'}}> AGAINST <Radio color='#ff005a' /></b>
                </label>
                <p> WEIGHT: 0 NDX </p>
                <p> IMPACT: <span> 0% </span> </p>
                <ButtonPrimary variant='outlined' style={{ marginBottom: 25 }}>
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
                  {proposal.map((action, index) => (
                    <Fragment>
                      <span> {index}. </span>
                        <li>
                          Call <ReactMarkdown source={" `" + action.function + "` "}/> in
                          <ReactMarkdown source={" [" + action.contract + "] "}/>
                          with parameters;
                          <ReactMarkdown source={" `" + action.parameters.join(', ') + "` "}/>
                        </li>
                    </Fragment>
                  ))}
                </ul>
              </div>
              <div className={classes.markdown}>
                <ReactMarkdown source={source} />
              </div>
            </div>
          </Container>
        </Grid>
        <Grid item xs={12} md={4} lg={4} xl={4}>
          <Canvas native={state.native}>
            <div className={classes.log}>
              <List dense classes={classes.table}>
                {votes.map((value) => {
                   let { address, choice, weight } = value
                   const color = choice == 'FOR' ? '#00e79a' : '#ff005a'

                   return (
                     <ListItem key={value.address} button>
                       <ListItemAvatar>
                         <Blockie border='3px' width={35} id={address} address={address} />
                       </ListItemAvatar>
                        <ListItemText
                          primary={`${address.substring(0, 6)}...${address.substring(38, 64)}`}
                          secondary={<b style={{ color }}>{value.choice}</b>}
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
