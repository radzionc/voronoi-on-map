import { call, put, select } from 'redux-saga/effects'
import { unauthorizeUser } from '../actions/auth'
import { to } from '../actions/navigation'
import { delay } from 'redux-saga'

export function* callWith401Handle(...args) {
  if (process.env.REACT_APP_MOCK) return
  try {
    const data = yield call(...args)
    return data
  } catch (err) {
    console.info('request with error: ', err)
    if (err.status === 401) {
      yield put(unauthorizeUser())
    } else {
      throw err
    }
  }
}
