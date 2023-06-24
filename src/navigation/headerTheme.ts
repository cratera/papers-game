import * as Theme from '@src/theme'
import { Stack } from 'expo-router'
import { ComponentProps } from 'react'

export type HeaderOptions = {
  hiddenTitle?: boolean
}

export default (opts: HeaderOptions = {}): ComponentProps<typeof Stack.Screen>['options'] => ({
  headerTintColor: Theme.colors.grayMedium,
  // headerStatusBarHeight: statusBarHeight,
  headerTransparent: true, // Do globally to avoid jumps in screens
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontFamily: 'Karla-Regular',
    fontSize: 16,
    ...(opts.hiddenTitle ? { color: Theme.colors.transparent } : {}),
  },
  headerBackVisible: false,
  headerRight: undefined,
  headerLeft: undefined,
})
