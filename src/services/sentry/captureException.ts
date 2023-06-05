import { isNative, isWeb } from '@src/utils/device'
import { Browser, Native } from 'sentry-expo'

export default function captureException(...params: Parameters<typeof Native.captureException>) {
  if (__DEV__) {
    console.log('📡 sentry.captureException:', JSON.stringify(params))
  } else {
    if (isNative) {
      Native.captureException(...params)
    } else if (isWeb) {
      Browser.captureException(...params)
    }
  }
}
