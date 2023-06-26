import * as Linking from 'expo-linking'
import { Stack, useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'

import { IconExternal } from '@src/components/icons'
import Page from '@src/components/page'
import Item from '@src/components/settings/Item'
import headerTheme from '@src/navigation/headerTheme'
import * as Theme from '@src/theme'
import { isWeb } from '@src/utils/device'

export default function Privacy() {
  const [ads, setAds] = useState(false)
  const router = useRouter()

  function handleCustomAdsToggle() {
    setAds((fakeBool) => !fakeBool)
  }

  return (
    <Page>
      <Stack.Screen
        options={{
          ...headerTheme(),
          headerTitle: 'Privacy',
          headerLeft: () => (
            <Page.HeaderBtn side="left" onPress={() => router.push('/settings')}>
              Back
            </Page.HeaderBtn>
          ),
        }}
      />

      <Page.Main>
        <ScrollView style={Theme.utils.scrollSideOffset}>
          <View style={Theme.utils.cardEdge}>
            {isWeb ? null : (
              <Item
                title="Show personalized ads"
                switchValue={ads}
                onPress={handleCustomAdsToggle}
              />
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
