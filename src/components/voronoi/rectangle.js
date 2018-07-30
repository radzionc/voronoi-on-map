import React from 'react'
import { pink } from '@material-ui/core/colors';

export default ({ points }) => (
  <polygon
    points={points.map(p => p.array())}
    fill={'transparent'}
    strokeWidth={2}
    stroke={pink.A200}
  />
)