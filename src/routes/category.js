import React, { useState, useEffect, useContext, Fragment } from 'react'

import Grid from '@material-ui/core/Grid'
import { useParams } from 'react-router-dom'

import style from '../assets/css/routes/stake'
import Container from '../components/container'
import getStyles from '../assets/css'
import { store } from '../state'

import ReactMarkdown from 'react-markdown'
const gfm = require('remark-gfm')

const useStyles = getStyles(style);

export default function Category() {
  const [category, setCategory] = useState(undefined);
  const { state } = useContext(store);
  const { categories } = state;
  const { id } = useParams();
  useEffect(() => {
    if (!category) setCategory(categories[id]);
  }, [categories]);

  const classes = useStyles()

  let { margin } = style.getFormatting(state)

  return <Grid container direction='column' alignItems='center' justify='center'>
    <Grid item xs={10} md={6} lg={6} xl={6} >
      <Container margin={margin} padding="1em 2em" title='CATEGORY'>
        <div className={classes.header}>
          <div id='cat-md' />
            { category && <ReactMarkdown>
              {category.description.replace(/[\n]{1}/g, '\n\n').replace()}
            </ReactMarkdown> }
        </div>
      </Container>
    </Grid>
  </Grid>
}
