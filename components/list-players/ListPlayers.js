import React from 'react'
import PropTypes from 'prop-types'
import { View, Text, Image, Platform } from 'react-native'

import PapersContext from '@store/PapersContext.js'
import Button from '@components/button'
import Avatar from '@components/avatar'

import Styles from './ListPlayersStyles'
import * as Theme from '@theme'

const imgWritting =
  'https://firebasestorage.googleapis.com/v0/b/papers-game.appspot.com/o/game%2Fwritting.gif?alt=media&token=4f14b37a-370e-4c8d-8902-15a658cde869'
const imgDone =
  'https://firebasestorage.googleapis.com/v0/b/papers-game.appspot.com/o/game%2Fdone.gif?alt=media&token=ffa86784-aa18-414c-95e6-3ae5fcb15ed5'

const imgMap = {
  writting: {
    src: imgWritting,
    alt: 'Stil writting papers',
  },
  done: {
    src: imgDone,
    alt: 'All papers done',
  },
}

export default function ListPlayers({ players, enableKickout, isStatusVisible, ...otherProps }) {
  const Papers = React.useContext(PapersContext)
  const [isKicking, setIsKicking] = React.useState(null) // playerId
  const { profile, profiles, game } = Papers.state
  const profileId = profile.id
  const profileIsAdmin = game.creatorId === profileId
  const playersSorted = React.useMemo(() => players.sort(), [players]) // TODO - sort this by name #F65
  const playersKeys = Object.keys(game.players || {})
  const hasEnoughPlayers = playersKeys.length >= 4
  const hasTeams = !!game.teams

  return (
    <View style={Styles.list} {...otherProps}>
      {playersSorted.map((playerId, i) => {
        const isLastChild = i === players.length

        if (!game.players[playerId]) {
          // TODO/UX - What should we do in this case? @mmbotelho
          const playerName = profiles[playerId]?.name || playerId
          return (
            <View key={playerId} style={[Styles.item, isLastChild && Styles.item_isLast]}>
              <View style={Styles.who}>
                <Avatar hasMargin alt="" />
                <View>
                  <Text style={[Theme.typography.body, { color: Theme.colors.grayMedium }]}>
                    {playerName}
                  </Text>
                  <Text style={[Theme.typography.seconday, { color: Theme.colors.primary }]}>
                    Left
                  </Text>
                </View>
              </View>
            </View>
          )
        }

        const { avatar, name } = profiles[playerId] || {}
        const { isAfk } = game.players[playerId]
        const wordsSubmitted = game.words && game.words[playerId]
        const status = isStatusVisible && (!wordsSubmitted ? 'writting' : 'done')
        const imgInfo = status && imgMap[status]

        return (
          <View key={playerId} style={[Styles.item, isLastChild && Styles.item_isLast]}>
            <View style={Styles.who}>
              <Avatar src={avatar} hasMargin alt="" />
              <View>
                <Text style={Theme.typography.body}>
                  {name}
                  {playerId === profileId && <Text> (you)</Text>}
                </Text>
                <Text style={[Theme.typography.small, Theme.typography.seconday]}>
                  {playerId === game.creatorId
                    ? playerId === profileId
                      ? ''
                      : game.hasStarted
                      ? ''
                      : !hasEnoughPlayers
                      ? 'Creating game...'
                      : !game.teams
                      ? 'Creating teams...'
                      : ''
                    : ''}
                  {/* {isAfk && (
                    // This seems buggy... remove it for now.
                    <Text style={[Theme.typography.small, { color: Theme.colors.primary }]}>
                      Disconnected
                    </Text>
                  )} */}
                </Text>
              </View>
            </View>
            <View style={Styles.ctas}>
              {/* TODO make same as design. */}
              {enableKickout && playerId !== profileId && (hasTeams || profileIsAdmin) && (
                <Button
                  variant="light"
                  size="sm"
                  isLoading={isKicking === playerId}
                  onPress={() => handleKickOut(playerId)}
                >
                  Kick
                </Button>
              )}
              {imgInfo && (
                <Image
                  style={[Styles.itemStatus, Styles[`itemStatus_${status}`]]}
                  source={{ uri: imgInfo.src }}
                  accessibilityLabel={imgInfo.alt}
                />
              )}
            </View>
          </View>
        )
      })}
    </View>
  )

  async function handleKickOut(playerId) {
    const playerName = profiles[playerId].name
    if (
      Platform.OS !== 'web' ||
      window.confirm(`You are about to kick "${playerName}". Are you sure?`)
    ) {
      setIsKicking(playerId)
      await Papers.removePlayer(playerId)
      setIsKicking(null)
    }
  }
}

ListPlayers.propTypes = {
  players: PropTypes.arrayOf(PropTypes.string), // [playerId],
  enableKickout: PropTypes.bool,
  isStatusVisible: PropTypes.bool,
}
