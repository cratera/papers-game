import { Dimensions, Platform } from 'react-native'
import * as Device from 'expo-device'

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

export const window = {
  width,
  height,
}

export const isWeb = Platform.OS === 'web'
export const isSmallDevice = width < 375

export const hasNotch = ['iPhone 11'].includes(Device.modelName)
