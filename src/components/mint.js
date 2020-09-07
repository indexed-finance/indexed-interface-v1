import React from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import Grid from '@material-ui/core/Grid'

import { tokenImages } from '../assets/constants/parameters'

import NumberFormat from '../utils/format'
import ButtonPrimary from './buttons/primary'
import Input from './inputs/input'

const AmountInput = styled(Input)({
  width: 75,
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
  width: 200,
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
    width: 350,
  },
  title: {
    margin: theme.spacing(4, 0, 2),
  },
  list: {
    marginTop: 20,
    marginBottom: 20,
    border: 'solid 2px #666666',
    borderRadius: 10,
    paddingTop: 0,
    paddingBottom: 0,
    overflowY: 'scroll',
    height: 325
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
  const classes = useStyles();
  const [dense, setDense] = React.useState(false);
  const [secondary, setSecondary] = React.useState(false);

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
        <div className={classes.demo}>
            <List className={classes.list} dense={dense}>
                <ListItem className={classes.first}>
                  <ListItemAvatar className={classes.altWrapper}>
                    <Avatar className={classes.avatar} src={tokenImages['ETH']} />
                  </ListItemAvatar>
                  <ListItemText primary="ETH" />
                  <SecondaryItemText primary="BALANCE" secondary='100,23.12' />
                  <ListItemSecondaryAction classes={classes.input}>
                    <AmountInput variant='outlined' label='AMOUNT'/>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem className={classes.item}>
                  <ListItemAvatar className={classes.wrapper}>
                    <Avatar className={classes.avatar} src={tokenImages['MKR']} />
                  </ListItemAvatar>
                  <ListItemText primary="MKR" />
                  <SecondaryItemText primary="BALANCE" secondary='10.343' />
                  <ListItemSecondaryAction classes={classes.input}>
                    <AmountInput variant='outlined' label='AMOUNT'/>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem className={classes.item}>
                    <ListItemAvatar className={classes.wrapper}>
                    <Avatar className={classes.avatar} src={tokenImages['COMP']} />
                  </ListItemAvatar>
                  <ListItemText primary="COMP" />
                  <SecondaryItemText primary="BALANCE" secondary='0.53' />
                  <ListItemSecondaryAction classes={classes.input}>
                    <AmountInput variant='outlined' label='AMOUNT'/>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem className={classes.item}>
                    <ListItemAvatar className={classes.wrapper}>
                      <Avatar className={classes.avatar} src={tokenImages['WBTC']} />
                    </ListItemAvatar>
                    <ListItemText primary="WBTC" />
                    <SecondaryItemText primary="BALANCE" secondary='1.32' />
                    <ListItemSecondaryAction classes={classes.input}>
                      <AmountInput variant='outlined' label='AMOUNT'/>
                    </ListItemSecondaryAction>
                </ListItem>
                <ListItem className={classes.item}>
                    <ListItemAvatar className={classes.wrapper}>
                      <Avatar className={classes.avatar} src={tokenImages['DAI']} />
                    </ListItemAvatar>
                    <ListItemText primary="DAI" />
                    <SecondaryItemText primary="BALANCE" secondary='100,321.40' />
                    <ListItemSecondaryAction classes={classes.input}>
                      <AmountInput variant='outlined' label='AMOUNT'/>
                    </ListItemSecondaryAction>
                </ListItem>
                <ListItem className={classes.item}>
                    <ListItemAvatar className={classes.wrapper}>
                      <Avatar className={classes.avatar} src={tokenImages['AMPL']} />
                    </ListItemAvatar>
                    <ListItemText primary="AMPL" />
                    <SecondaryItemText primary="BALANCE" secondary='5,333' />
                    <ListItemSecondaryAction classes={classes.input}>
                      <AmountInput variant='outlined' label='AMOUNT'/>
                    </ListItemSecondaryAction>
                </ListItem>
                <ListItem className={classes.item}>
                    <ListItemAvatar className={classes.wrapper}>
                      <Avatar className={classes.avatar} src={tokenImages['SNX']} />
                    </ListItemAvatar>
                    <ListItemText primary="SNX" />
                    <SecondaryItemText primary="BALANCE" secondary='44,123.44' />
                    <ListItemSecondaryAction classes={classes.input}>
                      <AmountInput variant='outlined' label='AMOUNT'/>
                    </ListItemSecondaryAction>
                </ListItem>
                <ListItem className={classes.alt}>
                  <ListItemAvatar className={classes.wrapper}>
                    <Avatar className={classes.avatar} src={tokenImages['LINK']} />
                  </ListItemAvatar>
                  <ListItemText primary="LINK" />
                  <SecondaryItemText primary="BALANCE" secondary='10,232,123' />
                  <SecondaryActionAlt>
                    <AmountInput variant='outlined' label='AMOUNT'/>
                  </SecondaryActionAlt>
                </ListItem>
            </List>
          </div>
      </Grid>
      <Grid item>
        <ButtonPrimary> APPROVE </ButtonPrimary>
      </Grid>
    </Grid>
  );
}
