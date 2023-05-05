import * as Sentry from 'sentry-expo'
import { SentryExpoNativeOptions } from 'sentry-expo'

const config: SentryExpoNativeOptions = {
  dsn: 'https://9c47ca624c844cefa678401150395766@o409284.ingest.sentry.io/5281445',
  enableInExpoDevelopment: true,
  debug: __DEV__, // Sentry will try to print out useful debugging information if something goes wrong with sending an event. Set this to `false` in production.
}

const { init, ...rest } = Sentry

export default {
  init: () => init(config),
  ...rest,
}
