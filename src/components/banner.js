import React from 'react'

import { motion } from 'framer-motion'

import style from '../assets/css/components/banner'
import getStyles from '../assets/css'

const useStyles = getStyles(style)

export default function Banner({ metadata }) {
  const classes = useStyles()

  return(
    <div className={classes.root}>
      <motion.div
        initial={{ translateX: -1500 }}
        animate={{ translateX: 1000 }}
        transition={{ ease: 'linear', repeat: Infinity, duration: 25 }}
      >
      <motion.p style={{ marginBlockStart: '.5em',  marginBlockEnd: '.5em' }}>
        <motion.span>PROPOSAL 0x1: CHANGE SWAP FEE TO 0.5%</motion.span>
        <motion.span>&nbsp;&nbsp;&nbsp;</motion.span>
        <motion.span>&nbsp;&nbsp;&nbsp;</motion.span>
        <motion.span>&nbsp;&nbsp;&nbsp;</motion.span>
        <motion.span>&nbsp;&nbsp;&nbsp;</motion.span>
        <motion.span>&nbsp;&nbsp;&nbsp;</motion.span>
        <motion.span>&nbsp;&nbsp;&nbsp;</motion.span>
        <motion.span>&nbsp;&nbsp;&nbsp;</motion.span>
        <motion.span>DFI6r $530.45 (+ 0.34%)</motion.span>
        <motion.span>&nbsp;&nbsp;&nbsp;</motion.span>
        <motion.span>GOVI5r $2,303.08 (+ 12.42%)</motion.span>
      </motion.p>
      </motion.div>
    </div>
  )
}
