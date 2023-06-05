import { SENTRY_TAGS } from '@src/constants'
import { captureException } from '@src/services/sentry'
// import * as Analytics from 'expo-firebase-analytics'

export default async function resetAnalyticsData() {
  if (__DEV__) {
    console.log('📡 firebase.analytics.resetAnalyticsData')
  } else {
    try {
      // await Analytics.resetAnalyticsData()
    } catch (e) {
      captureException(e, { tags: { pp_action: SENTRY_TAGS.pp_actions.analytics } })
    }
  }
}
