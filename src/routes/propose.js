import React, { Fragment, useEffect, useContext, useState } from 'react'

import BPool from '../assets/constants/abi/BPool.json'

import { makeStyles, styled, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

import Select from '../components/inputs/select'
import Input from '../components/inputs/input'
import Container from '../components/container'

import { store } from '../state'

const sources = [ BPool ]

const Entry = styled(Input)({
  marginBottom: 25,
  width: '87.5%'
})

const useStyles = makeStyles((theme) => ({
  form: {
    width: 750,
    height: 'auto',
    padding: 50
  },
  select: {
    marginBottom: 25
  }
}))

export default function Propose(){
  const [ selection, setSelection ] = useState({ functionList: [] })
  const [ entries, setEntries ] = useState(<Fragment />)
  const [ metadata, setMetadata ] = useState({})
  const [ contracts, setContracts ] = useState([])
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

  const onContractChange = (value, label) => {
    setSelection(metadata[value])
  }

  const onFunctionChange = (value, label) => {
    let newFunctions = executions

    newFunctions.push(selection.functions[value])
    setExecutions(newFunctions)
  }

  function Entries({ data }) {
    const [ mapping, setMapping ] = useState(data)

    useEffect(() => {
      console.log(data)
      setMapping(data)
    }, [data])

    return(
      <Fragment>
        {mapping.map(value =>
          <Fragment>
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
          </div>
        </Container>
      </Grid>
    </Fragment>
  )
}
