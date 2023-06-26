import { Redirect, useSegments } from 'expo-router'
import { useRef } from 'react'

import { usePapersContext } from '@src/store/PapersContext'

export default function RootRedirects() {
  const segments = useSegments()
  const {
    state: { profile, game },
  } = usePapersContext()
  const hasGameIdCached = useRef(!!profile?.gameId).current
  const profileId = profile?.id || ''
  const { id: gameId } = game || {}
  const wordsAreStored = !!game?.words?.[profileId]
  const amIReady = !!game?.players[profileId]?.isReady
  const isPlaying = game?.hasStarted || amIReady

  console.log('segments', segments)

  if (!profileId) {
    return <Redirect href="/sign-up" />
  }

  if (segments[0] === 'room') {
    if (hasGameIdCached && gameId) {
      const redirect =
        isPlaying || amIReady ? 'playing' : wordsAreStored ? 'lobby-writing' : 'lobby-joining'

      return <Redirect href={`/room/${redirect}`} />
    } else {
      return <Redirect href="/" />
    }
  } else if (segments[0] !== 'settings') {
    if (gameId) {
      return <Redirect href="/room" />
    }
  }

  return null
}
