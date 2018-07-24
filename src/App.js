import React from 'react'
import { Provider } from 'react-redux'

import './utils/array-extensions'

import store from './store'
import saga from './sagas/'
import Main from './layouts/main'
import { sagaMiddleware } from './middleware'
import { MOCK_STATE } from './mocks/state'

const App = () => {
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  )
}

export default App

sagaMiddleware.run(saga)

if (process.env.REACT_APP_MOCK) {
  const state = store.getState()
  Object.entries(state).forEach(
    ([key, value]) => (state[key] = { ...value, ...MOCK_STATE[key] })
  )
}

window.history.pushState({}, '', '')
