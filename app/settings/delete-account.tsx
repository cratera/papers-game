import { Stack, useRouter } from 'expo-router'
import React from 'react'
import { Alert, Platform, StyleSheet, Text, View } from 'react-native'

import Button from '@src/components/button'
import Card from '@src/components/card'
import Page from '@src/components/page'
import headerTheme from '@src/navigation/headerTheme'
import PapersContext from '@src/store/PapersContext'
import * as Theme from '@src/theme'

export default function AccountDeletion() {
  const Papers = React.useContext(PapersContext)
  const router = useRouter()

  async function handleDeleteAccount() {
    if (Platform.OS === 'web') {
      if (window.confirm(`This will delete your profile locally and from Papers' servers?`)) {
        await Papers.resetProfile().then(() => router.push('/'))
      }
    } else {
      Alert.alert(
        'Delete profile',
        "This will delete your profile locally and from Papers' servers",
        [
          {
            text: 'Delete profile',
            onPress: async () => {
              await Papers.resetProfile().then(() => router.push('/'))
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
      <Stack.Screen
        options={{
          ...headerTheme({
            hiddenTitle: true,
          }),
          headerTitle: 'Delete account',
          headerLeft: () => (
            <Page.HeaderBtn side="left" onPress={() => router.push('/settings')}>
              Back
            </Page.HeaderBtn>
          ),
        }}
      />

      <Page.Main>
        <View style={Theme.spacing.mt_48}>
          <Card variant="paper-cry"></Card>
          <Text style={[Theme.typography.h2, Theme.utils.center, Theme.spacing.mt_32]}>
            Are you sure?
          </Text>
          <Text style={[Theme.typography.body, Theme.utils.center, Theme.spacing.mt_16]}>
            All your data will be deleted.
          </Text>
        </View>
      </Page.Main>
      <Page.CTAs>
        <Button variant="blank" onPress={handleDeleteAccount}>
          Yes, delete account
        </Button>
        <Button variant="ghost" onPress={() => router.back()} style={Styles.button_back}>
          No, take me back
        </Button>
      </Page.CTAs>
    </Page>
  )
}

const Styles = StyleSheet.create({
  button_back: {
    marginTop: 8,
    marginBottom: -16,
  },
})
