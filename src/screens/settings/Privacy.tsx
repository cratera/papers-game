import * as Linking from 'expo-linking'
import React from 'react'
import { ScrollView, View } from 'react-native'

import { isWeb } from '@src/utils/device'

import { IconExternal } from '@src/components/icons'
import Page from '@src/components/page'

import Item from './Item'
import { useSubHeader } from './utils'

import { StackScreenProps } from '@react-navigation/stack'
import { AppStackParamList } from '@src/navigation/navigation.types'
import * as Theme from '@src/theme'

export default function Privacy({
  navigation,
}: StackScreenProps<AppStackParamList, 'settings-privacy'>) {
  const [ads, setAds] = React.useState(false)

  useSubHeader(navigation, 'Privacy')

  function handleCustomAdsToggle() {
    setAds((fakeBool) => !fakeBool)
  }

  return (
    <Page>
      <Page.Main>
        <ScrollView style={Theme.utils.scrollSideOffset}>
          <View style={Theme.utils.cardEdge}>
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
