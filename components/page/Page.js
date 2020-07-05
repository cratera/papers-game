import React from 'react'
import { Platform, SafeAreaView, View, Text } from 'react-native'
import PropTypes from 'prop-types'

import * as Theme from '@theme'
import Styles from './PageStyles.js'
import SettingsToggle from '@components/settings'
import Button from '@components/button'
import { IconArrow } from '@components/icons'
import NetInfo from '@react-native-community/netinfo'

const i18nWifi = 'No internet connection'

const Page = ({ children, blankBg, bannerMsg, ...otherProps }) => {
  const [bannerText, setBannerText] = React.useState(null)

  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      // TODO later. this does not seem to work on web...
      const unsubscribe = NetInfo.addEventListener(state => {
        setBannerText(state.isConnected ? '' : i18nWifi)
      })
      return unsubscribe
    }
  }, [])

  React.useEffect(() => {
    if (bannerText !== i18nWifi) {
      setBannerText(bannerMsg)
    }
  }, [bannerMsg])

  return (
    <>
      {bannerText ? (
        <View style={Styles.banner}>
          <Text style={Styles.banner_text}>{bannerText}</Text>
        </View>
      ) : null}
      <SafeAreaView
        style={[
          Styles.page,
          {
            backgroundColor: Theme.colors[blankBg ? 'bg' : 'grayBg'],
          },
        ]}
        {...otherProps}
      >
        {children}
      </SafeAreaView>
    </>
  )
}

Page.propTypes = {
  bannerMsg: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  blankBg: PropTypes.bool,
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
  React.useEffect(() => {})

  return (
    <View
      style={[
        Styles.main,
        {
          backgroundColor: Theme.colors[blankBg ? 'bg' : 'grayBg'],
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
          paddingBottom: children ? 32 : 0,
          backgroundColor: Theme.colors[blankBg ? 'bg' : 'grayBg'],
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
