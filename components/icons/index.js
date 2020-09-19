import React from 'react'
import { Platform, Animated, Easing } from 'react-native'
import { Svg, Circle, ClipPath, Defs, G, Path } from 'react-native-svg'

import * as Theme from '@theme'

const colorNeutral = Theme.colors.grayMedium
const bg = Theme.colors.bg

function useProps(size, color, style) {
  if (__DEV__ && size && typeof size !== 'number') {
    console.warn(`Icon prop size ${size} must be a Number!`) // Otherwise it won't work on Firefox (web).
  }
  return {
    styleWithSize: [{ width: size, height: size }, style],
    baseColor: color || colorNeutral,
  }
}

export const IconNonWords = ({ size, color, style, ...props }) /* eslint-disable-line */ => {
  const colorFill = color || Theme.colors.primary
  const { styleWithSize, baseColor } = useProps(size, colorFill, style)
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 113 114" {...props}>
      <G clipPath="url(#clip0)" fill={baseColor}>
        <Path d="M94 92L62 75 27 87c-4 1-9-1-10-6L2 36c-1-5 1-9 6-10L78 3c4-1 9 1 10 6l15 45c1 5-1 9-6 10l-16 6 16 19a2 2 0 01-3 3zm2-31c2-1 4-3 3-5L84 10c0-2-2-3-5-3L9 29c-2 1-3 3-3 5l15 46c0 2 3 3 5 3l36-12h2l23 13-11-14a2 2 0 011-3"/>
        <Path d="M26 48l-1 1-1-4a1 1 0 00-1-1l-2 1v5l-1-4a1 1 0 00-1-1l-2 1v5h-1l-1 2 1 1 1 1 1-1v2l-1 1-1 1 1 1 1 1h1l1 4a1 1 0 001 0h1l1-1-1-4 1-1 1 4a1 1 0 001 1h1l1-1-1-5h2l1-1-1-2h-2l-1-2h2l1-2-1-1-1-1zm-4 7l-1-2h1v2zM44 44l-2 2 1-7a1 1 0 00-1-1h-2v1l-2 8v-2c-1-3-4-5-7-4s-4 4-3 8c2 4 5 5 7 4l2-2-1 8a1 1 0 001 1l1-1h1l2-8v1c1 4 4 5 7 4 2 0 4-3 2-7-1-4-3-5-6-5zm1 4c1-1 2 1 2 2v3h-1l-1-2v-3zm-13-4l2 3v3h-1l-1-3v-3zM69 48l-1-1-2-1v-7a1 1 0 00-1 0h-2l-1 1v4l-3-2c2-2 2-4 2-6-1-2-4-4-7-3s-4 4-3 7l2 3c-2 2-2 4-1 6 1 3 4 5 8 4l4-3h4l1-1a1 1 0 000-1zm-13-8l-1-2v-1h2l-1 3zm0 5l5 3-2 1c-2 0-3 0-3-2v-2zM74 33h-3c-1-1 0-1 1-2h3a1 1 0 001-1v-1l-1-1h-4c-3 1-5 4-4 6l1 2v3c1 3 3 4 6 4l3 1-1 1h-3a1 1 0 00-2 1v2l1 1h5c2-1 5-4 4-7l-1-2v-3c-1-3-5-4-6-4zm2 5v1h-2l-3-1v-1h3l2 1zM85 39h2v-2l-3-12a1 1 0 00-1 0h-3a1 1 0 000 2l4 11 1 1z"/>
        <Path d="M86 39c-2 0-2 2-2 3 1 2 2 2 3 2 2-1 2-2 2-3 0-2-2-3-3-2z"/>
      </G>
      <Defs>
        <ClipPath id="clip0">
          <Path transform="rotate(-17 91 14)" fill={bg} d="M0 0h90v90H0z"/>
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export const IconEyeOpen = ({ size, color, style, ...props }) /* eslint-disable-line */ => {
  const { styleWithSize, baseColor } = useProps(size, color, style)
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 19" {...props}>
      <Path d="M12 6C6 6 0 11 0 12v1s6 5 12 5 12-5 12-5v-1c-1-1-6-6-12-6zM8 16l-6-4c1-1 3-3 6-3l-1 3 1 4zm4-1c-2 0-3-1-3-3s1-3 3-3 3 1 3 3-1 3-3 3zm4 1l1-4-1-3 6 3-6 4z" fill={baseColor} />
      <Path d="M12 10h-1v2l-1-1v1l2 2 2-2-2-2zM12 4l1-1V1l-1-1-1 1v2l1 1zM7 4l1 1 1-1-1-3H7L6 2l1 2zM3 6l1 1 1-1V5L4 3H2v1l1 2zM19 6h2l1-2-1-1h-1l-1 2v1zM16 5l1-1 1-2-1-1h-1l-1 3 1 1z" fill={baseColor} />
    </Svg>
  )
}

