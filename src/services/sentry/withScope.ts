import { isNative, isWeb } from '@src/utils/device'
import { Browser, Native } from 'sentry-expo'

export default function withScope(...params: Parameters<typeof Native.withScope>) {
  if (__DEV__) {
    console.log('📡 sentry.withScope:', JSON.stringify(params))
  } else {
    if (isNative) {
      Native.withScope(...params)
    } else if (isWeb) {
      Browser.withScope(...params)
    }
  }
}
