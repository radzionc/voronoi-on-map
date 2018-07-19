import { put, call } from 'redux-saga/effects'

import { get } from '../utils/api'
import { startSearchingNewCity, receiveCity } from '../actions/voronoi'

export function* selectCity({ payload }) {
  const url = `https://nominatim.openstreetmap.org/search/${encodeURIComponent(payload)}?format=json&polygon_geojson=1&type=city`
  const places = yield call(get, url)
  const city = places.find(p => p.type === 'city')
  if (!city) {
    yield put(startSearchingNewCity())
  } else {
    yield put(receiveCity(({ ...city, boundingbox: city.boundingbox.map(Number)})))
  }
}