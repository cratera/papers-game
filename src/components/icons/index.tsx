import React from 'react'
import { Animated, Easing, Platform } from 'react-native'
import { Circle, ClipPath, Defs, G, Path, Svg, SvgProps } from 'react-native-svg'

import * as Theme from '@src/theme'
import { useEffectOnce } from 'usehooks-ts'
import { IconProps, UseProps } from './Icons.types'

const colorNeutral = Theme.colors.grayMedium
const bg = Theme.colors.bg

/* eslint-disable-line */
function useProps({ size, color, style }: UseProps) {
  if (__DEV__ && size && typeof size !== 'number') {
    console.warn(`Icon prop size ${size} must be a Number!`) // Otherwise it won't work on Firefox (web).
  }
  return {
    styleWithSize: [{ width: size, height: size }, style],
    baseColor: color || colorNeutral,
  }
}

/* eslint-disable-line */
export const IconNonWords = ({ size, color, style, ...props }: IconProps) => {
  const colorFill = color || Theme.colors.primary
  const { styleWithSize, baseColor } = useProps({ size, color: colorFill, style })
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" viewBox="0 0 113 114" {...props}>
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

/* eslint-disable-line */
export const IconEyeOpen = ({ size, color, style, ...props }: IconProps) => {
  const { styleWithSize, baseColor } = useProps({ size, color, style })
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } viewBox="0 0 37 28" {...props}>
      <Path d="M1.114 17.681c6.53-5.978 12.38-8.581 18.069-8.386 5.69.196 11.079 3.186 16.712 8.396.564.52.555 1.4-.01 1.913-5.63 5.204-11.015 8.19-16.702 8.386-5.69.196-11.542-2.41-18.073-8.39a1.294 1.294 0 01.004-1.919zm24.575-4.09a8.635 8.635 0 011.623 5.052 8.638 8.638 0 01-1.623 5.05c2.42-1.146 4.856-2.85 7.363-5.05-2.507-2.2-4.944-3.905-7.363-5.052zm-14.443 10.01a8.64 8.64 0 01-1.559-4.958c0-1.842.577-3.55 1.56-4.96-2.321 1.11-4.737 2.75-7.287 4.96 2.55 2.21 4.965 3.848 7.286 4.958zM18.5 12.32c-3.523 0-6.379 2.83-6.379 6.322 0 3.49 2.856 6.32 6.379 6.32 3.524 0 6.38-2.83 6.38-6.32 0-3.492-2.856-6.321-6.38-6.321zM17.049 1.318c0-1.756 2.694-1.756 2.694 0v5.207c0 .736-.604 1.334-1.348 1.334a1.341 1.341 0 01-1.346-1.334V1.317zm-6.024 1.051c-.46-1.695 2.143-2.386 2.601-.69l1.36 5.03a1.333 1.333 0 01-.952 1.634 1.349 1.349 0 01-1.65-.943l-1.36-5.03zm12.14-.926c.459-1.695 3.06-1.004 2.602.691l-1.36 5.03a1.348 1.348 0 01-1.65.944 1.333 1.333 0 01-.953-1.634l1.361-5.03zm6.427 1.297c.885-1.52 3.218-.185 2.332 1.334l-2.628 4.51a1.354 1.354 0 01-1.84.489 1.327 1.327 0 01-.492-1.824l2.628-4.51zM5.075 4.073C4.19 2.553 6.522 1.22 7.408 2.74l2.628 4.51a1.328 1.328 0 01-.493 1.823 1.354 1.354 0 01-1.84-.489l-2.628-4.51z" fill={baseColor} />
    </Svg>
  )
}

/* eslint-disable-line */
export const IconEyeClosed = ({ size, color, style, ...props }: IconProps) => {
  const { styleWithSize, baseColor } = useProps({ size, color, style })
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } viewBox="0 0 37 20" {...props}>
      <Path d="M35.759 2.155c-6.53 6.033-12.38 8.661-18.069 8.464C12 10.42 6.611 7.403.978 2.145a1.313 1.313 0 01.01-1.93C17.69 9.24 21.888 7.24 35.764.218a1.314 1.314 0 01-.004 1.936zM19.824 18.67c0 1.772-2.694 1.772-2.694 0v-5.255a1.348 1.348 0 012.694 0v5.255zm6.024-1.061c.46 1.71-2.143 2.408-2.601.697l-1.36-5.077a1.347 1.347 0 112.601-.697l1.36 5.077zm-12.14.934c-.458 1.711-3.06 1.014-2.602-.697l1.36-5.077a1.347 1.347 0 012.603.697l-1.361 5.077zM7.28 17.236c-.885 1.534-3.218.187-2.332-1.347l2.628-4.552a1.347 1.347 0 112.332 1.347l-2.628 4.552zm24.517-1.347c.886 1.534-1.447 2.88-2.333 1.347l-2.628-4.552a1.347 1.347 0 012.333-1.347l2.628 4.552z" fill={baseColor} />
    </Svg>
  )
}

