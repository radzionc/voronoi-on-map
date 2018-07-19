import _ from 'lodash'
import { clone, setWith, curry } from 'lodash/fp'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

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

