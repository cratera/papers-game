import React from 'react'
import { Alert, Platform, Text, TouchableHighlight, View } from 'react-native'

import PapersContext from '@src/store/PapersContext'

import { getTeamId } from '@src/store/papersMethods'

import Avatar from '@src/components/avatar'
import Button from '@src/components/button'
import { LoadingBadge } from '@src/components/loading'
import Sheet from '@src/components/sheet'

import { Profile } from '@src/store/PapersContext.types'
import * as Theme from '@src/theme'
import Styles from './ListPlayers.styles'
import { ListPlayersProps } from './ListPlayers.types'

const LoadingAvatar = () => (
  <View style={Styles.loading}>
    <LoadingBadge size="sm" />
  </View>
)

export default function ListPlayers({
  players,
  enableKickout,
  isStatusVisible,
  RenderSuffix,
  style,
  ...props
}: ListPlayersProps) {
  const Papers = React.useContext(PapersContext)
  const [isClicked, setIsClicked] = React.useState<string | null>(null) // playerId
  const [isKicking, setIsKicking] = React.useState<string | null>(null) // playerId
  const [isDeleting, setIsDeleting] = React.useState(false)
  const { profile, profiles, game } = Papers.state
  const profileId = profile?.id
  const profileIsAdmin = game?.creatorId === profileId
  const playersSorted = React.useMemo(() => players.sort(), [players]) // TODO - sort this by name #F65
  const playersKeys = Object.keys(game?.players || {})
  const hasEnoughPlayers = playersKeys.length >= 4
  const hasTeams = !!game?.teams

  if (isDeleting) {
    return (
      // Pff... not the best UI
      <View>
        <Text style={[Theme.typography.h3, Theme.utils.center, Theme.spacing.mv_72]}>
          Deleting game...
        </Text>
      </View>
    )
  }

  return (
    <View style={[Styles.list, Theme.utils.cardEdge, style]} {...props}>
      {profiles &&
        playersSorted.map((playerId, i) => {
          const isLastChild = i === players.length

          // User left the game, we don't have profile access about them anymore
          // TODO:(UX) - What should we do in this case? @mmbotelho
          if (!game?.players[playerId]) {
            const playerName = profiles[playerId]?.name || 'Ex-player' // playerId
            return (
              <View key={playerId} style={[Styles.item, isLastChild && Styles.item_isLast]}>
                <View style={Styles.who}>
                  <LoadingAvatar />
                  <View>
                    <Text style={[Theme.typography.body, { color: Theme.colors.grayMedium }]}>
                      {playerName}
                    </Text>
                    <Text style={[Theme.typography.secondary, { color: Theme.colors.primary }]}>
                      Left
                    </Text>
                  </View>
                </View>
              </View>
            )
          }

          const { avatar, name } = profiles[playerId] || {}
          // const { isAfk } = game.players[playerId]
          const wordsSubmitted = game.words && game.words[playerId]
          const canKickOut = enableKickout && playerId !== profileId && (hasTeams || profileIsAdmin)
          const playerStatus =
            playerId === game.creatorId
              ? playerId === profileId
                ? ''
                : game.hasStarted
                ? ''
                : !hasEnoughPlayers
                ? 'creating' // creating game...
                : !game.teams
                ? 'creating' // creating teams...
                : ''
              : ''

          return (
            <TouchableHighlight
              underlayColor={canKickOut ? Theme.colors.grayLight : 'transparent'}
              onPress={() => (canKickOut ? setIsClicked(playerId) : true)}
              key={playerId}
            >
              <View key={playerId} style={[Styles.item, isLastChild && Styles.item_isLast]}>
                <View style={Styles.who}>
                  <Avatar
                    src={avatar}
                    size="lg"
                    hasMargin
                    isAfk={isStatusVisible && !wordsSubmitted}
                  />
                  <View style={Styles.who_text}>
                    <Text style={Theme.typography.h4}>
                      {name}
                      {playerId === profileId && <Text> (you)</Text>}
                    </Text>
                    {playerStatus ? (
                      <Text style={Theme.typography.badge}>{playerStatus} </Text>
                    ) : null}
                    {/* {isAfk && (
                    // This seems buggy... remove it for now.
                    <Text style={[Theme.typography.small, { color: Theme.colors.primary }]}>
                      Disconnected
                    </Text>
                  )} */}
                  </View>
                </View>
                <View style={Styles.ctas}>
                  {canKickOut && (
                    <Button
                      variant="light"
                      size="sm"
                      isLoading={isKicking === playerId}
                      onPress={() => handleKickOut(playerId)}
                    >
                      Kick
                    </Button>
                  )}
                  {RenderSuffix && <RenderSuffix ix={i} />}
                </View>
              </View>
            </TouchableHighlight>
          )
        })}

      <Sheet
        visible={!!isClicked}
        onClose={() => setIsClicked(null)}
        list={[
          {
            text: isClicked ? `❌ Remove "${profiles && profiles[isClicked].name}"` : '',
            onPress: () => {
              isClicked && handleKickOut(isClicked)
            },
          },
        ]}
      />
    </View>
  )

  async function handleKickOut(playerId: Profile['id']) {
    const playerTeamId = game?.teams ? getTeamId(playerId, game.teams) : null
    console.log('xxx', profiles, playerId)
    const playerName = profiles && profiles[playerId].name
    const goodTeamSize =
      playerTeamId && game?.teams ? game.teams[playerTeamId].players.length > 2 : true
    const msg = goodTeamSize
      ? `If you remove ${playerName}, they won't be able to join again.`
      : `If you remove ${playerName} the game will end (min 4 players).`

    async function doIt() {
      if (goodTeamSize) {
        setIsKicking(playerId)
        await Papers.removePlayer(playerId)
        setIsKicking(null)
        setIsClicked(null)
      } else {
        setIsDeleting(true)
        await Papers.deleteGame()
      }
    }

    if (!playerTeamId) {
      doIt() // just remove the player. not a big deal.
    } else if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        doIt()
      }
    } else {
      Alert.alert(
        'Remove Player',
        msg,
        [
          {
            text: 'Remove',
            onPress: doIt,
            style: 'destructive',
          },
          {
            text: 'Cancel',
            onPress: () => true,
            style: 'cancel',
          },
        ],
        { cancelable: false }
      )
    }
  }
}
