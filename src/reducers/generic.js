import { createReducer } from 'redux-act'
import * as a from '../actions/generic'

const DEFAULT_STATE = {
  pageWidth: window.innerWidth,
  pageHeight: window.innerHeight,
  installProposalEvent: undefined,
  inEnterPage: false
}

export default createReducer(
  {
    [a.saveInstallProposalEvent]: (state, installProposalEvent) => ({
      ...state,
      installProposalEvent
    }),
    [a.finishEnterPage]: state => ({ ...state, inEnterPage: false }),
    [a.enterPage]: state => ({ ...state, inEnterPage: true }),
  },
  DEFAULT_STATE
)
