import { isNative, isWeb } from '@src/utils/device'
import { Browser, Native } from 'sentry-expo'

export default function captureMessage(...params: Parameters<typeof Native.captureMessage>) {
  if (__DEV__) {
    console.log('📡 sentry.captureMessage:', JSON.stringify(params))
  } else {
    if (isNative) {
      Native.captureMessage(...params)
    } else if (isWeb) {
      Browser.captureMessage(...params)
    }
  }
}
