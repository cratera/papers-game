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

import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

import * as Theme from '@theme';
import Styles from './HomeStyles.js';

import Page from '@components/page';
import Button from '@components/button';

import InputAvatar from './InputAvatar.js';

// 🐛BUG / QUESTION: Had to transform this Component to a Class so TextInput works properly.
// When it was a function component, on onChangeText trigger, the TextInput would unmount/mount,
// causing the keyboard to close.... have no idea why. Google didn't help :(

export default class HomeSignup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      avatar: null,
      step: 0,
    };

    this.stepWelcome = this.stepWelcome.bind(this);
    this.stepName = this.stepName.bind(this);
    this.stepAvatar = this.stepAvatar.bind(this);

    this.goNextStep = this.goNextStep.bind(this);
    this.goBackStep = this.goBackStep.bind(this);
    this.setProfile = this.setProfile.bind(this);

    this.handleChangeAvatar = this.handleChangeAvatar.bind(this);

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
            <Button variant="flat" onPress={this.goBackStep} style={{ lineHeight: 44 }}>
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
        <Text style={[Theme.typography.secondary, Styles.paragraph]}>
          Papers is the perfect game for your{' '}
          <Text style={Theme.typography.secondary} numberOfLines={1}>
            dinner party.
          </Text>
          {'\n'}
          <Text style={Theme.typography.secondary}>Made with love by Maggie and Sandy 😎</Text>
        </Text>
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
          <Text nativeID="inputNameLabel" style={[Styles.label, Theme.typography.body]}>
            How should we call you?
          </Text>
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
          <InputAvatar avatar={this.state.avatar} onChange={this.handleChangeAvatar} />
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

  handleChangeAvatar(avatar) {
    if (avatar) {
      this.setState(state => ({
        ...state,
        avatar,
      }));
    }
  }

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
