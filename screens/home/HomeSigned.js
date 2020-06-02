import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Image, View, Text, TouchableHighlight } from 'react-native'

import PapersContext from '@store/PapersContext.js'

import * as Theme from '@theme'
import Styles from './HomeStyles.js'

import Page from '@components/page'
import Button from '@components/button'
import { PickAvatar } from '@components/profile'
import danceGif from '@assets/images/dance.gif'

const AvatarMeme = ({ avatar, onChange }) => {
  const [isPickerVisible, setIsPickerVisible] = React.useState(false)

  return (
    <View style={Styles.memeContainer}>
      <TouchableHighlight
        underlayColor={Theme.colors.bg}
        style={Styles.memeHead}
        onPress={() => setIsPickerVisible(true)}
      >
        {avatar ? (
          <Image
            style={[Styles.avatarPlace, Styles.memeFace, Styles.avatarImg]}
            source={{ uri: avatar }}
            accessibilityLabel="Your uploaded avatar"
          />
        ) : (
          <View style={[Styles.avatarPlace, Styles.memeFace]} />
        )}
      </TouchableHighlight>
      <Image style={Styles.memeBody} source={danceGif} accessible={false} />
      <PickAvatar
        visible={isPickerVisible}
        onChange={() => null}
        onSubmit={onChange}
        onClose={() => setIsPickerVisible(false)}
      />
    </View>
  )
}

AvatarMeme.propTypes = {
  avatar: PropTypes.string,
  onChange: PropTypes.func.isRequired, // (value: String)
}

export default function HomeSigned({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const profile = Papers.state.profile

  if (Papers.status === 'isJoining') {
    return (
      <Page>
        <Page.Main style={Styles.main} blankBg>
          <Text style={Theme.typography.h2}>Joining {`"${profile.gameId}"`} ⏳</Text>
        </Page.Main>
      </Page>
    )
  }

  return (
    <Fragment>
      <Page>
        <Page.Main style={Styles.main} blankBg>
          <AvatarMeme avatar={profile.avatar} onChange={handleChangeAvatar} />
          <Text style={[Theme.typography.body, Theme.u.center]}>
            Welcome
            {'\n'}
            <Text style={Theme.typography.h1}>{profile.name}</Text>
          </Text>
        </Page.Main>
        <Page.CTAs>
          <Button onPress={() => openAccessGameModal('create')}>Create Game</Button>
          <Button
            variant="light"
            style={{ marginTop: 16 }}
            onPress={() => openAccessGameModal('join')}
          >
            Join Game
          </Button>
        </Page.CTAs>
      </Page>
    </Fragment>
  )

  function openAccessGameModal(variant) {
    navigation.navigate('access-game', { variant })
  }

  async function handleChangeAvatar(avatar) {
    Papers.updateProfile({ avatar })
  }
}

HomeSigned.propTypes = {
  navigation: PropTypes.object, // reactNavigation
}
