import React from 'react'
import PropTypes from 'prop-types'

import { TextInput, Text, View } from 'react-native'

import * as Theme from '@theme'
import Styles from './HomeStyles.js'

import { headerTheme, headerBorder } from '@navigation/headerStuff.js'
import Page from '@components/page'
import Button from '@components/button'

import InputAvatar from './InputAvatar.js'

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
      ...headerTheme({ hiddenTitle: true, hiddenBorder: true }),
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
    if (!prevState.name && this.state.name) {
      this.props.navigation.setOptions({
        // ...headerBorder(true),
        headerRight: () => (
          <Page.HeaderBtn side="right" icon="next" textPrimary onPress={this.goNextStep}>
            Next
          </Page.HeaderBtn>
        ),
      })
    } else if (!this.state.name && prevState.name) {
      this.props.navigation.setOptions({
        headerRight: null,
      })
    } else if (!prevState.avatar && this.state.avatar) {
      this.props.navigation.setOptions({
        headerRight: () => (
          <Page.HeaderBtn side="right" textPrimary onPress={this.setProfile}>
            Finish
          </Page.HeaderBtn>
        ),
      })
    }
  }

  render() {
    const state = this.state
    const CurrentStep = {
      0: this.stepWelcome,
      1: this.stepName,
      2: this.stepAvatar,
    }[state.step]

    return (
      <Page bgFill={state.step !== 0}>
        <Page.Main style={Styles.main}>
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
      <View style={Styles.content}>
        <Text style={[Theme.typography.h1, Theme.u.center]}>Welcome!</Text>
        <Text style={[Theme.typography.secondary, Styles.paragraph]}>
          Papers is the perfect game for your{' '}
          <Text style={Theme.typography.secondary} numberOfLines={1}>
            dinner party.
          </Text>
          {'\n'}
          <Text style={Theme.typography.secondary}>Made with love by Maggie and Sandy.</Text>
        </Text>
      </View>
    )
  }

  stepName() {
    return (
      <View style={{ flex: 1, alignSelf: 'stretch' }}>
        <Text nativeID="inputNameLabel" style={[Styles.label, Theme.typography.body]}>
          What should we call you?
        </Text>
        <TextInput
          style={[Theme.typography.h1, Styles.input]}
          inputAccessoryViewID="name"
          autoFocus
          nativeID="inputNameLabel"
          defaultValue={this.state.name}
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

  // OPTIMIZE - Find a cleaner way header state based on step.
  // State machines, right?

  goNextStep() {
    const currentStep = this.state.step
    this.setState(state => ({
      ...state,
      step: state.step + 1,
    }))

    if (currentStep === 0) {
      this.props.navigation.setOptions({
        headerStyle: headerBorder(true),
        headerLeft: () => (
          <Page.HeaderBtn side="left" icon="back" onPress={this.goBackStep}>
            Back
          </Page.HeaderBtn>
        ),
        headerRight: this.state.name
          ? () => (
              <Page.HeaderBtn
                side="right"
                icon="next"
                textPrimary
                onPress={() => this.goNextStep('name')}
              >
                Next
              </Page.HeaderBtn>
            )
          : null,
      })
    }

    if (currentStep === 1) {
      this.props.navigation.setOptions({
        headerRight: () => (
          <Page.HeaderBtn side="right" primary onPress={this.setProfile}>
            Skip
          </Page.HeaderBtn>
        ),
      })
    }
  }

  goBackStep() {
    const step = this.state.step
    this.setState(state => ({
      ...state,
      step: step - 1,
    }))

    if (step - 1 === 0) {
      this.props.navigation.setOptions({
        headerLeft: null,
        headerRight: null,
        // ...headerBorder(false),
      })
    } else if (step - 1 === 1) {
      this.props.navigation.setOptions({
        // ...headerBorder(true),
        headerRight: () => (
          <Page.HeaderBtn
            side="right"
            icon="next"
            textPrimary
            onPress={() => this.goNextStep('avatar')}
          >
            Next
          </Page.HeaderBtn>
        ),
      })
    }
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
