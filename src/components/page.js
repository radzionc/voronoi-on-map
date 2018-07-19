import _ from 'lodash'
import DocumentTitle from 'react-document-title'
import React from 'react'

import { HotKeys } from 'react-hotkeys'
import { connectTo } from '../utils/generic'
import {
  enterPage,
  exitPage,
  changePageSize,
  saveInstallProposalEvent
} from '../actions/generic'
import { back } from '../actions/navigation'

const CLASSIC_PAGE_STYLE =  {
  width: '100%',
  minHeight: '100%',
  position: 'relative'
}


class Page extends React.Component {
  render() {
    const {
      extraStyle = {},
      style = { ...CLASSIC_PAGE_STYLE, ...extraStyle },
      children,
      keyMap,
      handlers,
      stateReceived,
      page,
      documentTitle = 'Voronoi'
    } = this.props
    this.page = page
    return stateReceived || process.env.REACT_APP_MOCK ? (
      <DocumentTitle title={documentTitle}>
        {_.isEmpty(keyMap) ? (
          <div style={style}>{children}</div>
        ) : (
          <HotKeys style={style} keyMap={keyMap} handlers={handlers} focused>
            {children}
          </HotKeys>
        )}
      </DocumentTitle>
    ) : (
      <div syle={CLASSIC_PAGE_STYLE} />
    )
  }

  componentDidMount() {
    if (!process.env.REACT_APP_MOCK && !this.props.inEnterPage)
      this.props.enterPage()
    window.addEventListener('resize', this.windowSizeChanged)
    window.addEventListener('popstate', this.popstate)
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault()
      this.props.saveInstallProposalEvent(e)
    })
  }


  popstate = () => this.props.back()

  componentWillUnmount() {
    if (!process.env.REACT_APP_MOCK && !this.props.inEnterPage)
      this.props.exitPage(this.page)
    window.removeEventListener('resize', this.windowSizeChanged)
    window.removeEventListener('popstate', this.popstate)
  }

  windowSizeChanged = () => {
    this.props.changePageSize({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }
}

export default connectTo(
  state => ({
    page: state.navigation.page,
    stateReceived: state.cache.stateReceived[state.navigation.page],
    inEnterPage: state.generic.inEnterPage
  }),
  { enterPage, exitPage, changePageSize, saveInstallProposalEvent, back },
  Page
)
