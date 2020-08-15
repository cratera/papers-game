import * as Analytics from 'expo-firebase-analytics'

// TODO add support to android.
// TODO!! ask for permission in settings.
// TODO review "Automatically collected events"

export async function logEvent(...args) {
  if (true || !__DEV__) {
    await Analytics.logEvent(...args)
    console.log('📡 logEvent', ...args)
  }
}

export async function setCurrentScreen(...args) {
  if (true || !__DEV__) {
    await Analytics.setCurrentScreen(...args)
    console.log('📡 setCurrentScreen', ...args)
  }
}
