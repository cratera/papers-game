import { Stack, useRouter } from 'expo-router'
import * as StoreReview from 'expo-store-review'
import { ScrollView, View } from 'react-native'

import { IconExternal } from '@src/components/icons'
import Page from '@src/components/page'
import Item from '@src/components/settings/Item'
import headerTheme from '@src/navigation/headerTheme'
import * as Theme from '@src/theme'
import { requestBugReport, requestFeedback } from '@src/utils/emails'

export default function Feedback() {
  const router = useRouter()

  return (
    <Page>
      <Stack.Screen
        options={{
          ...headerTheme(),
          headerTitle: 'Feedback',
          headerLeft: () => {
            return (
              <Page.HeaderBtn side="left" onPress={() => router.push('/settings')}>
                Back
              </Page.HeaderBtn>
            )
          },
        }}
      />

      <Page.Main>
        <ScrollView style={Theme.utils.scrollSideOffset}>
          <View style={Theme.utils.cardEdge}>
            {[
              {
                id: 'rate',
                title: 'Rate Papers',
                icon: 'App Store',
                onPress: () => StoreReview.requestReview(), // TODO: before release
              },
              {
                id: 'fb',
                title: 'Send feedback',
                Icon: IconExternal,
                onPress: async () => {
                  await requestFeedback()
                },
              },
              {
                hasDivider: true,
                id: 'fbug',
                title: 'Report a bug',
                Icon: IconExternal,
                onPress: async () => {
                  await requestBugReport()
                },
              },
            ].map((item) => (
              <Item key={item.id} {...item} />
            ))}
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}
