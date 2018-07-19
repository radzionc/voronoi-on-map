import { createReducer } from 'redux-act'

import { updateState } from '../actions/cache'

export const getDefaultState = () => ({
  stateReceived: {
    voronoi: true
  }
})

// only for sagas usage
export default createReducer(
  {
    [updateState]: (state, newState) => ({ ...state, ...newState }),
  },
  getDefaultState()
)
