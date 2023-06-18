import React from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import { window } from '@src/utils/device'

import { charactersGroups } from '@src/components/avatar/groups'
import avatars from '@src/components/avatar/Illustrations'
import { colors } from '@src/theme'
import { shuffle } from 'lodash'
import { useEffectOnce } from 'usehooks-ts'
import { AvatarBtnProps, AvatarSelectorProps } from './AvatarSelector.types'
import { IllustrationName } from './Illustrations.types'

const { vw } = window
const cardsSize = vw * 90

function AvatarBtn({ src, onPress, isActive, ...props }: AvatarBtnProps) {
  const avatar = avatars[src]

  if (!avatar) {
    throw new Error(`AvatarBtn: "${src}" illustration doesn't exist.`)
  }

  const { bgColor, Component } = avatar

  return (
    <TouchableOpacity onPress={onPress} {...props}>
      <View style={[Styles.avatarItem, isActive && Styles.avatarItem_active]}>
        <View style={[Styles.avatarArea, { backgroundColor: colors[bgColor] }]}>
          <Component />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const avatarsTotal = Object.keys(avatars).length

const shuffleAvatarsGroups = (): IllustrationName[] => {
  const arrayGroups = Object.keys(charactersGroups)
  const groupsShuffle = shuffle(arrayGroups)

  return groupsShuffle
    .map((group) => {
      const groupId = Number(group) as keyof typeof charactersGroups

      return charactersGroups[groupId]
    })
    .flat()
}

export default function AvatarSelector({
  defaultValue,
  value,
  onChange,
  isChangeOnMount,
  ...props
}: AvatarSelectorProps) {
  const avatarsListGrouped = React.useMemo(() => shuffleAvatarsGroups(), []) || []
  const avatarsList = avatarsListGrouped.flat()
  const refSlides = React.useRef<ScrollView>(null)

  // TODO: optimistic behavior (?)
  useEffectOnce(() => {
    // Ensure slides is scrolled at the right position
    const slideIndex = avatarsList.findIndex((avatar) => avatar === defaultValue)
    if (slideIndex) {
      refSlides.current?.scrollTo({ x: vw * 90 * slideIndex - 22 })
    }

    if (isChangeOnMount) {
      onChange(avatarsList[0])
    }
  })

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, layoutMeasurement } = e.nativeEvent
    const pageIx = Math.round(contentOffset.x / (layoutMeasurement.width * 0.9))

    const pageIxSafe = Math.max(0, Math.min(avatarsTotal, pageIx))
    const avatarName = avatarsList[pageIxSafe]
    console.log('avatarName', avatarName, pageIxSafe)
    onChange(avatarName)
  }

  return (
    <ScrollView
      ref={refSlides}
      horizontal
      snapToStart={false}
      style={Styles.avatarBox}
      snapToAlignment="center"
      onMomentumScrollEnd={handleScrollEnd}
      snapToInterval={cardsSize}
      decelerationRate={0.1}
      {...props}
    >
      {/* TODO: use FlatList */}
      {avatarsList.map((avatar) => {
        return (
          <AvatarBtn
            key={avatar}
            src={avatar}
            isActive={avatar === value}
            onPress={() => onChange(avatar)}
          />
        )
      })}
    </ScrollView>
  )
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
