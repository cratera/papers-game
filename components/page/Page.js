import React from 'react'
import { Platform, SafeAreaView, View, Text } from 'react-native'
import PropTypes from 'prop-types'

import * as Theme from '@theme'
import Styles from './PageStyles.js'
import SettingsToggle from '@components/settings'
import Button from '@components/button'
import { IconChevron } from '@components/icons'
import NetInfo from '@react-native-community/netinfo'

const i18nWifi = 'No internet connection'

const Page = ({ children, bgFill, bannerMsg, styleInner, ...otherProps }) => {
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
        <View style={[Styles.pageInner, styleInner]}>{children}</View>
      </SafeAreaView>
    </>
  )
}

Page.defaultProps = {
  bgFill: Theme.colors.bg,
}

Page.propTypes = {
  bannerMsg: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  /** By default is `colors.grayBg`. When `false` is `colors.bg` (blank bg). DO NOT pass `true` */
  bgFill: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  children: PropTypes.node,
  styleInner: PropTypes.any,
}

const HeaderBtn = ({ side, icon, style, textPrimary, children, isLoading, ...otherProps }) => {
  const color = Theme.colors.grayDark // textPrimary ? Theme.colors.grayDark : Theme.colors.grayMedium
  return (
    <Button
      variant="flat"
      textColor={color}
      isLoading={isLoading}
      style={[
        side === 'left' ? { marginLeft: 16 } : { marginRight: 16 },
        { transform: [{ translateY: -4 }] },
      ]}
      {...otherProps}
    >
      <>
        {side === 'left' && (
          <IconChevron
            size={24}
            color={Theme.colors.grayDark}
            style={{
              transform: [{ rotate: '180deg' }, { translateY: -6 }, { translateX: 7 }],
              marginRight: -4,
            }}
          />
        )}
        {side === 'left-close' && <View style={{ width: 16, height: 24 }} />}
        {children}
        {side === 'right' && (
          // it feels like 1998
          <>
            <View style={{ width: 8, height: 1 }} />
            <IconChevron
              size={24}
              color={color}
              style={{ transform: [{ translateY: 6 }, { translateX: -4 }], marginRight: -4 }}
            />
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

const Main = ({ children, style, headerDivider, ...otherProps }) => {
  React.useEffect(() => {})

  return (
    <View
      style={[
        Styles.main,
        style,
        // DEPRECATED
        // headerDivider && { borderTopColor: Theme.colors.grayDark, borderTopWidth: 1 },
      ]}
      {...otherProps}
    >
      {children}
    </View>
  )
}

Main.propTypes = {
  children: PropTypes.node,
  headerDivider: PropTypes.bool,
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
