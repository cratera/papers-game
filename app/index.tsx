import { Redirect, Stack, useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

import Avatar from '@src/components/avatar'
import avatars from '@src/components/avatar/Illustrations'
import Bubbling from '@src/components/bubbling'
import Button from '@src/components/button'
import Page from '@src/components/page'
import headerTheme from '@src/navigation/headerTheme'
import { usePapersContext } from '@src/store/PapersContext'
import * as Theme from '@src/theme'

export default function Home() {
  const router = useRouter()
  const Papers = usePapersContext()
  const { profile, game } = Papers.state
  const [isTutorialDone, setIsTutorialDone] = useState(false)
  const gameId = game?.id
  const avatarBg = profile?.avatar ? avatars[profile.avatar]?.bgColor : 'bg'

  if (!isTutorialDone) {
    setIsTutorialDone(true)

    return <Redirect href="/tutorial" />
  }

  if (!profile?.name || !profile?.avatar) {
    return <Redirect href="/sign-up" />
  }

  if (gameId) {
    return <Redirect href="/game-room" />
  }

  return (
    <Page bgFill={avatarBg}>
      <Stack.Screen
        options={{
          ...headerTheme({
            hiddenTitle: true,
          }),
          headerTitle: 'Home',
          headerRight: () => {
            return profile?.name ? (
              <TouchableOpacity
                style={Theme.spacing.pr_24}
                onPress={() => router.push('/settings')}
              >
                <Text style={Theme.typography.body}>Menu</Text>
              </TouchableOpacity>
            ) : null
          },
        }}
      />

      <Bubbling bgStart="bg" bgEnd={avatarBg} />

      <Page.Main style={Styles.main_signed}>
        {profile?.avatar && <Avatar src={profile.avatar} size="xxxl" />}

        <Text style={Theme.typography.h3}>{profile?.name}</Text>
      </Page.Main>

      <Page.CTAs>
        <Button variant="blank" onPress={() => router.push('/create-game')}>
          Create Game
        </Button>

        <Button style={Theme.spacing.mt_16} onPress={() => router.push('/join-game')}>
          Join
        </Button>

        <TouchableOpacity
          style={[Styles.CTAtutorial, Theme.utils.middle]}
          onPress={() => router.push('/tutorial')}
        >
          <Text style={[Theme.typography.body, Styles.CTAtutorial_text]}>How to play</Text>
        </TouchableOpacity>
      </Page.CTAs>
    </Page>
  )
}

const Styles = StyleSheet.create({
  main_signed: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 250,
  },
  CTAtutorial: {
    marginTop: 16,
    height: 56,
  },
  CTAtutorial_text: {
    color: Theme.colors.grayDark,
  },
})
