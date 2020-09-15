import { Dimensions, Platform } from 'react-native'

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

export const window = {
  width,
  height,
  vw: width / 100,
  vh: height / 100,
}

export const isWeb = Platform.OS === 'web'
export const isAndroid = Platform.OS === 'android'
export const isSmallDevice = width < 375
