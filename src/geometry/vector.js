import { Point } from './point'
import { toDegrees, toRadians } from '../utils/generic'

export default class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.length = Math.hypot(x, y)
  }

  scaleBy(factor) {
    return new Vector(this.x * factor, this.y * factor)
  }
  negate() {
    return this.scaleBy(-1)
  }
  normalize() {
    return this.scaleBy(1 / this.length)
  }
  add({ x, y }) {
    return new Vector(this.x + x, this.y + y)
  }
  subtract({ x, y }) {
    return new Vector(this.x - x, this.y - y)
  }
  dotProduct({ x, y }) {
    return this.x * x + this.y * y
  }
  crossProduct({ x, y }) {
    return this.x * y - x * this.y
  }
  haveSameDirectionWith(other) {
    const normalizedPoint = this.normalize().point()
    const otherNormalizedPoint = other.normalize().point()

    return normalizedPoint.equalTo(otherNormalizedPoint)
  }
  point() {
    return new Point(this.x, this.y)
  }
  perpendicular() {
    return new Vector(this.y, -this.x)
  }
  // project this to other vector
  project(other) {
    const amt = this.dotProduct(other) / other.length
    return new Vector(amt * other.x, amt * other.y)
  }
  array() {
    return [this.x, this.y]
  }
  equalTo(other) {
    return this.point().equalTo(other.point())
  }
  equalToNegatePossible(other) {
    return this.equalTo(other) || this.negate().equalTo(other)
  }
  withLength(length) {
    return this.normalize().scaleBy(length)
  }
  angleBetween(other) {
    return toDegrees(
      Math.atan2(this.crossProduct(other), this.dotProduct(other))
    )
  }
  rotateOn(angle) {
    const cos = Math.cos(toRadians(angle))
    const sin = Math.sin(toRadians(angle))
    return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos)
  }
}
