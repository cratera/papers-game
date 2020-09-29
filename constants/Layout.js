import { Dimensions, Platform, StatusBar } from 'react-native'

const X_WIDTH = 375
const X_HEIGHT = 812
const XSMAX_WIDTH = 414
const XSMAX_HEIGHT = 896
const { height, width } = Dimensions.get('window')

const isIPhoneX =
  Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS
    ? (width === X_WIDTH && height === X_HEIGHT) ||
      (width === XSMAX_WIDTH && height === XSMAX_HEIGHT)
    : false

export const statusBarHeight = Platform.select({
  ios: isIPhoneX ? 44 : 20,
  android: StatusBar.currentHeight,
  default: 0,
})
export const window = {
  width,
  height,
  vw: width / 100,
  vh: height / 100,
}

export const isWeb = Platform.OS === 'web'
export const isAndroid = Platform.OS === 'android'
export const isSmallDevice = width < 375
export const isTamagoshi = height < 570 // aka iphone 5/SE

// Safe area for transparent header.In phones with notch (iphoneX)
// ignore the extra notch height (statusBarHeight)
const safeArea = isIPhoneX ? 50 - statusBarHeight : 50
export const headerHeight = isWeb ? 55 : safeArea + statusBarHeight
