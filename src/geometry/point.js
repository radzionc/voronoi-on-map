import { areEqual } from '../utils/generic'
import Vector from './vector'
import { toRadians } from '../utils/generic'
import { EARTH_MEAN_RADIUS } from '../constants/map'

export class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  equalTo(other) {
    return areEqual(this.x, other.x) && areEqual(this.y, other.y)
  }
  addVector(vector) {
    return new Point(this.x + vector.x, this.y + vector.y)
  }
  distanceTo(other) {
    return Math.hypot(this.x - other.x, this.y - other.y)
  }
  array() {
    return [this.x, this.y]
  }
  vectorTo({ x, y }) {
    return new Vector(x - this.x, y - this.y)
  }
  distanceToOnMap(other) {
    const dLat = toRadians(other.y - this.y)
    const dLong = toRadians(other.x - this.x)
    const { sin, cos, atan2, sqrt } = Math
    const koef =
      sin(dLat / 2) * sin(dLat / 2) +
      cos(toRadians(this.y)) *
        cos(toRadians(other.y)) *
        sin(dLong / 2) *
        sin(dLong / 2)

    return EARTH_MEAN_RADIUS * 2 * atan2(sqrt(koef), sqrt(1 - koef))
  }
  addVectorOnMap({ x, y }) {
    return new Point(
      this.x +
        x /
          EARTH_MEAN_RADIUS *
          180 /
          Math.PI /
          Math.cos(this.y * Math.PI / 180),
      this.y + y / EARTH_MEAN_RADIUS * 180 / Math.PI
    )
  }
  toFixed(number) {
    const precise = n => parseFloat(n.toFixed(number))
    return new Point(precise(this.x), precise(this.y))
  }
  mirrorPoints(vector, points) {
    return points.map(p => {
      const vectorToPoint = this.vectorTo(p)
      let projected = vectorToPoint.project(vector.normalize())
      if (projected.dotProduct(vectorToPoint) < 0)
        projected = projected.negate()
      const mirrorPoint = this.addVector(projected)
      const mirrorVector = p.vectorTo(mirrorPoint)
      return mirrorPoint.addVector(mirrorVector)
    })
  }
}

