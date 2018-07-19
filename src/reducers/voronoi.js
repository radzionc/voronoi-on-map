import { createReducer } from 'redux-act'

import * as a from '../actions/voronoi'
import { MAP_OPTIONS } from '../constants/map'

const DEFAULT_STATE = {
  zoom: MAP_OPTIONS.zoom,
  latitude: MAP_OPTIONS.latitude,
  longitude: MAP_OPTIONS.longitude,
  city: undefined,
  cityInputValue: '',
  cityHover: false
}

export default createReducer(
  {
    [a.updateMap]: (state, { longitude, latitude, zoom }) => ({
      ...state,
      longitude,
      latitude,
      zoom
    }),
    [a.selectCity]: (state, city) => {
      console.log(city)
      return { ...state, city }
    },
    [a.changeCityInputValue]: (state, cityInputValue) => ({ ...state, cityInputValue}),
    [a.toggleCityHover]: (state) => ({ ...state, cityHover: !state.cityHover }),
    [a.startSearchingNewCity]: (state) => ({ ...state, city: undefined, cityInputValue: '', cityHover: false})
  },
  DEFAULT_STATE
)