import { Tooltip } from "@material-ui/core";
import React from "react";
import copyToClipboard from "../lib/copyToClipboard";

export function Copyable({ component, text, children, ...props }) {
  if (!children) children = [text];
  if (!text) text = children[0];
  const newProps = { ...props, onClick: () => copyToClipboard(text) }
  const primary = React.createElement(component, newProps, children);
  return <Tooltip title='Click to copy' placement='left-start'>{primary}</Tooltip>
}