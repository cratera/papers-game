import * as Theme from '@theme'

import { statusBarHeight } from '@constants/layout'

export const headerTheme = (opts = {}) => ({
  headerTintColor: Theme.colors.grayMedium,
  headerStatusBarHeight: statusBarHeight,
  headerTransparent: true, // Do globally to avoid jumps in screens
  headerTitleAlign: 'center',
  headerTitleStyle: {
    // fontFamily: 'karla-regular',
    opacity: opts.hiddenTitle ? 0 : 1,
  },
  headerRight: null,
  headerLeft: null,
})
