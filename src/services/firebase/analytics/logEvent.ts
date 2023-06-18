import { SENTRY_TAGS } from '@src/constants'
import { captureException } from '@src/services/sentry'
// import * as Analytics from 'expo-firebase-analytics'

// export default async function logEvent(...params: Parameters<typeof Analytics.logEvent>) {
export default async function logEvent(...params: unknown[]) {
  if (__DEV__) {
    console.log('📡 firebase.analytics.logEvent', ...params)
  } else {
    try {
      // await Analytics.logEvent(...params)
    } catch (e) {
      captureException(e, { tags: { pp_action: SENTRY_TAGS.pp_actions.analytics } })
    }
  }
}
