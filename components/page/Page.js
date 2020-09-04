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

const Page = ({ children, bgFill, bannerMsg, ...otherProps }) => {
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
            backgroundColor: bgFill === false ? Theme.colors.bg : bgFill,
          },
        ]}
        {...otherProps}
      >
        {children}
      </SafeAreaView>
    </>
  )
}

Page.defaultProps = {
  bgFill: Theme.colors.grayBg,
}

Page.propTypes = {
  bannerMsg: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  /** By default is `colors.grayBg`. When `false` is `colors.bg` (blank bg). DO NOT pass `true` */
  bgFill: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  children: PropTypes.node,
}

// const isIOS = Platform.OS === 'ios'

const iconsMap = {
  back: () => <Text>☜ </Text>, // IconArrow
  next: () => <Text> ☞</Text>, // IconArrow
}

const HeaderBtn = ({ side, icon, style, textPrimary, children, isLoading, ...otherProps }) => {
  const IconMapped = iconsMap[icon]
  const color = textPrimary ? Theme.colors.grayDark : Theme.colors.grayMedium
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
            <View style={{ width: 8, height: 1 }} />
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

const Main = ({ children, style, ...otherProps }) => {
  React.useEffect(() => {})

  return (
    <View style={[Styles.main, style]} {...otherProps}>
      {children}
    </View>
  )
}

Main.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
}

const CTAs = ({ children, hasOffset, style, ...otherProps }) => {
  return (
    <View
      style={[
        Styles.ctas,
        {
          paddingBottom: children ? 32 : 0,
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
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
  hasOffset: PropTypes.bool,
  children: PropTypes.node,
}

export default Page

Page.HeaderBtn = HeaderBtn
Page.HeaderBtnSettings = HeaderBtnSettings
Page.Main = Main
Page.CTAs = CTAs
