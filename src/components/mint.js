import React, { useState} from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import Grid from '@material-ui/core/Grid'

import { tokenMetadata } from '../assets/constants/parameters'

import NumberFormat from '../utils/format'
import ButtonPrimary from './buttons/primary'
import Adornment from './inputs/adornment'
import Input from './inputs/input'
import Radio from './inputs/radio'

const OutputInput = styled(Input)({
  width: 250,
  marginLeft: 85,
  marginTop: 75
})

const AmountInput = styled(Input)({
  width: 100,
  '& label': {
    fontSize: 12
  },
  '& fieldset': {
    borderWidth: 1,
  },
  '& input:valid + fieldset': {
    borderColor: '#999999',
    borderWidth: '1px !important',
  },
  '& input:invalid + fieldset': {
    borderColor: 'red',
    borderWidth: '1px !important',
  },
  '& input:valid:focus + fieldset': {
    borderWidth: '1px !important',
  }
})

const RecieveInput = styled(Input)({
  width: 250,
  marginLeft: -22.5
})

const Trigger = styled(ButtonPrimary)({
  marginTop: -7.5
})

const SecondaryActionAlt = styled(ListItemSecondaryAction)({
  top: '70%'
})

const SecondaryItemText =  styled(ListItemText)({
  margin: 0,
  marginRight: 50,
  paddingLeft: 0,
  '& span': {
    fontSize: 12
  },
  '& .MuiListItemText-secondary': {
    fontSize: 12
  },
  '& .MuiListItemText-primary': {
    fontSize: 10
  }
})

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    maxWidth: 752,
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
    paddingBottom: 0,
    marginBottom: 0
  },
  title: {
    margin: theme.spacing(4, 0, 2),
  },
  list: {
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginLeft: 0,
    padding: 0,
    overflowY: 'scroll',
    height: 205,
    width: 410
  },
  item: {
    borderBottom: 'solid 2px #666666',
    paddingBottom: 17.5,
    paddingTop: 17.5,
    fontSize: 12
  },
  divider: {
    borderTop: '#666666 solid 1px',
    borderBottom: '#666666 solid 1px',
    margin: '1.5em 0em 1.5em 0em',
    width: '27.5em',
  },
  altDivider1: {
    borderTop: '#666666 solid 1px',
    borderBottom: '#666666 solid 1px',
    margin: '1.5em 0em 0em 0em',
    width: '27.5em',
  },
  altDivider2: {
    borderTop: '#666666 solid 1px',
    borderBottom: '#666666 solid 1px',
    margin: '0em 0em 1.5em 0em',
    width: '27.5em',
  },
  first: {
    borderBottom: 'solid 2px #666666',
    fontSize: 12,
    paddingBottom: 17.5,
    paddingTop: 0
  },
  alt: {
    paddingTop: 17.5,
    paddingBottom: 0,
    fontSize: 12
  },
  secondary: {
    root: {
      top: '75%'
    }
  },
  avatar: {
    width: 32.5,
    height: 32.5
  },
  altWrapper: {
    paddingTop: 17.5,
    minWidth: 45,
  },
  wrapper: {
    minWidth: 45,
  },
  text: {
    fontSize: 12,
    marginRight: 7.5
  },
  input: {
    marginTop: 0,
    marginBottom: 12.5,
    marginLeft: 50,
    width: 250
  },
  market: {
    width: '100%',
    color: '#666666',
    '& p': {
      fontSize: 14,
      marginLeft: 12.5
    },
    '& p span': {
      float: 'right',
      fontFamily: "San Francisco Bold",
      fontWeight: 500,
      marginRight: 50,
      color: '#333333'
    }
  },
  single: {
    height: 205
  }
}));

function generate(element) {
  return [0, 1, 2].map((value) =>
    React.cloneElement(element, {
      key: value,
    }),
  )
}

