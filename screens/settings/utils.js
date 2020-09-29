import React from 'react'
import PropTypes from 'prop-types'

import Page from '@components/page'

function setSubHeader(navigation, title) {
  // If you find a better way of doing this, please let me know.
  // I spent too many hours googling it and didn't find a pretty way.
  // In these corner cases, react navigation docs weren't very helpful...
  navigation.dangerouslyGetParent().setOptions({
    headerTitle: title,
    headerLeft: function HB() {
      return (
        <Page.HeaderBtn side="left" icon="back" onPress={navigation.goBack}>
          Back
        </Page.HeaderBtn>
      )
    },
  })
}

export function useSubHeader(navigation, title) {
  React.useEffect(() => {
    // if (__DEV__) console.log(':: useSubHeader()', title)
    const unsubscribe = navigation.addListener('focus', () => setSubHeader(navigation, title))

    return unsubscribe
  }, [navigation])
}

export const propTypesCommon = {
  navigation: PropTypes.object.isRequired, // react-navigation
}
