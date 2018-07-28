import { createAction } from 'redux-act'

export const updateMap = createAction()

export const startSearchingNewCity = createAction()
export const changeCityInputValue = createAction()
export const selectCity = createAction()
export const toggleCityHover = createAction()

export const startSearchingNewPlace = createAction()
export const selectPlace = createAction()
export const togglePlaceHover = createAction()

export const receiveCity = createAction()
export const updateProjections = createAction()
export const saveHiddenGoogleMap = createAction()
export const updateResearchedRectangles = createAction()
export const finishPlacesResearch = createAction()
export const endFlyToCity = createAction()