import { Redirect, Stack, useRouter, useSearchParams } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'
import { useEffectOnce } from 'usehooks-ts'

import Button from '@src/components/button'
import { LoadingBadge } from '@src/components/loading'
import Page from '@src/components/page'
import headerTheme from '@src/navigation/headerTheme'
import { analytics as Analytics } from '@src/services/firebase'
import * as Sentry from '@src/services/sentry'
import PapersContext from '@src/store/PapersContext'
import * as Theme from '@src/theme'

export default function Gate() {
  const Papers = React.useContext(PapersContext)
  const [isSlow, setIsSlow] = React.useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const { profile } = Papers.state
  const profileGameId = profile?.gameId || ''
  const goal = searchParams.goal ?? 'rejoin'

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

    router.push('/')
  }

  if (!profileGameId) {
    return <Redirect href="/" />
  }

  // Any "side effect" when gate action is completed (join, left, etc...)
  // is handled by the parent GameRoomEntry. Not sure if it's the best approach
  // but it was the approach with less bugs and easier to do redirects.
  return (
    <Page>
      <Stack.Screen
        options={{
          ...headerTheme({
            hiddenTitle: true,
          }),
          headerTitle: 'Gate',
        }}
      />

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
