import React from 'react'

import { motion } from 'framer-motion'

import style from '../assets/css/components/banner'
import getStyles from '../assets/css'

const useStyles = getStyles(style)

export default function Banner({ metadata, native }) {
  const classes = useStyles()

  let { width, position, marginBlock } = style.getFormatting(native)

  return(
    <div style={{ width, position }} className={classes.root} >
      <motion.div
        initial={{ translateX: -1600 }}
        animate={{ translateX: 1500 }}
        transition={{ ease: 'linear', repeat: Infinity, duration: 35 }}
      >
      <motion.ul className={classes.carosuel} style={{ ...marginBlock }}>
        <motion.li style={{ marginRight: 500 }}>
          <motion.span>PROPOSAL 0x1: CHANGE SWAP FEE TO 0.5%</motion.span>
        </motion.li>
        <motion.li>
          <motion.span>DFI6r $530.45 <span style={{ color: 'red' }}>(- 0.34%)</span></motion.span>
          <motion.span>&nbsp;&nbsp;&nbsp;</motion.span>
          <motion.span>GOVI5r $2,303.08  <span style={{ color: '#00e79a' }}>(+ 12.42%)</span></motion.span>
        </motion.li>
      </motion.ul>
     </motion.div>
    </div>
  )
}
