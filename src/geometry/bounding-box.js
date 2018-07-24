import _ from 'lodash'

import { Point } from './point'
import { Contour } from './contour'

export default class BoundingBox {
  constructor(points) {
    const sortedByY = _.sortBy(points, 'y')
    const sortedByX = _.sortBy(points, 'x')

    this.maxY = sortedByY[sortedByY.length - 1].y
    this.minY = sortedByY[0].y
    this.maxX = sortedByX[sortedByX.length - 1].x
    this.minX = sortedByX[0].x

    this.width = this.maxX - this.minX
    this.height = this.maxY - this.minY
    this.center = new Point(
      (this.maxX + this.minX) / 2,
      (this.maxY + this.minY) / 2
    )
  }

  contour() {
    return new Contour([
      new Point(this.minX, this.minY),
      new Point(this.minX, this.maxY),
      new Point(this.maxX, this.maxY),
      new Point(this.maxX, this.minY)
    ])
  }
}
