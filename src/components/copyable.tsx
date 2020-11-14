import React, { useState } from "react";

import { Tooltip } from "@material-ui/core";
import copyToClipboard from "../lib/copyToClipboard";
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';

import { styled } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

const CopyButton = styled(Button)({
  padding: 0,
  margin: 0,
  border: 'none',
  lineHeight: 'inherit',
  '&:hover': {
    background: 'inherit'
  },
  '& h3, h2, h4, h5, h6': {
    padding: '0px !important',
    margin: '0px !important',
  }
})

const CopyIcon = styled(InsertDriveFileIcon)({
  padding: 0,
  margin: 0,
  color: '#999999',
  paddingRight: 5,
  paddingLeft: 5,
  paddingBottom: 2.5,
  fontSize: 15
})

export default function Copyable({ float, component, text, children, ...props }) {
  const [ hover, setHover ] = useState(false)

  if (!children) children = [text];
  if (!text) text = children[0];

  const newProps = { ...props,
    onClick: () => copyToClipboard(text),
    onMouseEnter: () => setHover(true),
    onMouseOut: () => setHover(false)
  }

  return (
    <CopyButton {...newProps}>
      {hover && float == 'left' && (<CopyIcon />)}
        {children}
      {hover && float == 'right' && (<CopyIcon />)}
    </CopyButton>
  )
}
