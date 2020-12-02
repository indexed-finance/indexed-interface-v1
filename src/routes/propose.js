import React, { Fragment, useEffect, useContext, useState, useRef } from 'react'
import ReactDOM from 'react-dom'

import GovernorAlpha from '../assets/constants/abi/GovernorAlpha.json'
import BPool from '../assets/constants/abi/BPool.json'

import { makeStyles, styled, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Clear from '@material-ui/icons/Clear'
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import ReactMarkdown from 'react-markdown'
import { ethers } from "ethers"

import ButtonPrimary from '../components/buttons/primary'
import Select from '../components/inputs/select'
import Input from '../components/inputs/input'
import Container from '../components/container'

import { TX_CONFIRMED, TX_REVERTED, TX_PENDING } from '../assets/constants/parameters'
import { DAO } from '../assets/constants/addresses'
import style from '../assets/css/routes/propose'
import { toContract } from '../lib/util/contracts'
import getStyles from '../assets/css'
import { store } from '../state'

const sources = [ BPool, GovernorAlpha ]

const encoder = ethers.utils.defaultAbiCoder

const Entry = styled(Input)({
  marginBottom: 25,
  width: '100%',
})

const useStyles = getStyles(style)

export default function Propose(){
  const [ selection, setSelection ] = useState({ address: null, name: null })
  const [ entries, setEntries ] = useState(<span />)
  const [ metadata, setMetadata ] = useState({})
  const [ contracts, setContracts ] = useState([])
  const [ executions, setExecutions ] = useState([])
  const [ targets, setTargets ] = useState([])
  const [ focus, setFocus ] = useState(null)
  const classes = useStyles()

  let { state, dispatch } = useContext(store)
  let description

  const parseAbi = (abi) => {
    let { rinkeby } = state.web3
    let { encodeFunctionSignature } = rinkeby.eth.abi
    const functionList = []
    const functions = {}

    for (let funcAbi of abi) {
      let { name, inputs, type, stateMutability, payable } = funcAbi;

      if (!(type != 'function' || stateMutability == 'view')){
        const signature = encodeFunctionSignature({ name, type, inputs })

        functionList.push({ label: name, value: signature })
        functions[signature] = {
          stateMutability,
          abi: funcAbi,
          signature,
          inputs,
          payable,
          name,
          type
        }
      }
    }

    return { functions, functionList }
  }

  const onContractChange = (value) => {
    setSelection(value)
  }

  const removeContract = (key) => {
    let activeExecutions = executions
    let newTargets = []

    for(let index in targets){
      if(targets[index] != key) {
        newTargets.push(targets[index])
      }
    }

    delete activeExecutions[key]

    setEntries(<Wrapper data={activeExecutions} />)
    setExecutions(activeExecutions)
    setTargets(newTargets)
  }

  const onFocusChange = (value) => {
    let newExecutions = executions
    let newTargets = targets

    newExecutions[value] = {
      abi: metadata[selection],
      name: selection,
      functions: [],
    }
    newTargets.push(value)

    setEntries(<Wrapper data={newExecutions} />)
    setExecutions(newExecutions)
    setTargets(newTargets)
  }

  const handleDescription = (event) => {
    ReactDOM.render(
      <ReactMarkdown source={event.target.value} />,
      document.getElementById('preview')
    )
  }

  const getDescription = () => {
    let element = document.getElementsByName('propose-description')[0]

    return element.value
  }

  const onFunctionChange = (key, value) => {
    let newExecutions = executions
    let { functions, abi } = newExecutions[key]

    functions.push(abi.functions[value])

    setEntries(<Wrapper data={newExecutions} />)
    setExecutions(newExecutions)
  }

  const removeFunction = (key, index) => {
    let newExecutions = executions
    let { functions, abi } = newExecutions[key]

    functions[index] = functions[functions.length-1]
    functions.length--

    setEntries(<Wrapper data={newExecutions} />)
    setExecutions(newExecutions)
  }

  const handleEntryInput = (key, index, param, event) => {
    let newExecutions = executions
    let input = event.target.value

    newExecutions[key].functions[index].inputs[param].value = input
    setExecutions(newExecutions)
  }

  const submitProposal = async() => {
    let { web3, account } = state
    let [ signatures, calldata, values ] = [ [], [], [] ]
    let addresses = Object.keys(executions)
    let description = getDescription()

    await new Promise(resolve => {
      for(let address in addresses){
        let source = addresses[address]
        let { functions } = executions[source]

        for(let f in functions){
          let { signature, inputs } = functions[f]

          signatures.push(signature)
          values.push(0)

          let parameters = encoder.encode(
            inputs.map(i => i.type),
            inputs.map(i => i.value)
          )

          calldata.push(parameters)
        }
      }
      resolve()
    })

    try {
      let contract = toContract(web3.injected, GovernorAlpha.abi, DAO)

      await contract.methods.propose(
        addresses,
        values,
        signatures,
        calldata,
        description
      ).send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', (conf, receipt) => {
        if(conf == 0){
          if(receipt.status == 1) {
            dispatch(TX_CONFIRMED(receipt.transactionHash))
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
    } catch(e){}
  }

  function Entries({ data, pair }) {
    const [ mapping, setMapping ] = useState(data)

    useEffect(() => {
      setMapping(data)
    }, [ data, pair ])

    return(
      <Fragment>
        <Grid item >
          <div className={classes.select}>
            <Select
               selections={mapping.abi.functionList}
               onChange={(e) => onFunctionChange(pair, e)}
               label='Function'
            />
          </div>
        </Grid>
        <div className={classes.functions}>
          {mapping.functions.map((value, index) => (
            <Fragment>
              <IconButton onClick={() => removeFunction(pair, index)}>
                <Clear color='secondary'/>
              </IconButton>
              <b> {value.name} </b>
              {value.inputs.map((f, p) => (
                <Grid item>
                  <Entry
                    onChange={(e) => handleEntryInput(pair, index, p, e)}
                    variant='outlined'
                    label={f.type}
                  />
                </Grid>
              ))}
           </Fragment>
          ))}
        </div>
      </Fragment>
    )
  }

  function Wrapper({ data }) {
    return(
      <div className={classes.item}>
        {Object.entries(data).map(([key, value]) => (
          <Fragment>
            <IconButton onClick={() => removeContract(key)}>
              <Clear color='secondary'/>
            </IconButton>
            <b> {value.name} {key.substring(0, 6)}...{key.substring(38, 64)}</b>
            <Entries pair={key} data={value} />
          </Fragment>
        ))}
     </div>
    )
  }

  useEffect(() => {
    const sortAbis =  () => {
      let instances = []
      let calls = []
      let mapping = {}

      for(let contract in sources){
        let { abi, contractName } = sources[contract]

        instances.push({ value: contractName, label: contractName })
        mapping[contractName] = parseAbi(abi)
      }

      Object.entries(state.indexes).map(o =>
        calls.push({
          label: `${o[1].address} [${o[1].symbol}]`,
          value: o[1].address,
        })
      )

      setSelection(mapping['BPool'])
      setContracts(instances)
      setMetadata(mapping)
      setTargets(calls)
    }
    sortAbis()
  }, [ state.indexes ])

  let { margin } = style.getFormatting(state)

  return (
    <Fragment>
      <Grid container direction='column' alignItems='center' justify='center' >
        <Container margin={margin} padding="1em 2em" title="CREATE PROPOSAL">
          <div className={classes.form}>
            <Grid item>
              <p> PREVIEW: </p>
              <div className={classes.preview} id='preview' />
            </Grid>
            <Grid item>
              <Entry name='propose-description' onChange={handleDescription} multiline variant='outlined' label="Description" rows={4} />
            </Grid>
            <Grid item>
              <div className={classes.select}>
                <Select label='Contract' selections={contracts} onChange={onContractChange}/>
              </div>
            </Grid>
            <Grid item>
              <div className={classes.select}>
                <Select label='Target' selections={targets} onChange={onFocusChange} />
              </div>
            </Grid>
            {entries}
            <Grid item>
              <ButtonPrimary variant='outlined' onClick={submitProposal}>
                SUBMIT
              </ButtonPrimary>
            </Grid>
          </div>
        </Container>
      </Grid>
    </Fragment>
  )
}
