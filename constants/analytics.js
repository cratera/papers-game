import * as Device from 'expo-device'
import { Platform } from 'react-native'
import * as Analytics from 'expo-firebase-analytics'

// TODO add support to android.
// TODO!! ask for permission in settings.
// TODO review "Automatically collected events"
const isTracking = !__DEV__

export async function logEvent(...args) {
  if (__DEV__) console.log('📡 logEvent', ...args)
  if (isTracking) {
    await Analytics.logEvent(...args)
  }
}

export async function setCurrentScreen(...args) {
  if (__DEV__) console.log('📡 setCurrentScreen', ...args)
  if (isTracking) {
    await Analytics.setCurrentScreen(...args)
  }
}

export async function setUserId(id) {
  if (__DEV__)
    console.log('📡 setUserId', id, {
      os: `${Device.osName} || ${Device.osVersion}`,
    })
  if (isTracking) {
    await Analytics.setUserId(id)
    await Analytics.setUserProperty('os', `${Platform.OS} - ${Device.osName} - ${Device.osVersion}`)
  }
}

export async function setUserProperty(...args) {
  if (__DEV__) console.log('📡 setUserProperty', ...args)
  if (isTracking) {
    await Analytics.setUserProperty(args)
  }
}

export async function resetAnalyticsData() {
  if (__DEV__) console.log('📡 resetAnalyticsData')
  if (isTracking) {
    await Analytics.resetAnalyticsData()
  }
}
