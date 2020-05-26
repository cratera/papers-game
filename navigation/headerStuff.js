import * as Theme from '@theme'

// TODO rename this file

export const headerTheme = (opts = {}) => ({
  headerTintColor: Theme.colors.grayMedium,
  headerStyle: {
    shadowColor: 'transparent',
    borderBottomWidth: opts.hiddenBorder ? 0 : 1,
    borderBottomColor: Theme.colors.grayLight,
  },
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  headerRight: null,
  headerLeft: null,
})