export default function InteractiveList() {
  const [ component, setComponent ] = useState(<Multi />)
  const [ isSelected, setSelection ] = useState(true)
  const [ dense, setDense ] = useState(false)
  const classes = useStyles()

  const handleChange = (event) => {
    if(event.target.checked) setComponent(<Multi />)
    else setComponent(<Single />)
    setSelection(event.target.checked)
  }

  function Multi() {
    return(
      <List className={classes.list} dense={dense}>
        <ListItem className={classes.first}>
          <ListItemAvatar className={classes.altWrapper}>
            <Avatar className={classes.avatar} src={tokenMetadata['ETH'].image} />
          </ListItemAvatar>
          <ListItemText primary="ETH" />
          <SecondaryItemText primary="BALANCE" secondary='100,23.12' />
          <ListItemSecondaryAction classes={classes.input}>
            <AmountInput variant='outlined' label='AMOUNT'/>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem className={classes.item}>
          <ListItemAvatar className={classes.wrapper}>
            <Avatar className={classes.avatar} src={tokenMetadata['MKR'].image} />
          </ListItemAvatar>
          <ListItemText primary="MKR" />
          <SecondaryItemText primary="BALANCE" secondary='10.343' />
          <ListItemSecondaryAction classes={classes.input}>
            <AmountInput variant='outlined' label='AMOUNT'/>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem className={classes.item}>
          <ListItemAvatar className={classes.wrapper}>
            <Avatar className={classes.avatar} src={tokenMetadata['COMP'].image} />
          </ListItemAvatar>
          <ListItemText primary="COMP" />
          <SecondaryItemText primary="BALANCE" secondary='0.53' />
          <ListItemSecondaryAction classes={classes.input}>
            <AmountInput variant='outlined' label='AMOUNT'/>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem className={classes.item}>
          <ListItemAvatar className={classes.wrapper}>
            <Avatar className={classes.avatar} src={tokenMetadata['WBTC'].image} />
          </ListItemAvatar>
          <ListItemText primary="WBTC" />
          <SecondaryItemText primary="BALANCE" secondary='1.32' />
          <ListItemSecondaryAction classes={classes.input}>
            <AmountInput variant='outlined' label='AMOUNT'/>
          </ListItemSecondaryAction>
          </ListItem>
          <ListItem className={classes.item}>
            <ListItemAvatar className={classes.wrapper}>
              <Avatar className={classes.avatar} src={tokenMetadata['DAI'].image} />
            </ListItemAvatar>
            <ListItemText primary="DAI" />
            <SecondaryItemText primary="BALANCE" secondary='100,321.40' />
            <ListItemSecondaryAction classes={classes.input}>
              <AmountInput variant='outlined' label='AMOUNT'/>
            </ListItemSecondaryAction>
        </ListItem>
        <ListItem className={classes.item}>
          <ListItemAvatar className={classes.wrapper}>
            <Avatar className={classes.avatar} src={tokenMetadata['AMPL'].image} />
          </ListItemAvatar>
          <ListItemText primary="AMPL" />
          <SecondaryItemText primary="BALANCE" secondary='5,333' />
          <ListItemSecondaryAction classes={classes.input}>
            <AmountInput variant='outlined' label='AMOUNT'/>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem className={classes.item}>
          <ListItemAvatar className={classes.wrapper}>
            <Avatar className={classes.avatar} src={tokenMetadata['SNX'].image} />
          </ListItemAvatar>
          <ListItemText primary="SNX" />
          <SecondaryItemText primary="BALANCE" secondary='44,123.44' />
          <ListItemSecondaryAction classes={classes.input}>
            <AmountInput variant='outlined' label='AMOUNT'/>
          </ListItemSecondaryAction>
          </ListItem>
          <ListItem className={classes.alt}>
            <ListItemAvatar className={classes.wrapper}>
              <Avatar className={classes.avatar} src={tokenMetadata['LINK'].image} />
            </ListItemAvatar>
            <ListItemText primary="LINK" />
            <SecondaryItemText primary="BALANCE" secondary='10,232,123' />
            <SecondaryActionAlt>
              <AmountInput variant='outlined' label='AMOUNT'/>
            </SecondaryActionAlt>
          </ListItem>
      </List>
    )
  }

  function Single() {
    return(
      <div className={classes.single}>
        <OutputInput label="INPUT" variant='outlined'
          InputProps={{
            endAdornment: <Adornment market='ETH'/>,
            inputComponent: NumberFormat
          }}
        />
      </div>
    )
  }

  return (
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item>
        <RecieveInput label="RECIEVE" variant='outlined'
          InputProps={{
            endAdornment: 'CCI',
            inputComponent: NumberFormat
          }}
        />
      </Grid>
      <Grid item>
        <Radio selected={isSelected} triggerChange={handleChange} />
      </Grid>
      <Grid item>
        <div className={classes.altDivider1} />
        <div className={classes.demo}>
          {component}
        </div>
      </Grid>
      <Grid item>
        <div className={classes.altDivider2} />
        <div className={classes.market}>
          <p> PRICE: <span> $5.31 </span> </p>
          <p> GAS: <span> $0.21 </span> </p>
        </div>
        <div className={classes.divider} />
      </Grid>
      <Grid item>
        <Trigger> APPROVE </Trigger>
      </Grid>
    </Grid>
  );
}
