import _ from 'lodash'
import { clone, setWith, curry } from 'lodash/fp'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { EPSILON } from '../constants/generic'


export const connectTo = (mapStateToProps, actions, Container) => {
  const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)
  return connect(mapStateToProps, mapDispatchToProps)(Container)
}

export const callIf = (condition, func) => (condition ? func : _ => null)

export const takeFromState = (state, stateObjectName, fields) =>
  _.pick(state[stateObjectName], fields)

export const setIn = curry((obj, path, value) =>
  setWith(clone, path, value, clone(obj))
)

export const toDegrees = radians => radians * 180 / Math.PI
export const toRadians = degrees => degrees * Math.PI / 180
export const areEqual = (one, other, epsilon = EPSILON) =>
  Math.abs(one - other) < epsilon

// equitable - object with equalTo(other) method
export const haveSameEquitables = (one, other) =>
  equitablesDiff(one, other).length === 0 && one.length === other.length

export const equitablesDiff = (one, other) =>
  one.filter(
    oneInstance =>
      !other.find(otherInstance => {
        try {
          return oneInstance.equalTo(otherInstance)
        } catch (_) {
          return false
        }
      })
  )

export const getUniqueEquitables = equitables =>
  equitables.reduce(
    (unique, equitable) =>
      unique.find(e => e.equalTo(equitable)) ? unique : [...unique, equitable],
    []
  )
