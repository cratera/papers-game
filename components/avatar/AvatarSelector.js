import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, ScrollView, View } from 'react-native'

import { window } from '@constants/layout'

import * as avatars from '@components/avatar/Illustrations'
import { charactersGroups } from '@components/avatar/groups'

const avatarsByName = Object.keys(avatars)
const avatarsTotal = avatarsByName.length

const { vw } = window
const cardsSize = vw * 90

function AvatarBtn({
  avatarConfig,
  //onPress,
  isActive,
  ...props
}) {
  if (!avatarConfig) return null
  const AvatarSvg = avatarConfig.Component
  if (!AvatarSvg) return null

  return (
    // <TouchableOpacity onPress={onPress} {...props}>
    <View style={[Styles.avatarItem, isActive && Styles.avatarItem_active]}>
      <View style={[Styles.avatarArea, { backgroundColor: avatarConfig.bgColor }]}>
        <AvatarSvg />
      </View>
    </View>
    // </TouchableOpacity>
  )
}

AvatarBtn.propTypes = {
  avatarConfig: PropTypes.shape({
    key: PropTypes.string,
    bgColor: PropTypes.string,
    Component: PropTypes.function,
  }),
  isActive: PropTypes.bool,
}

function shuffleAvatarsGroups() {
  console.log('shuffle groups')
  // MEH... https://stackoverflow.com/a/56749849/4737729
  const shuffle = arr =>
    [...arr].reduceRight(
      (res, _, __, s) => (res.push(s.splice(0 | (Math.random() * s.length), 1)[0]), res),
      []
    )

  const arrayGroups = [0, 1, 2, 3, 4]
  const groupsShuffle = shuffle(arrayGroups)

  return groupsShuffle.map(groupId => {
    return charactersGroups[groupId]
  })
}

export default function AvatarSelector({ defaultValue, value, onChange, isChangeOnMount }) {
  const avatarsListGrouped = React.useMemo(() => shuffleAvatarsGroups(), []) || []
  const avatarsList = avatarsListGrouped.flat()
  const refSlides = React.useRef()

  // TODO - optimistic behavior

  React.useEffect(() => {
    // Ensure slides is scrolled at the right position
    const slideIndex = avatarsList.findIndex(config => config.key === defaultValue)
    if (slideIndex) {
      refSlides.current.scrollTo({ x: vw * 90 * slideIndex - 22 })
    }

    if (isChangeOnMount) {
      onChange(avatarsList[0].key)
    }
  }, [])

  function handleScrollEnd(e) {
    const { contentOffset, layoutMeasurement } = e.nativeEvent
    const pageIx = Math.round(contentOffset.x / (layoutMeasurement.width * 0.9))

    const pageIxSafe = Math.max(0, Math.min(avatarsTotal, pageIx))
    const avatarName = avatarsList[pageIxSafe].key
    console.log('avatarName', avatarName, pageIxSafe)
    onChange(avatarName)
  }

  return (
    <>
      {/* <View></View> */}
      <ScrollView
        ref={refSlides}
        horizontal
        snapToStart={false}
        style={[Styles.avatarBox]}
        snapToAlignment="center"
        onMomentumScrollEnd={handleScrollEnd}
        snapToInterval={cardsSize}
        decelerationRate={0.1}
      >
        <View style={[Styles.avatarSnapSpace]}></View>

        {avatarsList.map(avatarConfig => {
          const { key } = avatarConfig
          return <AvatarBtn key={key} avatarConfig={avatarConfig} isActive={key === value} />
        })}
      </ScrollView>
    </>
  )
}

AvatarSelector.propTypes = {
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  /** set the first avatar */
  isChangeOnMount: PropTypes.bool,
}

const Styles = StyleSheet.create({
  avatarBox: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 0,
    paddingTop: 4,
    paddingBottom: 8,
  },
  avatarItem: {
    width: cardsSize,
    height: cardsSize,
    opacity: 0.8,
    padding: 8,
    marginLeft: -0.3,
  },
  avatarArea: {
    borderRadius: 12,
    padding: 16,
  },
  avatarItem_active: {
    opacity: 1,
  },
})
