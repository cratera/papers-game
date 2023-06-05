import { init as SentryInit, SentryExpoNativeOptions } from 'sentry-expo'

const config: SentryExpoNativeOptions = {
  dsn: 'https://9c47ca624c844cefa678401150395766@o409284.ingest.sentry.io/5281445',
  enableInExpoDevelopment: true,
  debug: __DEV__,
}

export default function init() {
  if (__DEV__) {
    console.log('📡 sentry.init')
  } else {
    SentryInit(config)
  }
}
