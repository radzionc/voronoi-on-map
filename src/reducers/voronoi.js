import { createReducer } from 'redux-act'

import * as a from '../actions/voronoi'
import { MAP_OPTIONS } from '../constants/map'

const DEFAULT_STATE = {
  zoom: MAP_OPTIONS.zoom,
  latitude: MAP_OPTIONS.latitude,
  longitude: MAP_OPTIONS.longitude,
  city: undefined,
  cityInputValue: '',
  cityHover: false,
  cityBoundingBox: undefined,
  cityGeoJson: undefined,
  unproject: x => x,
  project: x => x,
}

export default createReducer(
  {
    [a.updateMap]: (state, { longitude, latitude, zoom }) => ({
      ...state,
      longitude,
      latitude,
      zoom
    }),
    [a.updateProjections]: (state, projectors) => ({
      ...state,
      ...projectors
    }),
    [a.selectCity]: (state, city) => ({ ...state, city }),
    [a.changeCityInputValue]: (state, cityInputValue) => ({ ...state, cityInputValue}),
    [a.toggleCityHover]: (state) => ({ ...state, cityHover: !state.cityHover }),
    [a.startSearchingNewCity]: (state) => ({ ...state, city: undefined, cityInputValue: '', cityHover: false}),
    [a.receiveCity]: (state, { boundingbox, geojson }) => ({ ...state, cityBoundingBox: boundingbox, cityGeoJson: geojson})
  },
  DEFAULT_STATE
)