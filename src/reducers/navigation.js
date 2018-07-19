import { createReducer } from 'redux-act'

import * as a from '../actions/navigation'

const getDefaultState = page => ({
  page,
  history: [page],
  currentPushNumber: 0,
  lastPushNumber: 0
})

const DEFAULT_STATE = getDefaultState('voronoi')

const forward = (state, page) => {
  const lastPushNumber = state.lastPushNumber + 1
  window.history.pushState({ pushNumber: lastPushNumber }, '', '')
  return {
    ...state,
    page,
    history: [...state.history, page],
    lastPushNumber,
    currentPushNumber: lastPushNumber
  }
}

const possibleBackPairs = [
]

const back = (state, noCheck = false) => {
  const pushNumber = window.history.state.pushNumber || 0
  if (
    noCheck ||
    (state.history.length > 1 && state.currentPushNumber > pushNumber)
  ) {
    const prev = state.history[state.history.length - 2]
    const current = state.page
    const possibleToMoveBack = possibleBackPairs.find(
      pair => pair[0] === current && pair[1] === prev
    )
    if (possibleToMoveBack) {
      return {
        ...state,
        page: prev,
        history: state.history.slice(0, -1),
        currentPushNumber: pushNumber
      }
    }
    return state
  }
  return state
}

export default createReducer(
  {
    [a.to]: forward,
    
    [a.back]: back,
  },
  DEFAULT_STATE
)
