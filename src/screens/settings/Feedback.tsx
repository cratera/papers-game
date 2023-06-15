import { ScrollView, View } from 'react-native'

import * as StoreReview from 'expo-store-review'

import { requestBugReport, requestFeedback } from '@src/utils/emails'

import { IconExternal } from '@src/components/icons'
import Page from '@src/components/page'

import * as Theme from '@src/theme'

import { NavigationProp } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { AppStackParamList } from '@src/navigation/navigation.types'
import { useEffectOnce } from 'usehooks-ts'
import Item from './Item'

type HeaderBackBtnOptions = {
  title: string
  btnText: string
  onPress: () => void
}

function updateHeaderBackBtn(
  navigation: NavigationProp<AppStackParamList>,
  { title, btnText, onPress }: HeaderBackBtnOptions
) {
  navigation.getParent()?.setOptions({
    headerTitle: title,
    headerLeft: function HB() {
      return (
        <Page.HeaderBtn side="left" onPress={onPress}>
          {btnText}
        </Page.HeaderBtn>
      )
    },
  })
}

export default function Feedback({
  navigation,
}: StackScreenProps<AppStackParamList, 'settings-feedback'>) {
  useEffectOnce(() => {
    updateHeaderBackBtn(navigation, {
      title: 'Feedback',
      btnText: 'Back',
      onPress: () => {
        navigation.goBack()
        updateHeaderBackBtn(navigation, {
          title: 'Settings',
          btnText: 'Back',
          onPress: () => navigation.getParent()?.goBack(),
        })
      },
    })
  })

  return (
    <Page>
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
