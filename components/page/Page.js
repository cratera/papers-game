import React from 'react'
import { Platform, View, Text } from 'react-native'
import PropTypes from 'prop-types'

import * as Theme from '@theme'
import Styles from './PageStyles.js'
import SettingsToggle from '@components/settings'
import Button from '@components/button'
import { IconArrow } from '@components/icons'
import NetInfo from '@react-native-community/netinfo'

const Page = ({ children, ...otherProps }) => {
  const [bannerMsg, setBannerMsg] = React.useState(null)

  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      // TODO later... this does not seem to work on web...
      const unsubscribe = NetInfo.addEventListener(state => {
        setBannerMsg(state.isConnected ? null : 'No internet connection')
      })
      return unsubscribe
    }
  }, [])

  return (
    <>
      {bannerMsg && (
        <View style={Styles.banner}>
          <Text style={Styles.banner_text}>{bannerMsg}</Text>
        </View>
      )}
      <View style={Styles.page} {...otherProps}>
        {children}
      </View>
    </>
  )
}

Page.propTypes = {
  children: PropTypes.node,
}

// const isIOS = Platform.OS === 'ios'

const iconsMap = {
  back: IconArrow,
  next: IconArrow,
}

const HeaderBtn = ({ side, icon, style, textPrimary, children, isLoading, ...otherProps }) => {
  if (style) {
    // TODO later this...
    console.warn('HeaderBtn - style is used:', children)
  }
  const IconMapped = iconsMap[icon]
  const color = textPrimary ? Theme.colors.primary : Theme.colors.grayMedium
  return (
    <Button
      variant="flat"
      textColor={color}
      isLoading={isLoading}
      style={[side === 'left' ? { marginLeft: 16 } : { marginRight: 16 }]}
      {...otherProps}
    >
      <>
        {side === 'left' && IconMapped && (
          <IconMapped
            size={16}
            style={{ transform: [{ rotate: '180deg' }, { translateY: -2 }, { translateX: 3 }] }}
          />
        )}
        {children}
        {side === 'right' && IconMapped && (
          // it feels like 1998
          <>
            <View style={{ width: 8 }} />
            <IconMapped size={16} color={color} style={{ transform: [{ translateY: 3 }] }} />
          </>
        )}
      </>
    </Button>
  )
}

HeaderBtn.propTypes = {
  icon: PropTypes.node,
  textPrimary: PropTypes.bool,
  side: PropTypes.oneOf(['left', 'right']).isRequired,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
  isLoading: PropTypes.bool,
  children: PropTypes.node,
}

const HeaderBtnSettings = () => <SettingsToggle style={{ marginRight: 8 }} />

const Main = ({ children, style, blankBg, ...otherProps }) => {
  return (
    <View
      style={[
        Styles.main,
        !blankBg && {
          backgroundColor: Theme.colors.grayBg,
        },
        style,
      ]}
      {...otherProps}
    >
      {children}
    </View>
  )
}

Main.propTypes = {
  /** The bg gets white. */
  blankBg: PropTypes.bool,
  children: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
}

const CTAs = ({ children, hasOffset, blankBg, style, ...otherProps }) => {
  return (
    <View
      style={[
        Styles.ctas,
        {
          paddingBottom: children ? 40 : 0,
        },
        !blankBg && {
          backgroundColor: Theme.colors.grayBg,
        },
        style,
      ]}
      {...otherProps}
    >
      {/* a blank element to pull buttons up. */}
      {hasOffset && <View style={{ marginTop: -22 }}></View>}
      {children}
    </View>
  )
}

CTAs.propTypes = {
  /** The bg gets white. */
  blankBg: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
  hasOffset: PropTypes.bool,
  children: PropTypes.node,
}

export default Page

Page.HeaderBtn = HeaderBtn
Page.HeaderBtnSettings = HeaderBtnSettings
Page.Main = Main
Page.CTAs = CTAs
