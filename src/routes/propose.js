import React, { Fragment, useEffect, useContext, useState, useRef } from 'react'
import ReactDOM from 'react-dom'

import BPool from '../assets/constants/abi/BPool.json'

import { makeStyles, styled, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Clear from '@material-ui/icons/Clear'
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import ReactMarkdown from 'react-markdown'

import ButtonPrimary from '../components/buttons/primary'
import Select from '../components/inputs/select'
import Input from '../components/inputs/input'
import Container from '../components/container'

import { store } from '../state'

const sources = [ BPool ]

const Entry = styled(Input)({
  marginBottom: 25,
  width: '100%'
})

const useStyles = makeStyles((theme) => ({
  form: {
    width: 750,
    height: 'auto',
    padding: 50,
    paddingBottom: 75
  },
  select: {
    marginBottom: 25
  }
}))

export default function Propose(){
  const [ selection, setSelection ] = useState({ functionList: [] })
  const [ metadata, setMetadata ] = useState({})
  const [ contracts, setContracts ] = useState([])
  const [ description, setDescription ] = useState(null)
  const [ executions, setExecutions ] = useState([])

  const classes = useStyles()

  let { state, dispatch } = useContext(store)

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
    setSelection(metadata[value])
  }

  const handleDescription = (event) => {
    ReactDOM.render(
      <ReactMarkdown source={event.target.value} />,
      document.getElementById('preview')
    )
  }

  const onFunctionChange = (value) => {
    let newFunctions = []

    if(executions.length != 0){
      for(let index in executions){
        newFunctions.push(executions[index])
      }
    }

    newFunctions.push(selection.functions[value])
    setExecutions(newFunctions)
  }

  const removeFunction = (index) => {
    let newFunctions = []

    if(executions.length != 0){
      for(let i in executions){
        if(i != index) newFunctions.push(executions[i])
      }
    }

    setExecutions(newFunctions)
  }

  function Entries({ data }) {
    const [ mapping, setMapping ] = useState(data)

    useEffect(() => {
      setMapping(data)
    }, [ data ])

    return(
      <Fragment>
        {mapping.map((value, index) =>
          <Fragment>
            <IconButton onClick={() => removeFunction(index)}>
              <Clear color='secondary'/>
            </IconButton>
            <b> {value.name} </b>
            {value.inputs.map(f => (
              <Grid item>
                <Entry label={f.type} variant='outlined' />
              </Grid>
            ))}
          </Fragment>
        )}
      </Fragment>
    )
  }

  useEffect(() => {
    let instances = []
    let mapping = {}

    for(let contract in sources){
      let { abi, contractName } = sources[contract]

      instances.push({ value: contractName, label: contractName })
      mapping[contractName] = parseAbi(abi)
    }

    setSelection(mapping['BPool'])
    setContracts(instances)
    setMetadata(mapping)
  }, [])

  return (
    <Fragment>
      <Grid container direction='column' alignItems='center' justify='center'>
        <Container margin="3em 3em" padding="1em 2em" title="CREATE PROPOSAL" percentage="37.5%">
          <div className={classes.form}>
            <Grid item>
              <div className={classes.select}>
                <Select label='Contract' selections={contracts} onChange={onContractChange}/>
              </div>
            </Grid>
            <Grid item>
              <div className={classes.select}>
                <Select label='Function' selections={selection.functionList} onChange={onFunctionChange} />
              </div>
            </Grid>
            <Entries data={executions} />
            <Grid item>
              <p> PREVIEW: </p>
              <div className={classes.preview} id='preview' />
            </Grid>
            <Grid item>
              <Entry onChange={handleDescription} multiline variant='outlined' label="Description" rows={4} />
            </Grid>
            <Grid item>
              <ButtonPrimary variant='outlined'>
                SUBMIT
              </ButtonPrimary>
            </Grid>
          </div>
        </Container>
      </Grid>
    </Fragment>
  )
}
