import { createReducer } from 'redux-act'
import * as a from '../actions/generic'

const DEFAULT_STATE = {
  pageWidth: window.innerWidth,
  pageHeight: window.innerHeight,
  installProposalEvent: undefined,
  inEnterPage: false,
  mouseX: 0,
  mouseY: 0
}

export default createReducer(
  {
    [a.changePageSize]: (state, { width, height }) => ({ ...state, pageWidth: width, pageHeight: height }),
    [a.saveInstallProposalEvent]: (state, installProposalEvent) => ({
      ...state,
      installProposalEvent
    }),
    [a.finishEnterPage]: state => ({ ...state, inEnterPage: false }),
    [a.enterPage]: state => ({ ...state, inEnterPage: true }),
    [a.moveMouse]: (state, mouse) => ({ ...state, ...mouse })
  },
  DEFAULT_STATE
)
