import { createReducer } from 'redux-act'

import * as a from '../actions/voronoi'
import { MAP_OPTIONS } from '../constants/map'
import { STAGES } from '../constants/voronoi';

const DEFAULT_STATE = {
  stage: STAGES.SEARCH_CITY,

  zoom: MAP_OPTIONS.zoom,
  latitude: MAP_OPTIONS.latitude,
  longitude: MAP_OPTIONS.longitude,

  city: undefined,
  cityInputValue: '',
  cityHover: false,
  placeHover: false,
  cityBoundingBox: undefined,
  cityGeoJson: undefined,
  hiddenGoogleMap: undefined,
  rectangles: [],
  unproject: x => x,
  project: x => x,

  place: undefined,
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
    
    [a.startSearchingNewCity]: (state) => ({
      ...state,
      city: undefined,
      cityInputValue: '',
      cityHover: false,
      rectangles: [],
      places: [],
      stage: STAGES.SEARCH_CITY
    }),
    [a.selectCity]: (state, city) => ({ ...state, city }),
    [a.changeCityInputValue]: (state, cityInputValue) => ({ ...state, cityInputValue}),
    [a.toggleCityHover]: (state) => ({ ...state, cityHover: !state.cityHover }),

    
    [a.receiveCity]: (state, { boundingbox, geojson }) => ({ ...state, cityBoundingBox: boundingbox, cityGeoJson: geojson, stage: STAGES.IN_FLY }),
    [a.endFlyToCity]: (state) => ({ ...state, stage: STAGES.SELECT_PLACE_TYPE }),
    [a.saveHiddenGoogleMap]: (state, hiddenGoogleMap) => ({ ...state, hiddenGoogleMap }),
    [a.updateResearchedRectangles]: (state, rectangles) => ({ ...state, rectangles }),
    
    [a.startSearchingNewPlace]: (state) => ({
      ...state,
      rectangles: [],
      places: [],
      stage: STAGES.SELECT_PLACE_TYPE
    }),
    [a.togglePlaceHover]: (state) => ({ ...state, placeHover: !state.placeHover }),
    [a.selectPlace]: (state, place) => ({ ...state, place, stage: STAGES.VORONOI })
    // [a.finishPlacesResearch]: (state) => ({ ...state, rectangles: [] })
  },
  DEFAULT_STATE
)