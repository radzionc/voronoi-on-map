import { BaseControl } from 'react-map-gl'
import React from 'react'
import { Point } from '../../geometry/point'


export default class SVGOverlay extends BaseControl {
  render() {
    const { viewport } = this.context
    return (
      <svg
        {...{
          width: viewport.width,
          height: viewport.height,
          ref: this._onContainerLoad
        }}
      >
        {
          this.props.redraw(this.getProjectionsFunctions())
        }
      </svg>
    )
  }

  getProjectionsFunctions = () => {
    const getProjectionFunction = name => point => {
      const [x, y] = this.context.viewport[name]([point.x, point.y])
      return new Point(x, y)
    }

    return {
      project: getProjectionFunction('project'),
      unproject: getProjectionFunction('unproject')
    }
  }

  // componentWillUpdate() {
  //   const { updateProjections } = this.props
  //   updateProjections && updateProjections(this.getProjectionsFunctions())
  // }
}

SVGOverlay.defaultProps = {
  captureScroll: false,
  captureDrag: false,
  captureClick: false,
  captureDoubleClick: false
}