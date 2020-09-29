import React from 'react'
import PropTypes from 'prop-types'

import { TextInput, Text, View } from 'react-native'

import * as Theme from '@theme'
import Styles from './HomeStyles.js'

import { headerTheme } from '@navigation/headerStuff.js'
import Page from '@components/page'
import Button from '@components/button'

import InputAvatar from './InputAvatar.js'

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
      headerRight: () => (
        <Page.HeaderBtn side="right" icon="next" textPrimary onPress={this.goNextStep}>
          Next
        </Page.HeaderBtn>
      ),
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
          return (
            <Page.HeaderBtn side="right" primary onPress={this.setProfile}>
              {this.state.avatar ? 'Done' : 'Skip & Finish'}
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
      <Page bgFill={Theme.colors.bg}>
        <Page.Main headerDivider style={Styles.main}>
          <CurrentStep />
        </Page.Main>
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
            { marginTop: 16, marginBottom: 72, maxWidth: 300 },
          ]}
        >
          Papers is the perfect game for your dinner party with friends or family
        </Text>

        <Button styleTouch={{ width: 300 }} onPress={this.goNextStep}>
          Start
        </Button>
      </View>
    )
  }

  stepName() {
    return (
      <View style={{ flex: 1, alignSelf: 'stretch' }}>
        <Text nativeID="inputNameLabel" style={[Theme.typography.secondary, Theme.u.center]}>
          How should we call you?
        </Text>
        <TextInput
          style={[Theme.typography.h2, Styles.input]}
          inputAccessoryViewID="name"
          autoFocus
          nativeID="inputNameLabel"
          defaultValue={this.state.name}
          placeholder="Your name"
          onChangeText={name => this.setState(state => ({ ...state, name }))}
        />
      </View>
    )
  }

  stepAvatar() {
    return (
      <View style={{ flex: 1, alignSelf: 'stretch' }}>
        <View style={{ flex: 1, alignSelf: 'stretch' }}>
          <InputAvatar avatar={this.state.avatar} onChange={this.handleChangeAvatar} />
        </View>
      </View>
    )
  }

  handleChangeAvatar(avatar) {
    if (avatar) {
      this.setState(state => ({
        ...state,
        avatar,
      }))
    }
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
