/*global google:true*/

import React from 'react'

import Page from '../page'
import Map from './map'
import TopNavigation from './top-navigation'
import { connectTo } from '../../utils/generic';
import * as actions from '../../actions/voronoi'
import CityInput from './city-input'
import Places from './places'
import { STAGES } from '../../constants/voronoi';
import { Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close'

export default connectTo(
  state => state.voronoi,
  actions,
  class Voronoi extends React.Component {
    render() {
      const { stage, snackbarMessage, toggleSnackbar } = this.props
      return (
        <Page style={{ height: '100%' }}>
          <div style={{ position: 'absolute', zIndex: -100}} ref='hiddenGoogleMap'></div>
          <Map/>
          <TopNavigation/>
          {stage === STAGES.SEARCH_CITY && <CityInput/>}
          {stage === STAGES.SELECT_PLACE_TYPE && <Places/>}
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            open={snackbarMessage.length > 0}
            autoHideDuration={3000}
            onClose={() => toggleSnackbar('')}
            onExited={() => toggleSnackbar('')}
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={<span>{snackbarMessage}</span>}
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={() => toggleSnackbar('')}
              >
                <CloseIcon />
              </IconButton>,
            ]}
          />
        </Page>
      )
    }

    componentDidMount() {
      this.props.saveHiddenGoogleMap(new google.maps.Map(this.refs.hiddenGoogleMap))
    }
  }
)
