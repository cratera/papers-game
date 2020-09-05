import * as Theme from '@theme'

// TODO rename this file

export const headerTheme = (opts = {}) => ({
  headerTintColor: Theme.colors.grayMedium,
  headerStatusBarHeight: 20,
  headerTransparent: true, // Do globally to avoid jumps in screens
  headerTitleAlign: 'center',

  // headerStyle: {
  //   backgroundColor: opts.bgColor || Theme.colors.bg,
  //   ...headerBorder(!opts.hiddenBorder),
  // },
  headerTitleStyle: {
    fontFamily: 'karla-regular',
    opacity: opts.hiddenTitle ? 0 : 1,
  },
  headerRight: null,
  headerLeft: null,
})

export const headerBorder = isVisible => ({
  borderBottomWidth: isVisible ? 1 : 0,
  borderBottomColor: Theme.colors.grayDark,
  shadowColor: 'transparent',
  // remove shadow on Android
  elevation: 0,
  shadowOpacity: 0,
})
