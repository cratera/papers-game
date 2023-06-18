import React from 'react'

import { analytics as Analytics } from '@src/services/firebase'
import * as Sentry from '@src/services/sentry'
import * as Theme from '@src/theme'

import PapersContext from '@src/store/PapersContext'

import { headerTheme } from '@src/navigation/headerStuff'

import { StackScreenProps } from '@react-navigation/stack'
import Button from '@src/components/button'
import { LoadingBadge } from '@src/components/loading'
import Page from '@src/components/page'
import { AppStackParamList } from '@src/navigation/navigation.types'
import { StyleSheet } from 'react-native'
import { useEffectOnce } from 'usehooks-ts'

export default function Gate({ navigation, route }: StackScreenProps<AppStackParamList, 'gate'>) {
  const Papers = React.useContext(PapersContext)
  const [isSlow, setIsSlow] = React.useState(false)

  const { profile } = Papers.state
  const profileGameId = profile?.gameId || ''
  const goal = route?.params?.goal || 'rejoin'

  useEffectOnce(() => {
    navigation.setOptions({
      ...headerTheme({ hiddenTitle: true }),
    })

    try {
      Analytics.setCurrentScreen('game_gate', { goal })
    } catch (error) {
      Sentry.captureException(error, { tags: { pp_page: 'gate_0' } })
    }
  })

  useEffectOnce(() => {
    const buttonCancel = setTimeout(() => {
      // Taking too long? Try something else.
      setIsSlow(true)
    }, 7500)

    return () => {
      clearInterval(buttonCancel)
    }
  })

  async function handleCancel() {
    try {
      Analytics.logEvent('game_gate_cancel')
      await Papers.abortGameGate()
    } catch (error) {
      Sentry.captureException(error, { tags: { pp_page: 'gate_1' } })
    }
    navigation.navigate('home')
  }

  // Any "side effect" when gate action is completed (join, left, etc...)
  // is handled by the parent GameRoomEntry. Not sure if it's the best approach
  // but it was the approach with less bugs and easier to do redirects.

  return (
    <Page>
      <Page.Main style={Styles.container}>
        <LoadingBadge variant="page">
          {`${goal === 'rejoin' ? 'Rejoining' : 'Leaving'} "${
            profileGameId.split('_')[0]
          }" game...`}
        </LoadingBadge>

        {isSlow ? (
          <Button style={Theme.spacing.mt_40} onPress={handleCancel}>
            Go to homepage
          </Button>
        ) : null}
      </Page.Main>
    </Page>
  )
}

const Styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
})
