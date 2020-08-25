import React, { Fragment, useState, useEffect, useContext } from "react";

import Container from '../components/container'
import List from '../components/list'

import { store } from '../state'

export default function Demo(){
  let { dispatch, state } = useContext(store)

  return (
    <Fragment>
      <Container title='Indexes' components={<List/>} />
    </Fragment>
  )
}
