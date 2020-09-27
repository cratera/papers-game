import React from 'react'
import { View, Text, Alert, Platform } from 'react-native'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'

import Button from '@components/button'
import Page from '@components/page'

import { useSubHeader, propTypesCommon } from './utils'

export default function AccountDeletion({ navigation }) {
  const Papers = React.useContext(PapersContext)
  useSubHeader(navigation, 'Delete account')

  async function handleDeleteAccount() {
    if (Platform.OS === 'web') {
      if (window.confirm(`This will delete your profile locally and from Papers' servers?`)) {
        await Papers.resetProfile()
        navigation.dangerouslyGetParent().reset({
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
              navigation.dangerouslyGetParent().reset({
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
    <Page>
      <Page.Main headerDivider>
        <View style={{ marginTop: 48 }}>
          <Text style={[Theme.typography.body, Theme.u.center]}>Are you sure?</Text>
          <Text
            style={[Theme.typography.secondary, Theme.u.center, { marginTop: 8, marginBottom: 48 }]}
          >
            All your data will be deleted from your phone and from Papers servers
          </Text>
          <Button onPress={handleDeleteAccount}>Delete account</Button>
        </View>
      </Page.Main>
    </Page>
  )
}

AccountDeletion.propTypes = propTypesCommon
