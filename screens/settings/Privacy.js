import React from 'react'
import { ScrollView, View } from 'react-native'

import Page from '@components/page'
import { IconExternal } from '@components/icons'

import * as Theme from '@theme'

import Item from './Item.js'
import { setSubHeader, propTypesCommon } from './utils'

export default function Privacy({ navigation }) {
  const [ads, setAds] = React.useState(false)
  const [sentry, setSentry] = React.useState(true)

  React.useEffect(() => {
    setSubHeader(navigation, 'Privacy')
  }, [])

  function handleCustomAdsToggle() {
    setAds(fakeBool => !fakeBool)
  }

  function handleSentryToggle() {
    setSentry(fakeBool => !fakeBool)
  }

  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={[Theme.u.scrollSideOffset]}>
          <View style={Theme.u.cardEdge}>
            <Item title="Show personalized ads" switchValue={ads} onPress={handleCustomAdsToggle} />
            <Item
              title="Share with developers"
              description="Share anonymous crash reports and help us improve Papers"
              switchValue={sentry}
              onPress={handleSentryToggle}
            />

            <View style={Theme.u.listDivider} />

            <Item
              title="Privacy Policy"
              Icon={IconExternal}
              onPress={() => console.warn('TODO!! page!!')}
            />
            <Item
              title="Terms of Service"
              Icon={IconExternal}
              onPress={() => console.warn('TODO!! page!!')}
            />
            <Item
              title="User Agreement"
              Icon={IconExternal}
              onPress={() => console.warn('TODO!! page!!')}
            />

            <View style={Theme.u.listDivider} />
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

Privacy.propTypes = propTypesCommon
