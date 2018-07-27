import React from 'react'
import Button from '@material-ui/core/Button';

export default ({ name, hover, toggleHover, onClick, hoverText }) => (
  <Button onClick={onClick} color="primary" onMouseEnter={toggleHover} onMouseLeave={toggleHover}>
    {hover ? hoverText : name}
  </Button>
)
