// TODO: double check if it works on android.
// TODO: ask for permission in settings.
// TODO: review "Automatically collected events"
// TODO: either find a new analytics service or switch to development builds with react-native-firebase: https://docs.expo.dev/guides/using-firebase/#using-react-native-firebase
// None of this functions are working porperly because expo-firebase-analytics was deprecated on SDK 48.

export { default as logEvent } from './logEvent'
export { default as resetAnalyticsData } from './resetAnalyticsData'
export { default as setUserId } from './setUserId'
export { default as setUserProperty } from './setUserProperty'
