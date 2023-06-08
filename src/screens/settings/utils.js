import PropTypes from 'prop-types'
import React from 'react'

import Page from '@src/components/page'
import { headerTheme } from '@src/navigation/headerStuff'

function setSubHeader(navigation, title, opts = {}) {
  const { isEntry, ...headerThemeOpts } = opts
  // If you find a better way of doing this, please let me know.
  // I spent too many hours googling it and didn't find a pretty way.
  // In these corner cases, react navigation docs weren't very helpful...
  navigation.getParent().setOptions({
    ...headerTheme(headerThemeOpts),
    headerTitle: title,
    headerLeft: function HB() {
      return (
        <Page.HeaderBtn
          side={isEntry ? 'left-close' : 'left'}
          icon="back"
          onPress={navigation.goBack}
        >
          {isEntry ? 'Close' : 'Back'}
        </Page.HeaderBtn>
      )
    },
  })
}

export function useSubHeader(navigation, title, headerOpts) {
  React.useEffect(() => {
    // if (__DEV__) console.log(':: useSubHeader()', title)
    const unsubscribe = navigation.addListener('focus', () =>
      setSubHeader(navigation, title, headerOpts)
    )

    return unsubscribe
  }, [headerOpts, navigation, title])
}

export const propTypesCommon = {
  navigation: PropTypes.object.isRequired, // react-navigation
}
