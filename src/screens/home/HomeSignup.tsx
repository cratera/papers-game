import React from 'react'

import { Text, TextInput, View } from 'react-native'

import * as Theme from '@src/theme'
import Styles from './Home.styles.js'

import AvatarSelector from '@src/components/avatar/AvatarSelector'
import Button from '@src/components/button'
import Page from '@src/components/page'
import { headerTheme } from '@src/navigation/headerStuff'

import { Profile } from '@src/store/PapersContext.types.js'
import { window } from '@src/utils/device'
import { HomeSignupProps, HomeSignupState } from './Home.types.js'

const { vh } = window

// TODO: 🐛BUG / QUESTION: Had to transform this Component to a Class so TextInput works properly.
// When it was a function component, on onChangeText trigger, the TextInput would unmount/mount,
// causing the keyboard to close.... have no idea why. Google didn't help :(

export default class HomeSignup extends React.Component<HomeSignupProps, HomeSignupState> {
  constructor(props: HomeSignupProps) {
    super(props)
    this.state = {
      name: '',
      avatar: 'abraul',
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
      headerLeft: undefined,
      headerRight: undefined,
    })
  }

  componentWillUnmount() {
    this.props.navigation.setOptions({
      headerLeft: undefined,
      headerRight: undefined,
    })
  }

  componentDidUpdate() {
    this.props.navigation.setOptions({
      headerLeft:
        this.state.step === 0
          ? undefined
          : () => (
              <Page.HeaderBtn side="left" onPress={this.goBackStep}>
                Back
              </Page.HeaderBtn>
            ),
      headerRight: () => {
        if (this.state.step === 0 && this.state.name) {
          return (
            <Page.HeaderBtn side="right" onPress={this.goNextStep}>
              Next
            </Page.HeaderBtn>
          )
        }
      },
    })
  }

  render() {
    const state = this.state

    const steps = {
      // 0: this.stepWelcome,
      0: this.stepName,
      1: this.stepAvatar,
    }

    const currentStep = state.step as keyof typeof steps

    const CurrentStep = steps[currentStep]

    console.log('xx', this.state.avatar)
    return (
      <Page bgFill="bg">
        <Page.Main style={Styles.main}>
          <CurrentStep />
        </Page.Main>
        <Page.CTAs>
          {currentStep === 0 && <Button onPress={this.goNextStep}>Start</Button>}
          {currentStep === 1 && state.avatar && <Button onPress={this.setProfile}>Choose</Button>}

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
      <View style={Styles.container}>
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
      <View style={Styles.container}>
        <Text style={[Theme.typography.h3, Theme.utils.center, Theme.spacing.mb_16]}>
          Choose your character
        </Text>
        <View style={Theme.utils.cardEdge}>
          <AvatarSelector
            value={this.state.avatar}
            onChange={this.handleChangeAvatar}
            isChangeOnMount
          />
        </View>
      </View>
    )
  }

  handleChangeAvatar(avatar: Profile['avatar']) {
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
