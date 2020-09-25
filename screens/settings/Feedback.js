import React from 'react'
import { ScrollView, View } from 'react-native'

import * as MailComposer from 'expo-mail-composer'
import * as StoreReview from 'expo-store-review'

import { mailToFeedback, mailToBug } from '@constants/utils'

import PapersContext from '@store/PapersContext.js'

import Page from '@components/page'
import { IconArrow } from '@components/icons'

import * as Theme from '@theme'

import Item from './Item.js'
import { propTypesCommon } from './utils'

function updateHeaderBackBtn(navigation, { title, btnText, onPress }) {
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

export default function Feedback({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { about } = Papers.state

  React.useEffect(() => {
    updateHeaderBackBtn(navigation, {
      title: 'Feedback',
      btnText: 'Back',
      onPress: () => {
        navigation.goBack()
        updateHeaderBackBtn(navigation, {
          title: 'Settings',
          btnText: 'Back',
          onPress: () => navigation.dangerouslyGetParent().goBack(),
        })
      },
    })
  }, [])

  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={[Theme.u.scrollSideOffset]}>
          <View style={Theme.u.cardEdge}>
            {[
              {
                id: 'rate',
                title: 'Rate Papers',
                icon: 'App Store',
                onPress: () => StoreReview.requestReview(), // TODO!! before release
              },
              {
                id: 'fb',
                title: 'Send feedback',
                Icon: IconArrow,
                onPress: async () => {
                  await MailComposer.composeAsync(mailToFeedback(`${about.version}@${about.ota}`))
                },
              },
              {
                id: 'fbug',
                title: 'Report a bug',
                Icon: IconArrow,
                onPress: async () => {
                  await MailComposer.composeAsync(mailToBug(`${about.version}@${about.ota}`))
                },
              },
            ].map(item => (
              <Item key={item.id} {...item} />
            ))}

            <View style={Theme.u.listDivider} />
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

Feedback.propTypes = propTypesCommon
