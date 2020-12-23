import React, { Fragment, useState, useEffect, useContext } from "react"

import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'

import Container from '../components/container'
import List from '../components/list'

import { Link } from 'react-router-dom'
import { categoryNativeColumns, categoryDesktopColumns  } from '../assets/constants/parameters'
import { getCategoryImages, filtered, getHelperData } from '../assets/constants/functions'
import style from '../assets/css/routes/categories'
import getStyles from '../assets/css'
import { store } from '../state'

const useStyles = getStyles(style)

export default function Categories(){
  let { dispatch, state } = useContext(store)

  const [ rows, setRows ] = useState({})
  const classes = useStyles()

  useEffect(() => {
    if(Object.keys(state.categories).length > 0){
      setRows(state.categories)
    }
  }, [ state.indexes ])

  useEffect(() => {
    if(!state.load){
      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, [ ])

  let { margin } = style.getFormatting(state)

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <Container margin={margin} padding="1em 0em" title='CATEGORIES'>
            <Fragment>
              {Object.values(rows).map((value, i) => (
                <div className={classes.category}>
                  <div className={classes.title}>
                    <Link to={`/category/${Object.keys(rows)[i]}`}>
                      <h3> {value.name} [{value.symbol}]</h3>
                    </Link>
                    <p>
                      {state.request && getCategoryImages(value, state).map(i => (
                        <img src={i} className={classes.asset} />
                      ))}
                    </p>
                  </div>
                  <div className={classes.divider} />
                  <List
                    data={getHelperData(Object.values(filtered(state.indexes, value.indexes)))}
                    columns={state.native ? categoryNativeColumns : categoryDesktopColumns}
                    props={state.indexes}
                    height={250}
                    href
                  />
                </div>
               )
              )}
            </Fragment>
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}
