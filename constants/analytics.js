import * as Device from 'expo-device'
import { Platform } from 'react-native'
import * as Analytics from 'expo-firebase-analytics'

import Sentry from '@constants/Sentry'

// TODO add support to android.
// TODO!! ask for permission in settings.
// TODO review "Automatically collected events"
const isTracking = !__DEV__

export async function logEvent(...args) {
  if (__DEV__) console.log('📡 logEvent', ...args)
  if (isTracking) {
    try {
      await Analytics.logEvent(...args)
    } catch (e) {
      console.warn('logEvent error', e)
      Sentry.captureException(e, { tags: { pp_action: 'ANLTCS' } })
    }
  }
}

export async function setCurrentScreen(...args) {
  if (__DEV__) console.log('📡 setCurrentScreen', ...args)
  if (isTracking) {
    try {
      await Analytics.setCurrentScreen(...args)
    } catch (e) {
      console.warn('setCurrentScreen error', e)
      Sentry.captureException(e, { tags: { pp_action: 'ANLTCS' } })
    }
  }
}

export async function setUserId(id) {
  if (__DEV__)
    console.log('📡 setUserId', id, {
      os: `${Device.osName} || ${Device.osVersion}`,
    })
  if (isTracking) {
    try {
      await Analytics.setUserId(id)
    } catch (e) {
      console.warn('setUserId error', e)
      Sentry.captureException(e, { tags: { pp_action: 'ANLTCS' } })
    }
    await Analytics.setUserProperty('os', `${Platform.OS} - ${Device.osName} - ${Device.osVersion}`)
  }
}

export async function setUserProperty(...args) {
  if (__DEV__) console.log('📡 setUserProperty', ...args)
  if (isTracking) {
    try {
      await Analytics.setUserProperty(args)
    } catch (e) {
      console.warn('setUserProperty error', e)
      Sentry.captureException(e, { tags: { pp_action: 'ANLTCS' } })
    }
  }
}

export async function resetAnalyticsData() {
  if (__DEV__) console.log('📡 resetAnalyticsData')
  if (isTracking) {
    try {
      await Analytics.resetAnalyticsData()
    } catch (e) {
      console.log('resetAnalyticsData error', e)
      Sentry.captureException(e, { tags: { pp_action: 'ANLTCS' } })
    }
  }
}
console.log('resetAnalyticsData error')
