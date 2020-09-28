import { Dimensions, Platform } from 'react-native'
import Constants from 'expo-constants'

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

export const statusBarHeight = Math.max(21, Constants.statusBarHeight)
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

// Safe area for transparent header, // take into account devices
// with top notch - Tested in iPhones SE, X and 11
export const headerHeight = isWeb ? 55 : 55 + statusBarHeight
