import React from 'react'
import PropTypes from 'prop-types'
import { Alert, View, Text, Image, Platform, TouchableHighlight } from 'react-native'

import PapersContext from '@store/PapersContext.js'

import { getTeamId } from '@store/papersMethods.js'

import Button from '@components/button'
import Avatar from '@components/avatar'
import Sheet from '@components/sheet'

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
  const [isClicked, setIsClicked] = React.useState(null) // playerId
  const [isKicking, setIsKicking] = React.useState(null) // playerId
  const [isDeleting, setIsDeleting] = React.useState(false) // playerId
  const { profile, profiles, game } = Papers.state
  const profileId = profile.id
  const profileIsAdmin = game.creatorId === profileId
  const playersSorted = React.useMemo(() => players.sort(), [players]) // TODO - sort this by name #F65
  const playersKeys = Object.keys(game.players || {})
  const hasEnoughPlayers = playersKeys.length >= 4
  const hasTeams = !!game.teams

  if (isDeleting) {
    return (
      // Pff... not the best UI
      <View>
        <Text style={[Theme.typography.h3, Theme.u.center, { marginVertical: 72 }]}>
          Deleting game...
        </Text>
      </View>
    )
  }

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
        // const { isAfk } = game.players[playerId]
        const wordsSubmitted = game.words && game.words[playerId]
        const status = isStatusVisible && (!wordsSubmitted ? 'writting' : 'done')
        const imgInfo = status && imgMap[status]
        const canKickOut = enableKickout && playerId !== profileId && (hasTeams || profileIsAdmin)
        return (
          <TouchableHighlight
            underlayColor={Theme.colors.bg}
            onPress={() => (canKickOut ? setIsClicked(playerId) : true)}
            key={playerId}
          >
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
                {canKickOut && Platform.OS === 'web' && (
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
          </TouchableHighlight>
        )
      })}

      <Sheet
        visible={!!isClicked}
        onClose={() => setIsClicked(null)}
        list={[
          {
            text: isClicked ? `❌ Remove "${profiles[isClicked].name}"` : '',
            onPress: () => {
              handleKickOut(isKicking)
            },
          },
        ]}
      />
    </View>
  )

  async function handleKickOut(playerId) {
    const playerTeamId = game.teams ? getTeamId(playerId, game.teams) : null
    const playerName = profiles[playerId].name
    const goodTeamSize = playerTeamId ? game.teams[playerTeamId].players.length > 2 : true
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

ListPlayers.propTypes = {
  players: PropTypes.arrayOf(PropTypes.string), // [playerId],
  enableKickout: PropTypes.bool,
  isStatusVisible: PropTypes.bool,
}
