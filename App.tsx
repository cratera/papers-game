import * as React from 'react'
import { LogBox } from 'react-native'

import ErrorCrashed from '@src/screens/misc/ErrorCrashed.js'
import * as Sentry from '@src/services/sentry'
import { ErrorInfo } from 'react'
import AppFn from './AppFn'

if (LogBox) {
  LogBox.ignoreLogs([
    'Setting a timer',
    'Sending `onAnimatedValueUpdate` with no listeners registered.',
  ])
}

Sentry.init()

type AppState = {
  hasError: boolean
  error: Maybe<Error>
}

// Needed this wrapper to create Error Boundary
// Every other attempts failed (useErrorBoundary, ErrorUtils, ErrorRecovery, etc...)
// Hint: On git, blame this line to see the refactor
export default class App extends React.Component<object, AppState> {
  constructor(props: object) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(JSON.stringify({ error, errorInfo }), { tags: { pp_page: 'crash' } })
  }

  // TODO: In web prevent direct opening URLs !== root
  render() {
    if (this.state.hasError) {
      return <ErrorCrashed error={this.state.error || { cause: 'unknown' }} />
    }
    return <AppFn {...this.props} />
  }
}
