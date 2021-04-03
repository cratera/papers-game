import React from 'react'
import { View, Text } from 'react-native'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'

import Page from '@components/page'
import AvatarSelector from '@components/avatar/AvatarSelector'

import Button from '@components/button'
import { useSubHeader, propTypesCommon } from './utils'

export default function SettingsProfileAvatar({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile } = Papers.state
  const [avatar, setAvatar] = React.useState('')
  const defaultAvatar = React.useRef(profile.avatar).current
  useSubHeader(navigation, 'Account', {
    hiddenTitle: true,
  })

  function handleOnSelectorChange(avatar) {
    setAvatar(avatar)
  }

  async function handleOnDone() {
    await Papers.updateProfile({ avatar })
    navigation.goBack()
  }

  return (
    <Page>
      <Page.Main>
        <View
          style={[
            Theme.u.cardEdge,
            Theme.u.middle,
            {
              flexGrow: 1,
              marginBottom: 120, // CTAs height
            },
          ]}
        >
          <Text
            style={[
              Theme.typography.h3,
              Theme.u.center,
              {
                marginBottom: 32,
                position: 'absolute',
                top: 0,
                textAlign: 'center',
                width: '100%',
              },
            ]}
          >
            Choose your character
          </Text>
          <View
            style={[
              {
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              },
            ]}
          >
            {/* Needed to make it centered */}
            <View>
              <AvatarSelector
                value={profile.avatar}
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

SettingsProfileAvatar.propTypes = propTypesCommon
