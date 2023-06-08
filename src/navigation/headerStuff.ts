import { StackNavigationOptions } from '@react-navigation/stack'

import * as Theme from '@src/theme'
import { statusBarHeight } from '@src/utils/layout'

type HeaderOptions = {
  hiddenTitle?: boolean
}

export const headerTheme = (opts: HeaderOptions = {}): StackNavigationOptions => ({
  headerTintColor: Theme.colors.grayMedium,
  headerStatusBarHeight: statusBarHeight,
  headerStyle: {
    // Note: the "border" is actually "headerDivider" prop
  },
  headerTransparent: true, // Do globally to avoid jumps in screens
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontFamily: 'Karla-Regular',
    opacity: opts.hiddenTitle ? 0 : 1,
    fontSize: 16,
  },
  headerRight: undefined,
  headerLeft: undefined,
})
