import React, { useContext, useState, useEffect, Fragment } from 'react'

import { motion, useAnimation } from 'framer-motion'
import { Link } from 'react-router-dom'

import { getResolutionThresholds } from '../assets/constants/functions'
import style from '../assets/css/components/banner'
import getStyles from '../assets/css'
import { store } from '../state'

const useStyles = getStyles(style)

export default function Banner() {
  const thresholds = getResolutionThresholds()
  const [ messages, setMessages ] = useState({ proposals: [], init: [], indexes: [] })
  const [ coordinate, setCoordinate ] = useState({ x: thresholds[0], time: 0 })
  const controls = useAnimation()
  const classes = useStyles()

  let { state } = useContext(store)
  let { indexes, native } = state

  let { width, position, marginBlock, duration } = style.getFormatting(native)

  const startAnimation = () => {
    controls.start({
      translateX: thresholds[1],
      transition:{
        from: thresholds[0],
        ease: 'linear',
        repeat: Infinity,
        duration,
      }
    })
  }

  const stopAnimation = (e) => {
    if(messages.indexes.length > 0){
      setCoordinate({ x: e.pageX , time: e.timeStamp/1000 })

      controls.stop()
    }
  }

  const resumeAnimation = (e) => {
    let newDuration = duration - coordinate.time
    let distanceDisplaced = ((coordinate.x - thresholds[1]) + thresholds[1])
    let remainingDisplacement = thresholds[1] - distanceDisplaced
    let currentDisplacement = distanceDisplaced + thresholds[0]

    if(messages.indexes.length > 0){
      controls.start({
        translateX: remainingDisplacement * 1.05,
        transition:{
          duration: newDuration,
          ease: 'linear',
          onComplete: v => setCoordinate({ x: 0 })
        }
      })
    }
  }

  useEffect(() => {
    if(coordinate.x == 0) {
      startAnimation()
    }
  }, [ coordinate ])

  useEffect(() => {
    let [ proposals, init, indxs ] = [ [], [], [] ]

    if(Object.entries(indexes).length > 0) {
      Object.entries(indexes).map(([ key, value ]) => {
        if(value.active) indxs.push(value)
        else init.push(value)
      })
      setMessages({ indexes: indxs, init })
      startAnimation()
    }
  }, [ indexes ])

  return(
    <div style={{ width, position }} className={classes.root} onMouseEnter={stopAnimation} onMouseLeave={resumeAnimation}>
      <motion.div
        animate={controls}
      >
      <motion.ul className={classes.carosuel} style={{ ...marginBlock }}>
        <motion.li style={{ marginRight: 250 }}>
          <Link to={``} className={classes.href}>
            <motion.span><span style={{ color: '#645eff' }}>PROPOSAL 0x1</span>: CHANGE SWAP FEE TO 0.5%</motion.span>
          </Link>
        </motion.li>
        <motion.li style={{ marginRight: 250 }}>
          {messages.init.length == 1 && messages.init.map((value) => {
            return(
              <Link to={`/pool/${value.address}`} className={classes.href}>
                <motion.span>NEW FUND: <span style={{ color: 'orange'}}>{value.symbol}</span></motion.span>
             </Link>
            )
          })}
          {messages.init.length > 1 && (
            <Fragment>
              <span style={{ color: 'orange'}}>NEW FUNDS:</span>
                {messages.init.map((value, i) => (
                  <Fragment>&nbsp;
                    <Link to={`/pool/${value.address}`} className={classes.href} >
                      <motion.span>{value.symbol}</motion.span>
                    </Link>
                    <motion.span>{i == messages.init.length-1 ? '' : ','}</motion.span>
                  </Fragment>
                ))}
            </Fragment>
          )}
        </motion.li>
        <motion.li>
          {messages.indexes.length >= 1 && (
            <Fragment>
              {messages.indexes.map((value) => {
                let color = value.delta > 0 ? '#00e79a': '#00e79a'
                let symbol = value.delta > 0 ? '+' : '-'

                return(
                  <Fragment>
                    <Link to={`/index/${value.symbol}`} className={classes.href}>
                      <motion.span>{value.symbol} ${value.price} <span style={{ color }}>({symbol}{value.delta}%)</span></motion.span>
                    </Link>
                    <motion.span>&nbsp;&nbsp;&nbsp;</motion.span>
                  </Fragment>
                )
             })}
           </Fragment>
          )}
        </motion.li>
      </motion.ul>
     </motion.div>
    </div>
  )
}
