import React from 'react'
import { connectTo } from '../../utils/generic';
import { selectPlace } from '../../actions/voronoi'
import Paper from '@material-ui/core/Paper';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';

import { PLACES_TYPES } from '../../constants/types'

const placesStyle = {
  position: 'absolute',
  top: '5%',
  left: '50%',
  transform: 'translate(-50%, 0)',
  width: 320,
  maxHeight: '60%',
  overflowY: 'scroll'
}

export default connectTo(
  () => ({ }),
  { selectPlace },
  ({ selectPlace}) => (
    <Paper style={placesStyle}>
      <MenuList>
        {
          PLACES_TYPES.map(place => (
            <MenuItem key={place} onClick={() => selectPlace(place)}>
              <ListItemText inset primary={place.split('_').join(' ')} />
            </MenuItem>
          ))
        }
      </MenuList>
    </Paper>
  )
)