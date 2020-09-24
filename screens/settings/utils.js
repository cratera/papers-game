import React from 'react'
import PropTypes from 'prop-types'

import Page from '@components/page'

export function setSubHeader(navigation, title) {
  // If you find a better way of doing this, please let me know.
  // I spent too many hours googling it and didn't find a pretty way.
  // In these corner cases, react navigation docs weren't very helpful...
  function updateHeaderBackBtn({ title, btnText, onPress }) {
    navigation.dangerouslyGetParent().setOptions({
      headerTitle: title,
      headerLeft: function HB() {
        return (
          <Page.HeaderBtn side="left" icon="back" onPress={onPress}>
            {btnText}
          </Page.HeaderBtn>
        )
      },
    })
  }

  updateHeaderBackBtn({
    title: title,
    btnText: 'Back',
    onPress: () => {
      navigation.goBack()
      updateHeaderBackBtn({
        title: 'Settings',
        btnText: 'Back',
        onPress: () =>
          // navigation.dangerouslyGetState()?.index === 0
          //   ? navigation.dangerouslyGetParent().navigate('home')
          navigation.dangerouslyGetParent().goBack(),
      })
    },
  })
}

export const propTypesCommon = {
  navigation: PropTypes.object.isRequired, // react-navigation
}
