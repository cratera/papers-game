import * as Sentry from 'sentry-expo'

export default {
  init: Sentry.init,
  captureMessage: Sentry.captureMessage,
  captureException(...args) {
    if (__DEV__) console.log('‼️ S.Exp', ...args)
    Sentry.captureException(...args)
  },
}
