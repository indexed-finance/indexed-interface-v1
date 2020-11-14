import React from "react";
import copyToClipboard from "../lib/copyToClipboard";

export function Copyable({ component, text, children, ...props }) {
  if (!children) children = [text];
  if (!text) text = children[0];
  const newProps = { ...props, onClick: () => copyToClipboard(text) }
  return React.createElement(component, newProps, children);
}