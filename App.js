import * as React from 'react'
import { Platform } from 'react-native'
import AppFn from './AppFn.js'
import ErrorCrashed from './screens/misc/ErrorCrashed.js'

import Sentry from '@constants/Sentry'
import { SENTRY_CONFIG } from '@constants/constants.js'

Sentry.init(SENTRY_CONFIG)

// Needed this wrapper to create Error Boundary
// Every other attempts failed (useErrorBoundary, ErrorUtils, ErrorRecovery, etc...)
// Hint: On git, blame this line to see the refactor

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorTry: this.props.errorTry }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // logEvent('crash', { message: error.message })
    Sentry.captureException(error, { tags: { pp_page: 'crash' } })
  }

  render() {
    console.log(':: APP OS', Platform.OS)
    if (this.state.hasError) {
      return <ErrorCrashed error={this.state.error} errorTry={this.state.errorTry} />
    }
    return <AppFn {...this.props} />
  }
}

App.defaultProps = {
  errorTry: 0,
}
