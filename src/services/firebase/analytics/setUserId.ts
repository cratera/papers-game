import { SENTRY_TAGS } from '@src/constants'
import { captureException } from '@src/services/sentry'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import setUserProperty from './setUserProperty'
// import * as Analytics from 'expo-firebase-analytics'

// export default function setUserId(...params: Parameters<typeof Analytics.setUserId>) {
export default async function setUserId(...params) {
  if (__DEV__) {
    console.log('📡 firebase.analytics.setUserId', ...params, {
      os: `${Device.osName} || ${Device.osVersion}`,
    })
  } else {
    try {
      // await Analytics.setUserId(...params)
    } catch (e) {
      captureException(e, { tags: { pp_action: SENTRY_TAGS.pp_actions.analytics } })
    }

    await setUserProperty('os', `${Platform.OS} - ${Device.osName} - ${Device.osVersion}`)
  }
}
