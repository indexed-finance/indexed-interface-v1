import React, { Fragment, useEffect, useState, useContext } from 'react'

import { makeStyles, styled, withStyles } from '@material-ui/core/styles'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import Grid from '@material-ui/core/Grid'
import Lozenge from '@atlaskit/lozenge'
import jazzicon from '@metamask/jazzicon'
import LinearProgress from '@material-ui/core/LinearProgress'
import ReactMarkdown from 'react-markdown'
import Radio from '@material-ui/core/Radio';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';
import { useParams } from 'react-router-dom'

import ButtonPrimary from '../components/buttons/primary'
import Donut from '../components/charts/donut'
import Heatmap from '../components/charts/heatmap'
import Container from '../components/container'
import Canvas from '../components/canvas'

import { store } from '../state'

const Main = styled(Canvas)({
  marginTop: '3em',
  marginBottom: '1em'
})

const Secondary = styled(Container)({
  marginTop: '1em',
  marginBottom: '.5em'
})

const Map = styled(Canvas)({
  marginTop: '1.5em',
  marginRight: '1.5em'
})

const Modal = styled(Canvas)({
  marginTop: '3em',
  marginRight: '3em',
  marginLeft: '0em'
})

const Log = styled(Canvas)({
  marginTop: '-4.25em',
  marginRight: '3em',
  marginLeft: '0em'
})

const GraphCanvas = styled(Canvas)({
  marginTop: '1.5em',
  marginLeft: 0
})

const useStyles = makeStyles((theme) => ({
  root: {
    width: 'auto'
  },
  proposal: {
    paddingTop: 25,
  },
  body: {
    width: '100%',
    paddingTop: 25,
  },
  markdown: {
    fontSize: 16,
    paddingLeft: 35,
    paddingTop: 20,
    paddingRight: 35,
    '& a': {
      color: 'orange'
    }
  },
  pie: {
    paddingTop: 25,
    paddingBottom: 25
  },
  heatmap: {
    width: 200,
    height: 200,
    marginTop: -26.75,
    marginRight: -12.5,
    '& svg': {
      transform: 'rotate(-.05deg)'
    }

  },
  header: {
    borderBottom: '2px solid #666666',
    overflow: 'hidden',
    paddingBottom: 25,
    paddingLeft: 30
  },
  profile: {
    marginRight: 50
  },
  results: {
    paddingTop: 37.5,
    paddingLeft: 32.5,
    paddingRight: 25,
    paddingBottom: 12.5,
  },
  history: {
    width: 637.5,
    height: 175
  },
  progress: {
    display: 'inline-block',
    marginBottom: 25,
    '& span': {
      marginLeft: 25
    },
  },
  modal: {
    height: 250,
    paddingLeft: 25,
    paddingTop: 12.5,
    paddingRight: 25,
    '& label': {
      display: 'block',
      marginBottom: 50,
      fontSize: 18,
    },
    '& p span': {
      color: '#00e79a'
    }
  },
  log: {
    width: 275,
    height: 300,
    float: 'right',
    paddingLeft: 25,
    paddingTop: 12.5,
    paddingRight: 25,
  },
  table: {
    overflowY: 'scroll',
  },
  title: {
    display: 'inline-block',
    marginLeft: 25,
    '& #active': {
      display: 'inline-block',
    },
    '& h3': {
      float: 'right',
      marginLeft: 25,
      marginTop: 10,
      fontSize: 20
    },
  },
  reciept: {
    color: '#645eff',
    '& span': {
      color: '#666666',
      marginTop: 5
    }
  },
  vote: {
    width: 150,
    float: 'left',
    color: '#999999'
  },
  column: {
  },
  lozenge: {
    float: 'left'
  },
  metadata: {
    lineHeight: 1.5,
    '& p': {
      display: 'contents',
    },
    '& ul': {
      borderTop: '3px solid #666666',
      padding: 0,
      margin: 0,
     '& li': {
       borderBottom: '3px solid #666666',
       listStyle: 'none',
       paddingLeft: 35,
       paddingRight: 35,
       paddingTop: 15,
       paddingBottom: 15,
     },
     '& span': {
       display: 'block',
       float: 'left',
       paddingLeft: 35,
       paddingTop: 27.5,
       paddingRight: 25,
       paddingBottom: 27.5,
     }
    },
    '& a': {
      color: 'orange'
    },
  }
}))

const ProgressFor = withStyles((theme) => ({
  root: {
    height: 15,
    borderRadius: 10,
    width: 325,
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
    height: 15,
    borderRadius: 10,
    width: 325,
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

const AgainstRadio = withStyles({
  root: {
    color: '#ff005a',
    '&$checked': {
      color: '#ff005a',
    },
  },
  checked: {},
})((props) => <Radio color="default" {...props} />);

const ForRadio = withStyles({
  root: {
    color: '#00e79a',
    '&$checked': {
      color: '#00e79a',
    },
  },
  checked: {},
})((props) => <Radio color="default" {...props} />);

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

  let margin = !state.native ? '2em 1.5em' : '1.5em 1.5em'

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='space-evenly'>
        <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item xs={12} md={8} lg={8} xl={8}>
            <Main native={state.native}>
              <div className={classes.proposal}>
                <div className={classes.header}>
                  <Blockie border='5px' width={67.5} id='blockie' address={metadata.author} />
                  <div className={classes.title}>
                    <div className={classes.lozenge}>
                      <div id={metadata.phase}>
                        <Lozenge isBold> {metadata.phase} </Lozenge>
                      </div>
                    </div>
                    <h3> {metadata.title}</h3>
                    <div className={classes.reciept}>
                      <span>{metadata.author.substring(0, 6)}...{metadata.author.substring(38, 64)} • </span> {metadata.time}
                    </div>
                </div>
              </div>
              <div className={classes.results}>
                <div className={classes.option}>
                  <div className={classes.vote}> AGAINST </div>
                  <span className={classes.progress}>
                    <ProgressAgainst variant="determinate" value={metadata.no} /> <span> {metadata.against}</span>
                  </span>
                </div>
                <div className={classes.option}>
                  <div className={classes.vote}> FOR </div>
                  <span className={classes.progress}>
                    <ProgressFor variant="determinate" value={metadata.yes} /> <span> {metadata.for}</span>
                  </span>
                </div>
              </div>
            </div>
          </Main>
        </Grid>
        <Grid item xs={12} md={4} lg={4} xl={4}>
          <div className={classes.column}>
            <Modal native={state.native}>
              <div className={classes.modal}>
                <label>
                  <b style={{ float: 'left'}}> FOR <ForRadio /></b>
                  <b style={{ float: 'right'}}> AGAINST <AgainstRadio /></b>
                </label>
                <p> WEIGHT: 0 NDX </p>
                <p> IMPACT: <span> 0% </span> </p>
                <ButtonPrimary variant='outlined'>
                  VOTE
                </ButtonPrimary>
              </div>
            </Modal>
          </div>
        </Grid>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
        <Grid item xs={12} md={8} lg={8} xl={8}>
           <Secondary title='DETAILS' margin={margin} padding="1em 0em" percentage="17.5%">
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
          </Secondary>
        </Grid>
        <Grid item xs={12} md={4} lg={4} xl={4}>
          <Log native={state.native}>
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
          </Log>
        </Grid>
      </Grid>
    </Grid>
  </Fragment>
  )
}
