import React from 'react'

import * as pages from '../pages'

import { connectTo } from '../utils/generic'

export default connectTo(
  state => ({
    page: state.navigation.page,
  }),
  {},
  ({ page }) => {
    const Page = pages[page]
    return <Page />
  }
)