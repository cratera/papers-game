import React from 'react'
import PropTypes from 'prop-types'

import { TextInput, Text, View } from 'react-native'

import * as Theme from '@theme'
import Styles from './HomeStyles.js'

import { headerTheme } from '@navigation/headerStuff.js'
import Page from '@components/page'
import Button from '@components/button'
import AvatarSelector from '@components/avatar/AvatarSelector'

import { window } from '@constants/layout'

const { vh } = window

// 🐛BUG / QUESTION: Had to transform this Component to a Class so TextInput works properly.
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
        if (this.state.step === 0 || (this.state.step === 1 && !this.state.name)) {
          return null
        } else if (this.state.step === 2) {
          if (!this.state.avatar) return null

          return (
            <Page.HeaderBtn side="right" primary onPress={this.setProfile}>
              Done
            </Page.HeaderBtn>
          )
        }

        return (
          <Page.HeaderBtn side="right" icon="next" textPrimary onPress={this.goNextStep}>
            Next
          </Page.HeaderBtn>
        )
      },
    })
  }

  render() {
    const state = this.state
    const CurrentStep = {
      0: this.stepWelcome,
      1: this.stepName,
      2: this.stepAvatar,
    }[state.step]

    return (
      <Page bgFill={state.step === 0 ? Theme.colors.yellow : Theme.colors.bg}>
        <Page.Main headerDivider={state.step !== 0} style={Styles.main}>
          <CurrentStep />
        </Page.Main>
        <Page.CTAs>
          {state.step === 0 && <Button onPress={this.goNextStep}>Start</Button>}
        </Page.CTAs>
      </Page>
    )
  }

  stepWelcome() {
    return (
      <View style={[Styles.content]}>
        <Text style={[Theme.typography.h2, Theme.u.center, { marginTop: -25 * vh }]}>Welcome!</Text>
        <Text
          style={[
            Theme.typography.secondary,
            Theme.u.center,
            { marginTop: 24, marginBottom: 72, maxWidth: 300 },
          ]}
        >
          Papers is the perfect game for your dinner party with friends or family.
        </Text>
      </View>
    )
  }

  stepName() {
    return (
      <View style={{ flex: 1, alignSelf: 'stretch' }}>
        <Text nativeID="inputNameLabel" style={[Theme.typography.h3, Theme.u.center]}>
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
          onChangeText={name => this.setState(state => ({ ...state, name }))}
        />
      </View>
    )
  }

  stepAvatar() {
    return (
      <View style={{ flex: 1, alignSelf: 'stretch' }}>
        <Text style={[Theme.typography.h3, Theme.u.center, { marginBottom: 16 }]}>
          Chose your character
        </Text>
        <View style={Theme.u.cardEdge}>
          {/* <View style={Styles.avatarList}> */}
          <AvatarSelector value={this.state.avatar} onChange={this.handleChangeAvatar} />
          {/* </View> */}
        </View>
      </View>
    )
  }

  handleChangeAvatar(avatar) {
    this.setState(state => ({
      ...state,
      avatar,
    }))
  }

  goNextStep() {
    this.setState(state => ({
      ...state,
      step: state.step + 1,
    }))
  }

  goBackStep() {
    this.setState(state => ({
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
