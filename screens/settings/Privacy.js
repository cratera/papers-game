import React from 'react'
import { ScrollView, View } from 'react-native'
import * as Linking from 'expo-linking'

import { isWeb } from '@constants/layout'

import Page from '@components/page'
import { IconExternal } from '@components/icons'

import Item from './Item.js'
import { useSubHeader, propTypesCommon } from './utils'

import * as Theme from '@theme'

export default function Privacy({ navigation }) {
  const [ads, setAds] = React.useState(false)

  useSubHeader(navigation, 'Privacy')

  function handleCustomAdsToggle() {
    setAds(fakeBool => !fakeBool)
  }

  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={[Theme.u.scrollSideOffset]}>
          <View style={Theme.u.cardEdge}>
            {isWeb ? null : (
              <>
                <Item
                  title="Show personalized ads"
                  switchValue={ads}
                  onPress={handleCustomAdsToggle}
                />
              </>
            )}
            <Item
              hasDivider={!isWeb}
              title="Privacy Policy"
              Icon={IconExternal}
              onPress={() => Linking.openURL('https://papersgame.com/privacy-policy')}
            />
            <Item
              title="Terms of Service"
              Icon={IconExternal}
              onPress={() => Linking.openURL('https://papersgame.com/terms')}
            />
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

Privacy.propTypes = propTypesCommon
