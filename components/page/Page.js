import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'

import * as Theme from '@theme'
import Styles from './PageStyles.js'
import SettingsToggle from '@components/settings'
import Button from '@components/button'

const Page = ({ children, ...otherProps }) => {
  return (
    <View style={Styles.page} {...otherProps}>
      {children}
    </View>
  )
}

Page.propTypes = {
  children: PropTypes.node,
}

const iconsMap = {
  back: '👈 ',
  next: ' 👉',
}

const HeaderBtn = ({ side, icon, style, textPrimary, children, ...otherProps }) => (
  <Button
    variant="flat"
    style={[
      side === 'left' ? { marginLeft: 16 } : { marginRight: 16 },
      {
        color: textPrimary ? Theme.colors.primary : Theme.colors.grayMedium,
      },
      style,
    ]}
    {...otherProps}
  >
    {side === 'left' && iconsMap[icon]}
    {children}
    {side === 'right' && iconsMap[icon]}
  </Button>
)

HeaderBtn.propTypes = {
  icon: PropTypes.node,
  textPrimary: PropTypes.bool,
  side: PropTypes.oneOf(['left', 'right']).isRequired,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
  children: PropTypes.node,
}

const HeaderBtnSettings = () => <SettingsToggle style={{ marginRight: 16 }} />

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
