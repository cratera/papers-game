import React from 'react'
import { Text, View, ScrollView } from 'react-native'

import Button from '@components/button'
import Page from '@components/page'

import * as Theme from '@theme'

import PapersContext from '@store/PapersContext.js'

import { setSoundStatus, getSoundStatus } from '@store/PapersSound.js' // meeeh this should be from Papers API
import { setSubHeader, propTypesCommon } from './utils'

import Item from './Item'

// TODO make this dynamic.
const sounds = ['ready', 'turnstart', 'wrong', 'right', 'bomb', 'fivesl', 'timesup']

export default function SettingsSound({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const [isSoundActive, setSound] = React.useState(getSoundStatus)
  const [isMotionOn, setMotionOn] = React.useState(true)

  React.useEffect(() => {
    setSubHeader(navigation, 'Sound & Animations')
  }, [])
  function toggleSoundOn() {
    setSoundStatus(!isSoundActive)
    setSound(!isSoundActive)
    if (!isSoundActive) {
      startSound('ready')
    }
  }

  function toggleMotion() {
    setMotionOn(bool => !bool)
  }

  async function startSound(soundId) {
    await Papers.playSound(soundId)
  }

  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={[Theme.u.scrollSideOffset]}>
          <View style={Theme.u.cardEdge}>
            <Item title="Play sounds" switchValue={isSoundActive} onPress={toggleSoundOn} />
            <Item
              title="Reduce motion"
              description="Reduce the number of animations during gameplay"
              switchValue={isMotionOn}
              onPress={toggleMotion}
            />
            <View style={Theme.u.listDivider} />

            {isSoundActive && __DEV__ && (
              <View>
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
        </ScrollView>
      </Page.Main>
    </Page>
  )
}
SettingsSound.propTypes = propTypesCommon