export const IconEyeClosed = ({ size, color, style, ...props }) /* eslint-disable-line */ => {
  const { styleWithSize, baseColor } = useProps(size, color, style)
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 10"  {...props}>
      <Path d="M23 0l-6 3H7L1 0 0 1l3 2-2 3 2 1 2-3 1 1h1L6 8l2 1 1-3h2v3h2V6h2l1 3 2-1-1-3h1l1-1 2 3 2-1-2-3 3-2-1-1z" fill={baseColor} />
    </Svg>
  )
}

export const IconSpin = ({ size, color, style, ...props }) /* eslint-disable-line */ => {
  const rotateAnim = React.useRef(new Animated.Value(0)).current // Initial value for opacity: 0
  const { styleWithSize, baseColor } = useProps(size, color, style)

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.inOut(Easing.ease), // Review @mmbotelho
        useNativeDriver: Platform.OS !== 'web',
      }),
      { iterations: 50 }
    ).start()
  }, [])

  // prettier-ignore
  return (
    <Animated.View style={{
      transform: [
        { rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }) },
        { perspective: 1000 }
      ]
    }}>
      <Svg style={ styleWithSize } fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" {...props}>
        <Path d="M11 1v4M11 17v4M4 4l3 3M15 15l3 3M1 11h4M17 11h4M4 18l3-3M15 7l3-3" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>

    </Animated.View>
  )
}

export const IconArrow = ({ size, color, style, ...props }) /* eslint-disable-line */ => {
  const { styleWithSize, baseColor } = useProps(size, color, style)
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  {...props}>
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

export const IconTimes = ({ size, color, style, ...props }) /* eslint-disable-line */ => {
  const { styleWithSize, baseColor } = useProps(size, color, style)
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <Path d="M18 6L6 18M6 6l12 12" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

export const IconCheck = ({ size, color, style, ...props }) /* eslint-disable-line */ => {
  const { styleWithSize, baseColor } = useProps(size, color, style)
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <Path d="M20 6L9 17l-5-5" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

export const IconGear = ({ size, color, style, ...props }) /* eslint-disable-line */ => {
  const { styleWithSize, baseColor } = useProps(size, color, style)
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" {...props}>
      <Path d="M16 7V6l1-3-2-1-2 1h-1l-2-3H8L7 3H6L4 2 2 3l1 3v1L0 9v2l3 1v1l-1 3 2 1 2-1h1l2 3h2l1-3h1l2 1 2-2-1-2v-1l3-2V8l-3-1zm-6 6a3 3 0 11-1-7 3 3 0 011 7z" fill={baseColor} />
    </Svg>
  )
}

export const IconCamera = ({ size, color, style, ...props }) /* eslint-disable-line */ => {
  const { styleWithSize, baseColor } = useProps(size, color, style)
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12 17a4 4 0 100-8 4 4 0 000 8z" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

export const IconLibrary = ({ size, color, style, ...props }) /* eslint-disable-line */ => {
  const { styleWithSize, baseColor } = useProps(size, color, style)
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <Path d="M19 3H5L3 5v14l2 2h14l2-2V5l-2-2z" stroke="#7F848E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M9 10a1 1 0 100-3 1 1 0 000 3zM21 15l-5-5L5 21" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

export const IllustrationStars = props =>
  // prettier-ignore
  <Svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 229 273" {...props}>
    <Path fill="#000" d="M192 71.598l35.502-35.502 1.414 1.415-35.502 35.501zM191 206.414l26.624 26.624 1.414-1.414L192.414 205zM1.63 41.398L39.2 72.075l-1.265 1.55L.366 42.946zM19.718 226.284l22.943-26.55-.948-.82-22.943 26.55zM113 56V0h2v56zM113 217v56h2v-56z"/>
    <Circle cx="171.5" cy="38.5" r="2.5" fill="#000" />
    <Circle cx="194.5" cy="133.5" r="2.5" fill="#000" />
    <Circle cx="21.5" cy="134.5" r="2.5" fill="#000" />
    <Circle cx="59.5" cy="30.5" r="2.5" fill="#000" />
    <Circle cx="166.5" cy="235.5" r="2.5" fill="#000" />
    <Circle cx="54.5" cy="233.5" r="2.5" fill="#000" />
  </Svg>
