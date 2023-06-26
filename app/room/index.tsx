import { Redirect } from 'expo-router'

import { usePapersContext } from '@src/store/PapersContext'

export default function GameRoom() {
  const Papers = usePapersContext()
  const { profile, game } = Papers.state
  const profileId = profile?.id || ''

  const wordsAreStored = !!game?.words?.[profileId]
  const amIReady = !!game?.players[profileId]?.isReady
  const isPlaying = game?.hasStarted || amIReady

  // TODO: later... learn routing redirect properly.
  if (!game) {
    return <Redirect href="/room/gate" />
  }

  const initialRouter =
    amIReady || isPlaying ? 'playing' : wordsAreStored ? 'lobby-writing' : 'lobby-joining'

  return <Redirect href={`/room/${initialRouter}`} />
}
