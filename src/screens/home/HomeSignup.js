import PropTypes from 'prop-types'
import React from 'react'

import { Text, TextInput, View } from 'react-native'

import * as Theme from '@src/theme'
import Styles from './HomeStyles.js'

import AvatarSelector from '@src/components/avatar/AvatarSelector'
import Button from '@src/components/button'
import Page from '@src/components/page'
import { headerTheme } from '@src/navigation/headerStuff.js'

import { window } from '@src/utils/device'

const { vh } = window

// TODO: 🐛BUG / QUESTION: Had to transform this Component to a Class so TextInput works properly.
// When it was a function component, on onChangeText trigger, the TextInput would unmount/mount,
// causing the keyboard to close.... have no idea why. Google didn't help :(

export default class HomeSignup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      avatar: null,
      step: 0,
    }

    this.stepWelcome = this.stepWelcome.bind(this)
    this.stepName = this.stepName.bind(this)
    this.stepAvatar = this.stepAvatar.bind(this)

    this.goNextStep = this.goNextStep.bind(this)
    this.goBackStep = this.goBackStep.bind(this)
    this.setProfile = this.setProfile.bind(this)

    this.handleChangeAvatar = this.handleChangeAvatar.bind(this)
  }

  componentDidMount() {
    this.props.navigation.setOptions({
      ...headerTheme({ hiddenTitle: true }),
      headerLeft: null,
      headerRight: null,
    })
  }

  componentWillUnmount() {
    this.props.navigation.setOptions({
      headerLeft: null,
      headerRight: null,
    })
  }

  componentDidUpdate(prevProps, prevState) {
    this.props.navigation.setOptions({
      headerLeft:
        this.state.step === 0
          ? null
          : () => (
              <Page.HeaderBtn side="left" icon="back" onPress={this.goBackStep}>
                Back
              </Page.HeaderBtn>
            ),
      headerRight: () => {
        if (this.state.step === 0 && this.state.name) {
          return (
            <Page.HeaderBtn side="right" icon="next" textPrimary onPress={this.goNextStep}>
              Next
            </Page.HeaderBtn>
          )
        }
      },
    })
  }

  render() {
    const state = this.state
    const CurrentStep = {
      // 0: this.stepWelcome,
      0: this.stepName,
      1: this.stepAvatar,
    }[state.step]

    console.log('xx', this.state.avatar)
    return (
      <Page bgFill={/* state.step === 0 ? Theme.colors.yellow : */ Theme.colors.bg}>
        <Page.Main headerDivider={state.step !== 0} style={Styles.main}>
          <CurrentStep />
        </Page.Main>
        <Page.CTAs>
          {state.step === 0 && <Button onPress={this.goNextStep}>Start</Button>}
          {state.step === 1 && state.avatar && <Button onPress={this.setProfile}>Choose</Button>}

          {/* {state.step === 1 && <Button onPress={this.goNextStep}>Choose</Button>} */}
        </Page.CTAs>
      </Page>
    )
  }

  stepWelcome() {
    return (
      <View style={Styles.content}>
        <Text style={[Theme.typography.h2, Theme.utils.center, { marginTop: -25 * vh }]}>
          Welcome!
        </Text>
        {/* <Text
          style={[
            Theme.typography.secondary,
            Theme.utils.center,
            { marginTop: 24, marginBottom: 72, maxWidth: 300 },
          ]}
        >
          Papers is the perfect game for your dinner party with friends or family.
        </Text> */}
      </View>
    )
  }

  stepName() {
    return (
      <View style={{ flex: 1, alignSelf: 'stretch' }}>
        <Text nativeID="inputNameLabel" style={[Theme.typography.h3, Theme.utils.center]}>
          How should we call you?
        </Text>
        <TextInput
          style={[Theme.typography.h2, Styles.input]}
          inputAccessoryViewID="name"
          autoFocus
          nativeID="inputNameLabel"
          defaultValue={this.state.name}
          placeholder="Your name"
          placeholderTextColor={Theme.colors.grayLight}
          maxLength={10}
          onChangeText={(name) => this.setState((state) => ({ ...state, name }))}
        />
      </View>
    )
  }

  stepAvatar() {
    return (
      <View style={{ flex: 1, alignSelf: 'stretch' }}>
        <Text style={[Theme.typography.h3, Theme.utils.center, { marginBottom: 16 }]}>
          Chose your character
        </Text>
        <View style={Theme.utils.cardEdge}>
          {/* <View style={Styles.avatarList}> */}
          <AvatarSelector
            value={this.state.avatar}
            onChange={this.handleChangeAvatar}
            isChangeOnMount
          />
          {/* </View> */}
        </View>
      </View>
    )
  }

  handleChangeAvatar(avatar) {
    console.log('change', avatar)
    this.setState((state) => ({
      ...state,
      avatar,
    }))
  }

  goNextStep() {
    this.setState((state) => ({
      ...state,
      step: state.step + 1,
    }))
  }

  goBackStep() {
    this.setState((state) => ({
      ...state,
      step: state.step - 1,
    }))
  }

  setProfile() {
    const { name, avatar } = this.state
    this.props.onSubmit({ name, avatar })
  }
}

HomeSignup.propTypes = {
  onSubmit: PropTypes.func.isRequired, // (profile: Object)
  navigation: PropTypes.object, // reactNavigation
}
