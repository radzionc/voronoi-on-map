import { takeLatest } from 'redux-saga/effects'

import * as genericActions from '../actions/generic'
import * as genericSagas from './generic'

import * as voronoiActions from '../actions/voronoi'
import * as voronoiSagas from './voronoi'

export default function* saga() {
  const relations = [
    [genericActions, genericSagas],
    [voronoiActions, voronoiSagas]
  ]

  for (const [actions, sagas] of relations) {
    for (const [actionName, action] of Object.entries(actions)) {
      const saga = sagas[actionName]
      if (saga) yield takeLatest(action.getType(), saga)
    }
  }
}
