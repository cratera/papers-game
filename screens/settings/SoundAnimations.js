import React from 'react'
import { Text, View, ScrollView } from 'react-native'

import PapersContext from '@store/PapersContext.js'

import * as Theme from '@theme'

import { BubblingCorner } from '@components/bubbling'
import Button from '@components/button'
import Page from '@components/page'

import Item from './Item'
import { useSubHeader, propTypesCommon } from './utils'

// OPTMIZE make this dynamic
const sounds = ['ready', 'turnstart', 'wrong', 'right', 'bomb', 'fivesl', 'timesup']

export default function SettingsSound({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile } = Papers.state
  const settingsSoundActive = profile.settings.sound
  const settingsMotion = profile.settings.motion
  const [motionFeedback, setMotionFeedback] = React.useState(false)
  useSubHeader(navigation, 'Sound & Animations')

  function toggleSoundOn() {
    Papers.soundToggleStatus()
    if (!settingsSoundActive) {
      startSound('ready')
    }
  }

  function toggleMotion() {
    setMotionFeedback(!settingsMotion)
    Papers.motionToggle()
  }

  async function startSound(soundId) {
    await Papers.soundPlay(soundId)
  }

  return (
    <Page>
      {motionFeedback && (
        <BubblingCorner
          corner="settings" // very special case. I'll regret this
          duration={900}
          forced
          bgStart={Theme.colors.bg}
          bgEnd={Theme.colors.yellow}
        />
      )}
      <Page.Main headerDivider>
        <ScrollView style={[Theme.u.scrollSideOffset]}>
          <View style={Theme.u.cardEdge}>
            <Item title="Play sounds" switchValue={settingsSoundActive} onPress={toggleSoundOn} />
            <Item
              title="Reduce animations"
              description="Good for older phones or if the battery is low."
              switchValue={!settingsMotion}
              onPress={toggleMotion}
            />
            {settingsSoundActive && __DEV__ && (
              <View>
                <View style={Theme.u.listDivider} />

                <Text style={[Theme.typography.h3, Theme.u.center, { marginVertical: 8 }]}>
                  Preview: (dev only)
                </Text>
                {sounds.map(soundId => (
                  <Button
                    key={soundId}
                    variant="light"
                    size="sm"
                    onPress={() => startSound(soundId)}
                    style={{ marginHorizontal: 16, marginVertical: 4 }}
                  >
                    🔉 {soundId}
                  </Button>
                ))}
              </View>
            )}
          </View>
          <View style={{ height: 40 }} />
          <Button onPress={Papers.resetProfileSettings}>Restore default settings</Button>
          <View style={Theme.u.CTASafeArea} />
        </ScrollView>
      </Page.Main>
    </Page>
  )
}
SettingsSound.propTypes = propTypesCommon
