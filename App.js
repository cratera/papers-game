import * as React from 'react'
import { YellowBox, Platform } from 'react-native'
import AppFn from './AppFn.js'
import ErrorCrashed from './screens/misc/ErrorCrashed.js'

import Sentry from '@constants/Sentry'
import { SENTRY_CONFIG } from '@constants/constants.js'

// Based on https://github.com/facebook/react-native/issues/12981
// import clone from 'lodash/clone'
YellowBox.ignoreWarnings(['Setting a timer'])
// const _console = clone(console)
// console.warn = message => {
//   if (message.indexOf('Setting a timer') <= -1) {
//     _console.warn(message)
//   }
// }

Sentry.init(SENTRY_CONFIG)

// Needed this wrapper to create Error Boundary
// Every other attempts failed (useErrorBoundary, ErrorUtils, ErrorRecovery, etc...)
// Hint: On git, blame this line to see the refactor

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, { tags: { pp_page: 'crash' } })
  }

  // TODO!! In web prevent direct opening URLs !== root
  render() {
    if (this.state.hasError) {
      return <ErrorCrashed error={this.state.error} />
    }
    return <AppFn {...this.props} />
  }
}