/* eslint-disable-line */
export const IconSpin = ({ size, color, style = {}, ...props }: IconProps) => {
  const rotateAnim = React.useRef(new Animated.Value(0)).current // Initial value for opacity: 0
  const { styleWithSize, baseColor } = useProps({ size, color, style })

  useEffectOnce(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.inOut(Easing.ease), // Review @mmbotelho
        useNativeDriver: Platform.OS !== 'web',
      }),
      { iterations: 50 }
    ).start()
  })

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
      <Svg style={ styleWithSize } fill="none" viewBox="0 0 22 22" {...props}>
        <Path d="M11 1v4M11 17v4M4 4l3 3M15 15l3 3M1 11h4M17 11h4M4 18l3-3M15 7l3-3" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>

    </Animated.View>
  )
}

/* eslint-disable-line */
export const IconArrow = ({ size, color, style, ...props }: IconProps) => {
  const { styleWithSize, baseColor } = useProps({ size, color, style })
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" viewBox="0 0 24 24"  {...props}>
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

/* eslint-disable-line */
export const IconChevron = ({ size, color, style, ...props }: IconProps) => {
  const { styleWithSize, baseColor } = useProps({ size, color, style })
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } viewBox="0 0 24 24" {...props}>
      <Path fillRule="evenodd" clipRule="evenodd" d="M9.3 5.3a1 1 0 011.4 0l6 6a1 1 0 010 1.4l-6 6a1 1 0 01-1.4-1.4l5.29-5.3-5.3-5.3a1 1 0 010-1.4z" fill={baseColor} />
    </Svg>
  )
}

