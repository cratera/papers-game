import * as Theme from '@theme'

// TODO rename this file

export const headerTheme = (opts = {}) => ({
  headerTintColor: Theme.colors.grayMedium,
  // headerTransparent: true,
  // headerStatusBarHeight: 20,
  headerStyle: {
    backgroundColor: opts.bgColor || Theme.colors.bg,
    ...headerBorder(!opts.hiddenBorder),
    // height: 80, // Don't add height, otherwise screens will jump. meh.
  },
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
