import { Platform, StatusBar } from 'react-native'
import { isIOS, isIPad, isWeb, window } from './device'

const { width, height } = window

const X_WIDTH = 375
const X_HEIGHT = 812
const XSMAX_WIDTH = 414
const XSMAX_HEIGHT = 896

const isIPhoneX =
  isIOS && !isIPad
    ? (width === X_WIDTH && height === X_HEIGHT) ||
      (width === XSMAX_WIDTH && height === XSMAX_HEIGHT)
    : false

export const statusBarHeight = Platform.select({
  ios: isIPhoneX ? 44 : 20,
  android: StatusBar.currentHeight,
  default: 0,
})

// Safe area for transparent header in phones with notch (iPhone X, for example)
// Ignore the extra notch height (statusBarHeight) as well
const safeArea = isIPhoneX ? 50 - statusBarHeight : 40
export const headerHeight = isWeb ? 55 : safeArea + statusBarHeight
