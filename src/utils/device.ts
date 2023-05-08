import { Dimensions, Platform } from 'react-native'

// Dimensions
const { height, width } = Dimensions.get('window')

export const window = {
  width,
  height,
  vw: width / 100,
  vh: height / 100,
}
export const isSmallDevice = width < 375
export const isTamagoshi = height < 570 // aka iphone 5/SE

// Platform
export const isWeb = Platform.OS === 'web'
export const isAndroid = Platform.OS === 'android'
export const isIOS = Platform.OS === 'ios'
export const isNative = isAndroid || isIOS
export const isIPad = Platform.OS === 'ios' && Platform.isPad
