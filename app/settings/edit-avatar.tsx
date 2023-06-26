import { Stack, useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import AvatarSelector from '@src/components/avatar/AvatarSelector'
import Button from '@src/components/button'
import Page from '@src/components/page'
import headerTheme from '@src/navigation/headerTheme'
import { usePapersContext } from '@src/store/PapersContext'
import { Profile } from '@src/store/PapersContext.types'
import * as Theme from '@src/theme'

export default function EditAvatar() {
  const Papers = usePapersContext()
  const { profile } = Papers.state
  const [avatar, setAvatar] = useState<Profile['avatar']>('abraul')
  const defaultAvatar = useRef(profile?.avatar).current
  const router = useRouter()

  function handleOnSelectorChange(avatar: Profile['avatar']) {
    setAvatar(avatar)
  }

  async function handleOnDone() {
    await Papers.updateProfile({ avatar })

    router.push('/settings')
  }

  return (
    <Page>
      <Stack.Screen
        options={{
          ...headerTheme(),
          headerTitle: 'Account',
          headerLeft: () => (
            <Page.HeaderBtn side="left" onPress={() => router.push('/settings')}>
              Back
            </Page.HeaderBtn>
          ),
        }}
      />
      <Page.Main>
        <View style={[Theme.utils.cardEdge, Theme.utils.middle, Styles.container]}>
          <Text style={[Theme.typography.h3, Theme.utils.center, Styles.wrapper]}>
            Choose your character
          </Text>

          <View style={Styles.selector}>
            {/* Needed to make it centered */}
            <View>
              <AvatarSelector
                value={profile?.avatar || 'abraul'}
                defaultValue={defaultAvatar}
                onChange={handleOnSelectorChange}
              />
            </View>
          </View>
        </View>
      </Page.Main>

      <Page.CTAs>
        <Button onPress={handleOnDone}>Choose</Button>
      </Page.CTAs>
    </Page>
  )
}

const Styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    marginBottom: 120, // CTAs height
  },
  wrapper: {
    marginBottom: 32,
    position: 'absolute',
    top: 0,
    textAlign: 'center',
    width: '100%',
  },
  selector: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
})
