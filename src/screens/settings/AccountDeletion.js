import React from 'react'
import { Alert, Platform, Text, View } from 'react-native'

import PapersContext from '@src/store/PapersContext'
import * as Theme from '@src/theme'

import Button from '@src/components/button'
import Card from '@src/components/card'
import Page from '@src/components/page'
import { propTypesCommon, useSubHeader } from './utils'

export default function AccountDeletion({ navigation }) {
  const Papers = React.useContext(PapersContext)
  useSubHeader(navigation, 'Delete account', {
    hiddenTitle: true,
  })

  async function handleDeleteAccount() {
    if (Platform.OS === 'web') {
      if (window.confirm(`This will delete your profile locally and from Papers' servers?`)) {
        await Papers.resetProfile()
        navigation.getParent().reset({
          index: 0,
          routes: [{ name: 'home' }],
        })
      }
    } else {
      Alert.alert(
        'Delete profile',
        "This will delete your profile locally and from Papers' servers",
        [
          {
            text: 'Delete profile',
            onPress: async () => {
              await Papers.resetProfile()
              navigation.getParent().reset({
                index: 0,
                routes: [{ name: 'home' }],
              })
            },
            style: 'destructive',
          },
          {
            text: 'Cancel',
            onPress: () => true,
            style: 'cancel',
          },
        ],
        { cancelable: false }
      )
    }
  }

  return (
    <Page bgFill="pink_desatured">
      <Page.Main headerDivider>
        <View style={{ marginTop: 48 }}>
          <Card variant="paper-cry"></Card>
          <Text style={[Theme.typography.h2, Theme.utils.center, { marginTop: 32 }]}>
            Are you sure?
          </Text>
          <Text style={[Theme.typography.body, Theme.utils.center, { marginTop: 16 }]}>
            All your data will be deleted.
          </Text>
        </View>
      </Page.Main>
      <Page.CTAs>
        <Button variant="blank" onPress={handleDeleteAccount}>
          Yes, delete account
        </Button>
        <Button
          variant="ghost"
          onPress={navigation.goBack}
          style={{
            marginTop: 8,
            marginBottom: -16,
          }}
        >
          No, take me back
        </Button>
      </Page.CTAs>
    </Page>
  )
}

AccountDeletion.propTypes = propTypesCommon
