import * as React from 'react'
import { LogBox } from 'react-native'
import AppFn from './AppFn.js'
import ErrorCrashed from './screens/misc/ErrorCrashed.js'

import Sentry from '@constants/Sentry'
import { SENTRY_CONFIG } from '@constants/constants.js'

if (LogBox) {
  LogBox.ignoreLogs(['Setting a timer'])
}

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
