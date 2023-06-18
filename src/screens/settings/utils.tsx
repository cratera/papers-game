import React from 'react'

import { NavigationProp } from '@react-navigation/native'
import Page from '@src/components/page'
import { HeaderOptions, headerTheme } from '@src/navigation/headerStuff'
import { AppStackParamList } from '@src/navigation/navigation.types'

type SubHeaderOptions = HeaderOptions & {
  isEntry?: boolean
}

function setSubHeader(
  navigation: NavigationProp<AppStackParamList>,
  title: string,
  opts: SubHeaderOptions = {}
) {
  const { isEntry, ...headerThemeOpts } = opts
  // If you find a better way of doing this, please let me know.
  // I spent too many hours googling it and didn't find a pretty way.
  // In these corner cases, react navigation docs weren't very helpful...
  navigation.getParent()?.setOptions({
    ...headerTheme(headerThemeOpts),
    headerTitle: title,
    headerLeft: function HB() {
      return (
        <Page.HeaderBtn side={isEntry ? 'left-close' : 'left'} onPress={navigation.goBack}>
          {isEntry ? 'Close' : 'Back'}
        </Page.HeaderBtn>
      )
    },
  })
}

export function useSubHeader(...props: Parameters<typeof setSubHeader>) {
  const [navigation, title, headerOpts] = props

  React.useEffect(() => {
    // if (__DEV__) console.log(':: useSubHeader()', title)
    const unsubscribe = navigation.addListener('focus', () =>
      setSubHeader(navigation, title, headerOpts)
    )

    return unsubscribe
  }, [headerOpts, navigation, title])
}
