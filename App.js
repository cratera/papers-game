import * as React from 'react'
import { LogBox } from 'react-native'

import ErrorCrashed from '@src/screens/misc/ErrorCrashed.js'
import * as Sentry from '@src/services/sentry'
import AppFn from './AppFn.js'

if (LogBox) {
  LogBox.ignoreLogs([
    'Setting a timer',
    'Sending `onAnimatedValueUpdate` with no listeners registered.',
  ])
}

Sentry.init()

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

  componentDidCatch(error) {
    Sentry.captureException(error, { tags: { pp_page: 'crash' } })
  }

  // TODO: In web prevent direct opening URLs !== root
  render() {
    if (this.state.hasError) {
      return <ErrorCrashed error={this.state.error} />
    }
    return <AppFn {...this.props} />
  }
}
