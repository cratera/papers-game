import React, { Fragment, useContext, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  Text,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { Svg, Path } from 'react-native-svg';

import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

import * as Theme from '@theme';
import Styles from './HomeStyles.js';

import Page from '@components/page';
import Button from '@components/button';
import TheText from '@components/typography/TheText.js';
// import PapersContext from '@store/PapersContext.js';

// 🐛BUG / QUESTION: Had to transform this Component to a Class so TextInput works properly.
// Back in a function component, on each onChangeText, the TextInput would unmount/mount,
// causing the keyboard to close.... have no idea why. Google didn't help :( */}

export default class HomeSignup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      avatar: null,
      step: 0,
      avatarStatus: null, // loading || loaded || error?
    };

    this.stepWelcome = this.stepWelcome.bind(this);
    this.stepName = this.stepName.bind(this);
    this.stepAvatar = this.stepAvatar.bind(this);

    this.goNextStep = this.goNextStep.bind(this);
    this.goBackStep = this.goBackStep.bind(this);
    this.setProfile = this.setProfile.bind(this);

    this.handlePickAvatar = this.handlePickAvatar.bind(this);

    // const Papers = useContext(PapersContext);
  }

  render() {
    const state = this.state;
    const CurrentStep = {
      0: this.stepWelcome,
      1: this.stepName,
      2: this.stepAvatar,
    }[state.step];

    return (
      <Page>
        <Page.Header>
          {state.step > 0 ? (
            <Button variant="flat" onPress={this.goBackStep}>
              Back
            </Button>
          ) : (
            undefined
          )}
        </Page.Header>
        <Page.Main styles={Styles.main}>
          <CurrentStep />
        </Page.Main>
        <Page.CTAs>{state.step === 0 && <Button onPress={this.goNextStep}>Next</Button>}</Page.CTAs>
      </Page>
    );
  }

  stepWelcome() {
    return (
      <View>
        <Text style={[Styles.logo, Theme.u.center]} accessibilityRole="none">
          🎲
        </Text>
        <Text style={[Theme.typography.h1, Theme.u.center]}>Welcome!</Text>
        <TheText style={[Theme.typography.secondary, Styles.paragraph]}>
          Papers is the perfect game for your{' '}
          <TheText style={Theme.typography.secondary} numberOfLines={1}>
            dinner party.
          </TheText>
          {'\n'}
          <TheText style={Theme.typography.secondary}>
            Made with love by Maggie and Sandy 😎
          </TheText>
        </TheText>
      </View>
    );
  }

  stepName() {
    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        keyboardShouldPersistTaps="always"
        style={{ flex: 1, alignSelf: 'stretch' }}
      >
        <ScrollView>
          <TheText nativeID="inputNameLabel" style={Styles.label}>
            How should we call you?
          </TheText>
          <TextInput
            style={[Theme.typography.h1, Styles.input]}
            inputAccessoryViewID="name"
            autoFocus
            nativeID="inputNameLabel"
            defaultValue={this.state.name}
            onChangeText={name => this.setState(state => ({ ...state, name }))}
          />
        </ScrollView>
        {this.state.name ? (
          <Button style={Styles.cta} onPress={this.goNextStep}>
            Next
          </Button>
        ) : (
          undefined
        )}
      </KeyboardAvoidingView>
    );
  }

  stepAvatar() {
    return (
      <View style={{ flex: 1, alignSelf: 'stretch' }}>
        <View style={{ flex: 1, alignSelf: 'stretch' }}>
          <TheText nativeID="inputAvatar" style={Styles.label}>
            Add your avatar
          </TheText>
          {this.state.avatar ? (
            <Image
              style={[Styles.avatarPlace, Styles.avatarImg]}
              source={{ uri: this.state.avatar }}
              accessibilityLabel="Your uploaded avatar"
            />
          ) : (
            <TouchableHighlight
              style={Styles.avatarPlace}
              underlayColor={Theme.colors.primary}
              onPress={this.handlePickAvatar}
            >
              <View style={Styles.avatarPlaceContent}>
                <Svg
                  style={Styles.avatarSvg}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={Theme.colors.primary}
                >
                  <Path
                    d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={Styles.avatarTxt}>Upload or take a picture</Text>
              </View>
            </TouchableHighlight>
          )}
          <TheText style={Styles.feedback}>
            {this.state.avatarStatus === 'loading' ? 'Loading...' : ''}
            {this.state.avatarStatus === 'loaded' ? 'Looking good!' : ''}
          </TheText>
        </View>

        {this.state.avatar ? (
          <Button style={Styles.ctaBottom} onPress={this.setProfile}>
            Finish
          </Button>
        ) : (
          <Button
            onPress={this.setProfile}
            variant="flat"
            style={[Styles.ctaBottom, { color: Theme.colors.primary }]}
          >
            Skip this step
          </Button>
        )}
      </View>
    );
  }

  handlePickAvatar = async () => {
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
      this.setState(state => ({
        ...state,
        avatar: result.uri,
        avatarStatus: 'loaded',
      }));
    }
  };

  goNextStep() {
    this.setState(state => ({
      ...state,
      step: state.step + 1,
    }));
  }

  goBackStep() {
    this.setState(state => ({
      ...state,
      step: state.step - 1,
    }));
  }

  setProfile() {
    const { name, avatar } = this.state;
    this.props.onSubmit({ name, avatar });
  }
}
