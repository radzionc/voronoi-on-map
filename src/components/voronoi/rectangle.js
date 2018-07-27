import React from 'react'
import purple from '@material-ui/core/colors/purple';

export default ({ points }) => (
  <polygon
    points={points.map(p => p.array())}
    fill={'transparent'}
    strokeWidth={1}
    stroke={purple.A200}
  />
)