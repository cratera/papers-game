import React, { Fragment } from 'react';
import {
  Platform,
  Image,
  TouchableHighlight,
  Text,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';

import Modal from '@components/modal';
import Button from '@components/button';

import * as Theme from '@theme';
import Styles from './HomeStyles.js';

import usePickAvatar from './utils/usePickAvatar.js';

export default function InputAvatar({ avatar, onChange }) {
  const [status, setStatus] = React.useState(null); // loading || loaded || error?
  const [isPickerVisible, setIsPickerVisible] = React.useState(false);
  const pickAvatar = usePickAvatar();
  const isMissingCamera = true; // LATER - implement camera UI.
  const [isWeb] = React.useState(Platform.OS === 'web');

  return (
    <Fragment>
      <Text nativeID="inputAvatar" style={[Theme.typography.body, Styles.label]}>
        Add your avatar
      </Text>
      <TouchableHighlight
        style={[Styles.avatarPlace, { marginVertical: 24 }]}
        underlayColor={Theme.colors.primary}
        onPress={() => (isWeb || isMissingCamera ? handleUpdateAvatar() : setIsPickerVisible(true))}
      >
        {avatar ? (
          <Image
            style={[Styles.avatarPlace, Styles.avatarImg]}
            source={{ uri: avatar }}
            accessibilityLabel="Your uploaded avatar"
          />
        ) : (
          <View style={Styles.avatarPlaceContent}>
            { /* prettier-ignore */}
            <Svg style={Styles.avatarSvg} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={Theme.colors.primary}>
              <Path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={Styles.avatarTxt}>Upload a picture</Text>
          </View>
        )}
      </TouchableHighlight>
      <Text style={[Theme.typography.body, Styles.feedback]}>
        {status === 'loading' ? 'Loading...' : ''}
        {status === 'loaded' ? 'Looking good!' : ''}
      </Text>

      <Modal
        visible={isPickerVisible}
        hiddenClose
        animationType="fade"
        transparent
        presentationStyle="overFullScreen"
        style={Styles2.modal}
        styleContent={Styles2.modalContent}
      >
        <TouchableWithoutFeedback onPress={() => setIsPickerVisible(false)}>
          <Text style={Styles2.options_outside} accessible={false}></Text>
        </TouchableWithoutFeedback>
        <View style={Styles2.options}>
          <Button style={[Styles2.options_btn, Styles2.options_btnTop]} onPress={handleCamera}>
            📷Camera
          </Button>
          <Button
            style={[Styles2.options_btn, Styles2.options_btnBot]}
            onPress={handleUpdateAvatar}
          >
            🖼 Library
          </Button>
        </View>

        <Button onPress={() => setIsPickerVisible(false)}>Close</Button>
      </Modal>
    </Fragment>
  );

  async function handleUpdateAvatar() {
    setStatus('loading');
    const url = await pickAvatar();
    setIsPickerVisible(false);
    setStatus(url ? 'loaded' : '');
    onChange(url);
  }

  async function handleCamera() {
    console.warn('TODO implement native camera');
  }
}

// const vh = Dimensions.get('window').height / 100;
const Styles2 = StyleSheet.create({
  options: {
    backgroundColor: Theme.colors.bg,
    marginBottom: 24,
    paddingVertical: 8,
    borderRadius: 16,
  },
  options_outside: {
    flexGrow: 1,
    // backgroundColor: Theme.colors.primary,
  },
  options_btn: {
    backgroundColor: Theme.colors.bg,
    color: Theme.colors.grayDark,
    textAlign: 'left',
  },
  options_btnTop: {
    // 🐛 Not working on IOS...
    // borderBottomEndRadius: 0,
    // borderBottomStartRadius: 0,
  },
  options_btnBot: {
    // 🐛 Not working on IOS...
    // borderTopLeftRadius: 0,
    // borderTopRightRadius: 0,
  },
  modal: {},
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingBottom: 56,
  },
});
