import React from 'react'
import { Platform, SafeAreaView, Text, View, ViewProps } from 'react-native'

import NetInfo from '@react-native-community/netinfo'
import Button from '@src/components/button'
import { IconChevron } from '@src/components/icons'
import SettingsToggle from '@src/components/settings'
import * as Theme from '@src/theme'
import { useEffectOnce } from 'usehooks-ts'
import Styles from './Page.styles.js'
import { CTAsProps, HeaderBtnProps, PageProps } from './Page.types.js'

const i18nWifi = 'No internet connection'

const Page = ({
  children,
  bgFill = 'grayBg',
  bannerMsg,
  styleInner,
  style,
  ...props
}: PageProps) => {
  const [bannerText, setBannerText] = React.useState('')

  useEffectOnce(() => {
    if (Platform.OS === 'ios') {
      // TODO: later. this does not seem to work on web...
      const unsubscribe = NetInfo.addEventListener((state) => {
        setBannerText(state.isConnected ? '' : i18nWifi)
      })
      return unsubscribe
    }
  })

  React.useEffect(() => {
    if (bannerText !== i18nWifi && typeof bannerMsg === 'string') {
      setBannerText(bannerMsg)
    }
  }, [bannerMsg, bannerText])

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
            backgroundColor: Theme.colors[bgFill],
          },
          style,
        ]}
        {...props}
      >
        <View style={[Styles.pageInner, styleInner]}>{children}</View>
      </SafeAreaView>
    </>
  )
}

const HeaderBtn = ({ side, style, children, isLoading, ...props }: HeaderBtnProps) => {
  const color = Theme.colors.grayDark
  return (
    <Button
      variant="flat"
      textColor={color}
      isLoading={isLoading}
      style={[
        side === 'left' ? Theme.spacing.ml_16 : Theme.spacing.mr_16,
        { transform: [{ translateY: -4 }] },
        style,
      ]}
      {...props}
    >
      <>
        {side === 'left' && (
          <IconChevron size={24} color={Theme.colors.grayDark} style={Styles.chevron_left} />
        )}
        {side === 'left-close' && <View style={Styles.left_close} />}
        {children}
        {side === 'right' && (
          // it feels like 1998
          <>
            <View style={Styles.spacer} />
            <IconChevron size={24} color={color} style={Styles.chevron_right} />
          </>
        )}
      </>
    </Button>
  )
}

const HeaderBtnSettings = () => <SettingsToggle style={Theme.spacing.mr_8} />

const Main = ({ children, style, ...props }: ViewProps) => {
  return (
    <View style={[Styles.main, style]} {...props}>
      {children}
    </View>
  )
}

const CTAs = ({ children, hasOffset, style, ...props }: CTAsProps) => {
  return (
    <View style={[Styles.ctas, !!children && Theme.spacing.pb_32, style]} {...props}>
      {/* a blank element to pull buttons up. */}
      {hasOffset && <View style={Styles.offset}></View>}
      {children}
    </View>
  )
}

export default Page

Page.HeaderBtn = HeaderBtn
Page.HeaderBtnSettings = HeaderBtnSettings
Page.Main = Main
Page.CTAs = CTAs