/* eslint-disable-line */
export const IconTimes = ({ size, color, style, ...props }: IconProps) => {
  const { styleWithSize, baseColor } = useProps({ size, color, style })
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" viewBox="0 0 24 24" {...props}>
      <Path d="M18 6L6 18M6 6l12 12" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

/* eslint-disable-line */
export const IconCheck = ({ size, color, style, ...props }: IconProps) => {
  const { styleWithSize, baseColor } = useProps({ size, color, style })
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" viewBox="0 0 24 24" {...props}>
      <Path d="M20 6L9 17l-5-5" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

/* eslint-disable-line */
export const IconGear = ({ size, color, style, ...props }: IconProps) => {
  const { styleWithSize, baseColor } = useProps({ size, color, style })
  // prettier-ignore
  return (
    <Svg style={ styleWithSize }  fill="none" viewBox="0 0 16 14" {...props}>
      <Path fill={baseColor} d="M0 6h16v2H0zM0 12h16v2H0zM0 0h16v2H0z"/>
    </Svg>
  )
}

/* eslint-disable-line */
export const IconCamera = ({ size, color, style, ...props }: IconProps) => {
  const { styleWithSize, baseColor } = useProps({ size, color, style })
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" viewBox="0 0 24 24" {...props}>
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12 17a4 4 0 100-8 4 4 0 000 8z" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

/* eslint-disable-line */
export const IconLibrary = ({ size, color, style, ...props }: IconProps) => {
  const { styleWithSize, baseColor } = useProps({ size, color, style })
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } fill="none" viewBox="0 0 24 24" {...props}>
      <Path d="M19 3H5L3 5v14l2 2h14l2-2V5l-2-2z" stroke="#7F848E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M9 10a1 1 0 100-3 1 1 0 000 3zM21 15l-5-5L5 21" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

/* eslint-disable-line */
export const IconExternal = ({ size, color, style, ...props }: IconProps) => {
  const { styleWithSize, baseColor } = useProps({ size, color, style })
  // prettier-ignore
  return (
    <Svg style={ styleWithSize } viewBox="0 0 24 24" {...props}>
      <Path fill={baseColor} fillRule="evenodd" clipRule="evenodd" d="M15 12.6a.6.6 0 111.2 0v3.6c0 1-.8 1.8-1.8 1.8H7.8c-1 0-1.8-.8-1.8-1.8V9.6c0-1 .8-1.8 1.8-1.8h3.6a.6.6 0 110 1.2H7.8c-.3 0-.6.3-.6.6v6.6c0 .3.3.6.6.6h6.6c.3 0 .6-.3.6-.6v-3.6zM16.8 7.2h-3a.6.6 0 110-1.2h3.6c.3 0 .6.3.6.6v3.6a.6.6 0 01-1.2 0v-3z" />
      <Path fill={baseColor} fillRule="evenodd" clipRule="evenodd" d="M11.2 13.6a.6.6 0 11-.8-.8L17 6.2a.6.6 0 11.8.8l-6.6 6.6z" />
    </Svg>
  )
}

/* eslint-disable-line */
export const IconPencil = ({ size, color, style, ...props }: IconProps) => {
  const { styleWithSize, baseColor } = useProps({ size, color, style })
  // prettier-ignore
  return (
    <Svg  style={ styleWithSize } viewBox="0 0 24 24" {...props}>
      <Path fill={baseColor} d="M14.1 7.6a.3.3 0 00-.4 0C4 17.6 5 16.4 5 16.6l-1 2.8a.5.5 0 00.4.7h.3l3-1 8.7-8.8a.3.3 0 000-.3l-2.3-2.4zM16.7 4.6l-1.3 1.3a.3.3 0 000 .4l2.3 2.3a.3.3 0 00.4 0l1.3-1.3a2 2 0 00.6-1.4c0-1.7-2-2.5-3.3-1.3z" />
    </Svg>
  )
}

/* eslint-disable-line */
export const IllustrationStars = (props: SvgProps) =>
  // prettier-ignore
  <Svg fill="none"  viewBox="0 0 229 273" {...props}>
    <Path fill="#000" d="M192 71.598l35.502-35.502 1.414 1.415-35.502 35.501zM191 206.414l26.624 26.624 1.414-1.414L192.414 205zM1.63 41.398L39.2 72.075l-1.265 1.55L.366 42.946zM19.718 226.284l22.943-26.55-.948-.82-22.943 26.55zM113 56V0h2v56zM113 217v56h2v-56z"/>
    <Circle cx="171.5" cy="38.5" r="2.5" fill="#000" />
    <Circle cx="194.5" cy="133.5" r="2.5" fill="#000" />
    <Circle cx="21.5" cy="134.5" r="2.5" fill="#000" />
    <Circle cx="59.5" cy="30.5" r="2.5" fill="#000" />
    <Circle cx="166.5" cy="235.5" r="2.5" fill="#000" />
    <Circle cx="54.5" cy="233.5" r="2.5" fill="#000" />
  </Svg>

/* eslint-disable-line */
export const IllustrationSmile = (props: SvgProps) =>
  // prettier-ignore
  <Svg fill="none" viewBox="0 0 244 163" {...props}>
    <Path d="M182 115a93 93 0 01-62 35c-25 2-49-16-64-34-6-6-14 3-9 9 18 20 43 37 71 37 28 1 55-18 73-38 5-6-4-14-9-9zM11 29c7-9 17-15 28-16s22 8 29 16c5 5 13-3 8-9A53 53 0 0039 1C25 0 11 10 2 20c-5 6 4 15 9 9zM176 29c8-9 17-15 29-16 11-1 21 8 28 16 5 5 14-3 9-9a53 53 0 00-37-19c-15-1-28 9-37 19-5 6 3 15 8 9z" fill="#C299C4"/>
    <Path d="M115 37c-5 13-18 22-23 36-5 11-3 23 4 32 15 17 44 12 54-6 4-7-6-13-10-6-7 12-27 15-36 2-5-8-2-18 3-25 7-10 15-18 20-30 3-7-9-10-12-3z" fill="#C299C4"/>
  </Svg>

/* eslint-disable-line */
export const IllustrationCry = (props: SvgProps) =>
  // prettier-ignore
  <Svg fill="none" viewBox="0 0 271 159" {...props}>
    <Path fill="#C56E8A" d="M87.2 156.5c12.8-14.4 28.9-25.6 48.6-26.7 18.4-1.1 36.5 13.4 48 26.2 5.2 5.9 13.8-2.7 8.6-8.6-14.4-16.2-34.3-29.3-56.5-29.8-22.3-.6-43 14.4-57.2 30.2-5.2 5.8 3.3 14.4 8.6 8.6h-.1zM131.2 23c-5.4 13.2-18 22-23.3 35.4a31.3 31.3 0 004.8 32c14.4 17.6 43.3 12.4 54-6 4-6.8-6.5-12.9-10.5-6.1-7.3 12.5-27 15.2-35.8 2.4-5.6-8.1-2-18 3-25.4 6.4-10 15-18 19.5-29.2 3-7.2-8.8-10.3-11.7-3.2zM88.6 2.7c-9.8 11-22.6 20.7-37.8 21.6-15.7 1-30.2-10-40.2-21.2-5.3-5.9-13.8 2.8-8.7 8.6 12 13.4 30 25.9 48.9 24.8C69.2 35.5 85 25 97.2 11.4c5.2-5.8-3.4-14.4-8.7-8.6zM260.4 2.7c-9.8 11-22.5 20.7-37.7 21.6-15.8 1-30.3-10-40.3-21.2-5.2-5.9-13.8 2.8-8.5 8.6 12 13.4 30 25.9 48.8 24.8C241 35.5 257 25 269 11.4c5.2-5.8-3.4-14.4-8.7-8.6zM258.8 90.8c-5.2-13.4-17.8-22.2-23.2-35.5l-1-1.6a5.7 5.7 0 00-2.4-1.9h-.2l-.3-.1h-.5l-.4-.2h-1.1-.3H228.1l-.5.1h-.1l-.3.1-.4.1c-1 .4-1.9 1-2.5 1.8a7 7 0 00-1 1.7c-5.4 13.3-18 22.1-23.2 35.5a31.3 31.3 0 004.7 32 33 33 0 0049.3 0c7.5-9.1 9-21 4.7-32zm-12.5 22.3a18.8 18.8 0 01-9.3 7.2l-1.2.4-.6.1c-8.1 2-17.5-.1-22.7-7.7-5.5-8.1-2-18 3-25.4 4.3-6.6 9.6-12.5 14-19 4.3 6.5 9.6 12.4 14 19 4.8 7.5 8.4 17.3 2.8 25.4z" />
  </Svg>
