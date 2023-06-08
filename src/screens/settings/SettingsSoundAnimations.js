import React from 'react'
import { ScrollView, Text, View } from 'react-native'

import PapersContext from '@src/store/PapersContext'

import * as Theme from '@src/theme'

import { BubblingCorner } from '@src/components/bubbling'
import Button from '@src/components/button'
import Page from '@src/components/page'

import Item from './Item'
import { propTypesCommon, useSubHeader } from './utils'

// OPTMIZE make this dynamic
const sounds = ['ready', 'turnstart', 'wrong', 'right', 'bomb', 'fivesl', 'timesup']

export default function SettingsSound({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile } = Papers.state
  const settingsSoundActive = !!profile.settings.sound // need !! in case is undefined
  const settingsMotion = !!profile.settings.motion
  const [motionFeedback, setMotionFeedback] = React.useState(false)
  useSubHeader(navigation, 'Sound & animations')

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
        <ScrollView style={[Theme.utils.scrollSideOffset]}>
          <View style={Theme.utils.cardEdge}>
            {/*  */}
            <Item title="Play sounds" switchValue={settingsSoundActive} onPress={toggleSoundOn} />
            <Item
              title="Reduce animations"
              description="Good for older phones or if the battery is low."
              switchValue={!settingsMotion}
              onPress={toggleMotion}
            />
            {settingsSoundActive && __DEV__ && (
              <View>
                <View style={Theme.utils.listDivider} />

                <Text style={[Theme.typography.h3, Theme.utils.center, { marginVertical: 8 }]}>
                  Preview: (dev only)
                </Text>
                {sounds.map((soundId) => (
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
          {__DEV__ && (
            <Button onPress={Papers.resetProfileSettings}>Restore default settings</Button>
          )}
          <View style={Theme.utils.CTASafeArea} />
        </ScrollView>
      </Page.Main>
    </Page>
  )
}
SettingsSound.propTypes = propTypesCommon
