import { init as SentryInit, SentryExpoNativeOptions } from 'sentry-expo'

const config: SentryExpoNativeOptions = {
  dsn: 'https://9c47ca624c844cefa678401150395766@o409284.ingest.sentry.io/5281445',
  enableInExpoDevelopment: true,
  debug: __DEV__,
}

export const init = () => SentryInit(config)
export { default as captureException } from './captureException'
export { default as captureMessage } from './captureMessage'
