import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import PapersContext from '@src/store/PapersContext'
import * as Theme from '@src/theme'

import AvatarSelector from '@src/components/avatar/AvatarSelector'
import Page from '@src/components/page'

import { StackScreenProps } from '@react-navigation/stack'
import Button from '@src/components/button'
import { AppStackParamList } from '@src/navigation/navigation.types'
import { Profile } from '@src/store/PapersContext.types'
import { useSubHeader } from './utils'

export default function SettingsProfileAvatar({
  navigation,
}: StackScreenProps<AppStackParamList, 'settings-profile-avatar'>) {
  const Papers = React.useContext(PapersContext)
  const { profile } = Papers.state
  const [avatar, setAvatar] = React.useState<Profile['avatar']>('abraul')
  const defaultAvatar = React.useRef(profile?.avatar).current
  useSubHeader(navigation, 'Account', {
    hiddenTitle: true,
  })

  function handleOnSelectorChange(avatar: Profile['avatar']) {
    setAvatar(avatar)
  }

  async function handleOnDone() {
    await Papers.updateProfile({ avatar })
    navigation.goBack()
  }

  return (
    <Page>
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
