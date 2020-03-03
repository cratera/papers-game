import React, { Fragment, useState, useContext } from 'react';
import { Image, View, StyleSheet, Text, TouchableHighlight } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import PapersContext from '@store/PapersContext.js';

import * as Theme from '@theme';
import Styles from './HomeStyles.js';

import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

import Page from '@components/page';
import Button from '@components/button';
import TheText from '@components/typography/TheText.js';
import danceGif from '@assets/images/dance.gif';

import AccessGameModal from './AccessGameModal.js';

const AvatarMeme = ({ avatar, onChange }) => (
  <View style={Styles.memeContainer}>
    <TouchableHighlight
      underlayColor={Theme.colors.greyDark}
      style={Styles.memeHead}
      onPress={onChange}
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
  </View>
);

export default function HomeSigned({ navigation }) {
  const Papers = useContext(PapersContext);
  const profile = Papers.state.profile;
  const [modalState, setModalState] = useState({ isOpen: false, variant: null });

  return (
    <Fragment>
      <Page>
        <Page.Header></Page.Header>
        <Page.Main style={Styles.main}>
          <AvatarMeme avatar={profile.avatar} onChange={handleUpdateAvatar} />
          <TheText style={Theme.u.center}>
            Welcome
            {'\n'}
            <Text style={Theme.typography.h1}>{profile.name}</Text>
          </TheText>
        </Page.Main>
        <Page.CTAs>
          <Button onPress={() => openAccessGameModal('join')}>Join Game</Button>
          <Button
            variant="light"
            style={{ marginTop: 16 }}
            onPress={() => openAccessGameModal('create')}
          >
            Create Game
          </Button>
        </Page.CTAs>
      </Page>
      <AccessGameModal
        isOpen={modalState.isOpen}
        variant={modalState.variant}
        onClose={closeAccessModalClose}
      />
    </Fragment>
  );

  function openAccessGameModal(variant) {
    setModalState({
      isOpen: true,
      variant,
    });
  }

  function closeAccessModalClose() {
    setModalState({ isOpen: false, variant: null });
  }

  async function handleUpdateAvatar() {
    // OPTIMIZE - Same as HomeSignup. Isolate in a customHook?
    // Get permission first on iOS.
    if (Constants.platform.ios) {
      const response = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (!response.granted) {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
      exif: false,
    });

    console.log('image result::', result);

    if (result.uri) {
      Papers.updateProfile({
        avatar: result.uri,
      });
    }
  }
}
