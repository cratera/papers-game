import { SENTRY_TAGS } from '@src/constants'
import { captureException } from '@src/services/sentry'
// import * as Analytics from 'expo-firebase-analytics'

// export default async function setUserProperty(...params: Parameters<typeof Analytics.setUserProperty>) {
export default async function setUserProperty(...params: unknown[]) {
  if (__DEV__) {
    console.log('📡 firebase.analytics.setUserProperty', ...params)
  } else {
    try {
      // await Analytics.setUserProperty(...params)
    } catch (e) {
      captureException(e, { tags: { pp_action: SENTRY_TAGS.pp_actions.analytics } })
    }
  }
}
