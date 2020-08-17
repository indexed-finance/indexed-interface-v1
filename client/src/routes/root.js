import React, { Fragment, useState, useEffect, useContext } from "react";

import { store } from '../state'

export default function Root(){
  let { state, dispatch } = useContext(store)

  return (
    <Fragment>
    </Fragment>
  )
}
