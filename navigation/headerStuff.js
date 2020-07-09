import * as Theme from '@theme'

// TODO rename this file

export const headerTheme = (opts = {}) => ({
  headerTintColor: Theme.colors.grayMedium,
  headerStyle: {
    backgroundColor: Theme.colors[opts.dark ? 'grayDark' : 'bg'],
    ...headerBorder(!opts.hiddenBorder),
    // height: 80, // Don't add height, otherwise screens will jump. meh.
  },
  headerTitleStyle: {
    fontWeight: 'bold',
    opacity: opts.hiddenTitle ? 0 : 1,
  },
  headerRight: null,
  headerLeft: null,
})

export const headerBorder = isVisible => ({
  borderBottomWidth: isVisible ? 1 : 0,
  borderBottomColor: Theme.colors.grayLight,
  shadowColor: 'transparent',
  // remove shadow on Android
  elevation: 0,
  shadowOpacity: 0,
})
