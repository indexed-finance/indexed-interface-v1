import React, { useContext, useState, useEffect, Fragment } from 'react'

import { motion, useAnimation } from 'framer-motion'
import { Link } from 'react-router-dom'

import { getResolutionThresholds } from '../assets/constants/functions'
import style from '../assets/css/components/banner'
import getStyles from '../assets/css'
import { store } from '../state'

const useStyles = getStyles(style)

const proposalType = {
  id: null,
  description: ''
}

export default function Banner() {
  const thresholds = getResolutionThresholds()
  const [ messages, setMessages ] = useState({ proposal: proposalType, init: [], indexes: [] })
  const [ coordinate, setCoordinate ] = useState({ x: thresholds[0], time: 0, elapsed: 0 })
  const [ timer, setTimer ] = useState(null)
  const controls = useAnimation()
  const classes = useStyles()

  let { state } = useContext(store)
  let { indexes, stats, native } = state

  let { width, position, marginBlock, duration } = style.getFormatting(native)

  const startAnimation = (gov) => {
    let timestamp = new Date(Date.now())
    let unixTime = timestamp.getTime()
    let startingPoint = !gov ? thresholds[0] * 0.675 : thresholds[0]

    console.log('START')

    setCoordinate({ x: 0, elapsed: 0, time: unixTime })
    controls.start({
      translateX: thresholds[1],
      transition:{
        from: startingPoint,
        ease: 'linear',
        repeat: Infinity,
        duration,
      }
    })
  }


  const stopAnimation = (e) => {
    if(messages.indexes.length > 0 )  {
      let currentTime = new Date(Date.now())
      // let subscriptions = [ ...controls.subscribers ]
      // let lastSubscription = subscriptions[subscriptions.length-1]
      // let x = lastSubscription.transform.translateX.replace(/[^0-9\-\.]/g, '')
      let lastTime = (currentTime.getTime() - coordinate.time)/1000
      let elapsed = coordinate.elapsed + lastTime

      if(elapsed >= duration){
        elapsed = ((lastTime/duration) % 1) * duration
        console.log('TIME OVERFLOW', elapsed, (lastTime/duration) % 1)
      }
      setCoordinate({ ...coordinate, elapsed })
      controls.stop()
    }
  }

  const replayAnimation = (time) => {
    window.clearTimeout(timer);
    let newTimer = setTimeout(function() { startAnimation(messages.proposal); }, time * 1000);
    setTimer(newTimer)
  }

  const resumeAnimation = (e) => {
    let timeRemaining = duration - coordinate.elapsed

    console.log('TIME REMAINING', timeRemaining)
    console.log('SECONDS ELAPSED', coordinate.elapsed)

    if(messages.indexes.length > 0){
      let currentTime = new Date(Date.now())
      let time = currentTime.getTime()

      setCoordinate({ ...coordinate, time })
      controls.start({
        translateX: thresholds[1],
        transition:{
          duration: timeRemaining,
          ease: 'linear',
        }
      }, replayAnimation(timeRemaining))
    }
  }

  useEffect(() => {
    if (Object.keys(state.proposals).length && state.proposals.proposals.length && !messages.proposal.id) {
      let arr = state.proposals.proposals
      let last = arr[arr.length-1]
      setMessages({
        ...messages,
        proposal: last || proposalType
      });
      startAnimation(last)
    }
  }, [state.proposals]);

  useEffect(() => {
    let [ init, indxs ] = [ [], [] ]
    
    if(
      Object.keys(indexes).length && !messages.indexes.length
    ) {
      Object.entries(indexes).map(([ key, value ]) => {
        if(value.active) indxs.push(value)
        else init.push(value)
      })
      setMessages({ ...messages, indexes: indxs, init, });
      startAnimation()
    }
  }, [ indexes ]);

  return(
    <div style={{ width, position, borderBottom: '3px solid #666666' }} id='carosuel' className={classes.root} >
      <motion.div
        className={classes.animation}
        initial={{ translateX: thresholds[0] }}
        animate={controls}
      >
      <motion.ul className={classes.carosuel} style={{ ...marginBlock }}>
        {messages.proposal.id && (
          <motion.li style={{ marginRight: 250 }} onMouseEnter={stopAnimation} onMouseLeave={resumeAnimation}>
            <Link to={`/proposal/${messages.proposal.id}`} className={classes.href}>
              <motion.span><motion.span style={{ color: '#645eff' }}>PROPOSAL {messages.proposal.id}</motion.span>: {messages.proposal.title}</motion.span>
            </Link>
          </motion.li>
        )}
        <motion.li style={{ marginRight: 250 }} onMouseEnter={stopAnimation} onMouseLeave={resumeAnimation}>
          {messages.init.length == 1 && (
            <Fragment>
              {messages.init.map((value, i) => {
                return(
                  <Link key={i} to={`/pool/${value.address}`} className={classes.href}>
                    <motion.span>NEW FUND: <motion.span style={{ color: 'orange'}}>{value.symbol}</motion.span></motion.span>
                  </Link>
                )
              })}
            </Fragment>
          )}
          {messages.init.length > 1 && (
            <Fragment>
              <span style={{ color: 'orange'}}>NEW FUNDS:</span>
              {messages.init.map((value, i) => (
                <Fragment key={i}>&nbsp;
                  <Link to={`/pool/${value.address}`} className={classes.href} >
                    <motion.span>{value.symbol}</motion.span>
                  </Link>
                  <motion.span>{i == messages.init.length-1 ? '' : ','}</motion.span>
                </Fragment>
              ))}
            </Fragment>
          )}
        </motion.li>
        <motion.li style={{ marginRight: 250 }} onMouseEnter={stopAnimation} onMouseLeave={resumeAnimation}>
          {messages.indexes.length >= 1 && (
            <Fragment>
              {messages.indexes.map((value, i) => {
                let color = value.delta > 0 ? '#00e79a': '#ff005a'
                let symbol = value.delta > 0 ? '+' : ''

                return(
                  <Fragment key={i}>
                    <Link to={`/index/${value.symbol}`} className={classes.href}>
                      <motion.span>{value.symbol} ${value.price} <motion.span style={{ color }}>({symbol}{value.delta}%)</motion.span></motion.span>
                    </Link>
                    <motion.span>&nbsp;&nbsp;&nbsp;</motion.span>
                  </Fragment>
                )
             })}
           </Fragment>
          )}
        </motion.li>
        <motion.li>
          <motion.span>TOTAL VALUE LOCKED: ${parseFloat(stats.totalLocked).toLocaleString()} </motion.span>
          <motion.span>&nbsp;&nbsp;&nbsp;</motion.span>
          <motion.span>24H VOLUME: ${parseFloat(stats.dailyVolume).toLocaleString()} </motion.span>
        </motion.li>
      </motion.ul>
     </motion.div>
    </div>
  )
}
