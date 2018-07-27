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
  hiddenGoogleMap: undefined,
  places: [],
  rectangles: [],
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
    [a.receiveCity]: (state, { boundingbox, geojson }) => ({ ...state, cityBoundingBox: boundingbox, cityGeoJson: geojson}),
    [a.saveHiddenGoogleMap]: (state, hiddenGoogleMap) => ({ ...state, hiddenGoogleMap }),
    [a.updatePlaces]: (state, places) => ({ ...state, places }),
    [a.updateResearchedRectangles]: (state, rectangles) => ({ ...state, rectangles }),
    // [a.finishPlacesResearch]: (state) => ({ ...state, rectangles: [] })
  },
  DEFAULT_STATE
)