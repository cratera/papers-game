import { Stack, useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import AvatarSelector from '@src/components/avatar/AvatarSelector'
import Button from '@src/components/button'
import Page from '@src/components/page'
import headerTheme from '@src/navigation/headerTheme'
import * as Sentry from '@src/services/sentry'
import { usePapersContext } from '@src/store/PapersContext'
import { Profile } from '@src/store/PapersContext.types'
import * as Theme from '@src/theme'

export default function SignUp() {
  const Papers = usePapersContext()
  const [name, setName] = useState<Profile['name']>('')
  const [avatar, setAvatar] = useState<Profile['avatar']>('abraul')
  const [step, setStep] = useState(0)
  const router = useRouter()

  const handleUpdateProfile = async () => {
    try {
      await Papers.updateProfile({
        name,
        avatar,
      }).then(() => router.push('/'))
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'UP_0' } })
    }
  }

  return (
    <Page bgFill="bg">
      <Stack.Screen
        options={{
          ...headerTheme({
            hiddenTitle: true,
          }),
          headerTitle: 'Sign up',
          headerLeft:
            step === 0
              ? undefined
              : () => (
                  <Page.HeaderBtn side="left" onPress={() => setStep((prevState) => prevState - 1)}>
                    Back
                  </Page.HeaderBtn>
                ),
          headerRight: () => {
            if (step === 0 && !!name) {
              return (
                <Page.HeaderBtn side="right" onPress={() => setStep((prevState) => prevState + 1)}>
                  Next
                </Page.HeaderBtn>
              )
            }
          },
        }}
      />

      <Page.Main style={Styles.main}>
        <View style={Styles.container}>
          {/* Name */}
          {step === 0 && (
            <>
              <Text nativeID="inputNameLabel" style={[Theme.typography.h3, Theme.utils.center]}>
                How should we call you?
              </Text>

              <TextInput
                style={[Theme.typography.h2, Styles.input]}
                inputAccessoryViewID="name"
                autoFocus
                nativeID="inputNameLabel"
                defaultValue={name}
                placeholder="Your name"
                placeholderTextColor={Theme.colors.grayLight}
                maxLength={10}
                onChangeText={setName}
              />
            </>
          )}

          {/* Avatar */}
          {step === 1 && (
            <>
              <Text style={[Theme.typography.h3, Theme.utils.center, Theme.spacing.mb_16]}>
                Choose your avatar
              </Text>

              <View style={Theme.utils.cardEdge}>
                <AvatarSelector value={avatar} onChange={setAvatar} isChangeOnMount />
              </View>
            </>
          )}
        </View>
      </Page.Main>
      <Page.CTAs>
        {step === 0 && <Button onPress={() => setStep((prevState) => prevState + 1)}>Start</Button>}

        {step === 1 && <Button onPress={handleUpdateProfile}>Choose</Button>}
      </Page.CTAs>
    </Page>
  )
}

const Styles = StyleSheet.create({
  main: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 40,
  },
  container: {
    flex: 1,
    alignSelf: 'stretch',
  },
  input: {
    borderBottomColor: Theme.colors.grayDark,
    borderBottomWidth: 2,
    textAlign: 'center',
    marginTop: 60,
    height: 76,
    color: Theme.colors.purple,
  },
})
