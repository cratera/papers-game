import { SENTRY_TAGS } from '@src/constants'
import { captureException } from '@src/services/sentry'
// import * as Analytics from 'expo-firebase-analytics'

// export default async function setCurrentScreen(...params: Parameters<typeof Analytics.setCurrentScreen>) {
export default async function setCurrentScreen(...params) {
  if (__DEV__) {
    console.log('📡 firebase.analytics.setCurrentScreen', ...params)
  } else {
    try {
      // await Analytics.setCurrentScreen(...params)
    } catch (e) {
      captureException(e, { tags: { pp_action: SENTRY_TAGS.pp_actions.analytics } })
    }
  }
}
