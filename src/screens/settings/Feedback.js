import { ScrollView, View } from 'react-native'

import * as StoreReview from 'expo-store-review'

import { requestBugReport, requestFeedback } from '@src/utils/emails'

import { IconExternal } from '@src/components/icons'
import Page from '@src/components/page'

import * as Theme from '@src/theme'

import { useEffectOnce } from '@src/hooks'
import Item from './Item.js'
import { propTypesCommon } from './utils'

function updateHeaderBackBtn(navigation, { title, btnText, onPress }) {
  navigation.getParent().setOptions({
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

export default function Feedback({ navigation }) {
  useEffectOnce(() => {
    updateHeaderBackBtn(navigation, {
      title: 'Feedback',
      btnText: 'Back',
      onPress: () => {
        navigation.goBack()
        updateHeaderBackBtn(navigation, {
          title: 'Settings',
          btnText: 'Back',
          onPress: () => navigation.getParent().goBack(),
        })
      },
    })
  })

  return (
    <Page>
      <Page.Main headerDivider>
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

Feedback.propTypes = propTypesCommon
