import React from 'react'
import PlacesAutocomplete from 'react-places-autocomplete';

import { connectTo } from '../../utils/generic'
import * as actions from '../../actions/voronoi'

import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const inputContainerStyle = {
  position: 'absolute',
  top: '5%',
  left: '50%',
  transform: 'translate(-50%, 0)',
  width: 240,
  padding: 10,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white'
}


export default connectTo(
  state => state.voronoi,
  actions,
  ({ changeCityInputValue, cityInputValue, selectCity, city }) => (
    <PlacesAutocomplete
      highlightFirstSuggestion
      value={cityInputValue}
      onChange={changeCityInputValue}
      onSelect={selectCity}
      searchOptions={{ types: ['(cities)']}}
      onError={() => changeCityInputValue('')}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading, ...rest }) => (
        <Paper style={inputContainerStyle}>
          <TextField
            {...getInputProps({
              placeholder: 'Search City ...',
            })}
          />
          <List>
            {suggestions.map((suggestion) => (
              <ListItem {...getSuggestionItemProps(suggestion)} key={suggestion.description} button>
                <ListItemText primary={suggestion.description}/>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </PlacesAutocomplete>
  )
)