// TODO: double check if it works on android.
// TODO: ask for permission in settings.
// TODO: review "Automatically collected events"

// TODO: expo-firebase-analytics is longer supported by Expo managed workflow, find alternative
// either find a new analytics service or switch to development builds with react-native-firebase: https://docs.expo.dev/guides/using-firebase/#using-react-native-firebase
// None of these functions are working porperly because expo-firebase-analytics was deprecated on SDK 48. They are kept here for reference.
// import * as Analytics from 'expo-firebase-analytics'

export { default as logEvent } from './logEvent'
export { default as resetAnalyticsData } from './resetAnalyticsData'
export { default as setCurrentScreen } from './setCurrentScreen'
export { default as setUserId } from './setUserId'
export { default as setUserProperty } from './setUserProperty'
