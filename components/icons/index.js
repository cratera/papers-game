import React from 'react'
import { Animated, Easing } from 'react-native'
import { Svg, Path, G, Defs, ClipPath } from 'react-native-svg'

import * as Theme from '@theme'

const colorNeutral = Theme.colors.grayMedium
const bg = Theme.colors.bg

function useProps(size, color, style) {
  return {
    styleWithSize: [{ width: size, height: size }, style],
    baseColor: color || colorNeutral,
  }
}

// export const IconLamp = ({ size, color, style, ...props }) /* eslint-disable-line */ => {
//   const { styleWithSize, baseColor } = useProps(size, color, style)
//   // prettier-ignore
//   return (
//     <Svg style={ styleWithSize } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
//       <Rect width="24" height="24" fill="white" />
//       <Path d="M7.34851 10.3703C7.26855 11.8112 7.81518 13.2126 8.84837 14.2148C9.66244 15.0045 10.1293 16.0919 10.1293 17.1982V17.8361C10.1293 18.5135 10.6803 19.0645 11.3577 19.0645H13.2522C13.9296 19.0645 14.4805 18.5135 14.4805 17.8361V17.1987C14.4805 16.0783 14.9357 15.002 15.7294 14.2457C16.7224 13.2995 17.2692 12.0233 17.2692 10.6522C17.2692 7.91472 15.0423 5.68775 12.3048 5.68775C12.118 5.68775 11.9283 5.69814 11.741 5.71892C9.36948 5.98117 7.4811 7.9809 7.34851 10.3703ZM11.8404 6.61703C11.9949 6.59986 12.1512 6.59128 12.305 6.59128C14.5442 6.59128 16.3659 8.41279 16.3659 10.6522C16.3659 11.7737 15.9187 12.8175 15.1064 13.5916C14.1347 14.5175 13.5772 15.8321 13.5772 17.1987V17.8361C13.5772 18.0153 13.4313 18.1609 13.2524 18.1609H11.3579C11.1788 18.1609 11.0331 18.015 11.0331 17.8361V17.1982C11.0331 15.849 10.4661 14.5254 9.47767 13.5663C8.63265 12.7466 8.1854 11.5998 8.25091 10.4204C8.35911 8.46632 9.90233 6.83139 11.8404 6.61703Z" fill={baseColor} />
//       <Path d="M12.3051 7.82685C12.9814 7.82685 13.6363 8.07058 14.149 8.51331C14.2132 8.56865 14.2918 8.59576 14.3704 8.59576C14.4655 8.59576 14.5599 8.556 14.627 8.4783C14.7494 8.33667 14.7336 8.12276 14.592 8.00033C13.9561 7.45144 13.1441 7.14898 12.3051 7.14898C12.1179 7.14898 11.9663 7.30055 11.9663 7.48781C11.9663 7.67506 12.1179 7.82685 12.3051 7.82685Z" fill={baseColor} />
//       <Path d="M15.1305 10.6522C15.1305 10.8394 15.2821 10.991 15.4693 10.991C15.6566 10.991 15.8082 10.8394 15.8082 10.6522C15.8082 10.2192 15.7295 9.79608 15.5746 9.39447C15.5073 9.22008 15.3114 9.13335 15.1366 9.20043C14.962 9.26775 14.875 9.46404 14.9426 9.63842C15.0673 9.96188 15.1305 10.303 15.1305 10.6522Z" fill={baseColor} />
//       <Path d="M13.7752 19.5106H10.8347C10.6474 19.5106 10.4958 19.6622 10.4958 19.8494C10.4958 20.0367 10.6474 20.1882 10.8347 20.1882H13.7754C13.9627 20.1882 14.1143 20.0367 14.1143 19.8494C14.1143 19.6622 13.9625 19.5106 13.7752 19.5106Z" fill={baseColor} />
//       <Path d="M14.114 20.9201C14.114 20.7328 13.9625 20.5813 13.7752 20.5813H10.8347C10.6474 20.5813 10.4958 20.7328 10.4958 20.9201C10.4958 21.1073 10.6474 21.2589 10.8347 21.2589H13.7754C13.9625 21.2589 14.114 21.1071 14.114 20.9201Z" fill={baseColor} />
//       <Path d="M4.33882 9.96618C4.15157 9.96618 4 10.1177 4 10.305C4 10.4923 4.15157 10.6438 4.33882 10.6438H6.29112C6.47838 10.6438 6.62994 10.4923 6.62994 10.305C6.62994 10.1177 6.47838 9.96618 6.29112 9.96618H4.33882Z" fill={baseColor} />
//       <Path d="M20.2713 10.6438C20.4586 10.6438 20.6102 10.4923 20.6102 10.305C20.6102 10.1177 20.4586 9.96618 20.2713 9.96618H18.319C18.1318 9.96618 17.9802 10.1177 17.9802 10.305C17.9802 10.4923 18.1318 10.6438 18.319 10.6438H20.2713Z" fill={baseColor} />
//       <Path d="M11.9663 2.33882V4.29112C11.9663 4.47838 12.1179 4.62994 12.3051 4.62994C12.4924 4.62994 12.644 4.47838 12.644 4.29112V2.33882C12.644 2.15157 12.4924 2 12.3051 2C12.1179 2 11.9663 2.15157 11.9663 2.33882Z" fill={baseColor} />
//       <Path d="M16.7971 6.29198L18.1775 4.91161C18.3099 4.77947 18.3099 4.56466 18.1775 4.43252C18.0451 4.30015 17.8308 4.30015 17.6984 4.43252L16.318 5.81288C16.1857 5.94502 16.1857 6.15984 16.318 6.29198C16.3842 6.35816 16.4709 6.39114 16.5577 6.39114C16.6444 6.39114 16.7309 6.35816 16.7971 6.29198Z" fill={baseColor} />
//       <Path d="M7.81289 14.318L6.43253 15.6984C6.30016 15.8305 6.30016 16.0451 6.43253 16.1775C6.49871 16.2437 6.58545 16.2766 6.67219 16.2766C6.75893 16.2766 6.84567 16.2437 6.91185 16.1775L8.29221 14.7971C8.42458 14.665 8.42458 14.4504 8.29221 14.318C8.15985 14.1857 7.94526 14.1857 7.81289 14.318Z" fill={baseColor} />
//       <Path d="M6.91162 4.43252C6.77926 4.30015 6.56489 4.30015 6.43253 4.43252C6.30016 4.56466 6.30016 4.77947 6.43253 4.91161L7.81289 6.29198C7.87907 6.35816 7.96581 6.39114 8.05255 6.39114C8.13929 6.39114 8.22603 6.35816 8.29221 6.29198C8.42458 6.15984 8.42458 5.94502 8.29221 5.81288L6.91162 4.43252Z" fill={baseColor} />
//       <Path d="M16.318 14.318C16.1857 14.4504 16.1857 14.665 16.318 14.7971L17.6984 16.1775C17.7646 16.2437 17.8513 16.2766 17.9381 16.2766C18.0248 16.2766 18.1115 16.2437 18.1777 16.1775C18.3101 16.0451 18.3101 15.8305 18.1777 15.6984L16.7973 14.318C16.6648 14.1857 16.4504 14.1857 16.318 14.318Z" fill={baseColor} />
//       <Path d="M13.3789 21.9905C13.3789 21.8033 13.2273 21.6517 13.04 21.6517H11.5698C11.3825 21.6517 11.231 21.8033 11.231 21.9905C11.231 22.1778 11.3825 22.3294 11.5698 22.3294H13.04C13.2273 22.3294 13.3789 22.1778 13.3789 21.9905Z" fill={baseColor} />
//     </Svg>
//   )
// }

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

// export const IconEdit = ({ size, color, style, ...props }) /* eslint-disable-line */ => {
//   const { styleWithSize, baseColor } = useProps(size, color, style)
//   // prettier-ignore
//   return (
//     <Svg style={ styleWithSize } fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" {...props}>
//       <Path d="M9 3H3a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 001-2v-6" stroke={baseColor} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
//       <Path d="M15 2a2 2 0 113 2l-8 8-4 1 1-3 8-8z" stroke={baseColor} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
//     </Svg>
//   )
// }

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
        useNativeDriver: true,
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
