import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'

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

const Header = ({ children, ...otherProps }) => {
  return (
    <View
      style={[
        Styles.header,
        {
          justifyContent: children ? 'space-between' : 'flex-end',
          paddingRight: 8,
        },
      ]}
      {...otherProps}
    >
      {children}
      <SettingsToggle />
    </View>
  )
}

Header.propTypes = {
  children: PropTypes.node,
}

const HeaderBtn = ({ side, style, children, ...otherProps }) => (
  <Button
    variant="flat"
    style={[side === 'left' ? { marginLeft: 16 } : { marginRight: 16 }, style]}
    {...otherProps}
  >
    {children}
  </Button>
)

HeaderBtn.propTypes = {
  side: PropTypes.oneOf(['left', 'right']),
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
  children: PropTypes.node,
}

const HeaderBtnSettings = () => <SettingsToggle style={{ marginRight: 16 }} />

const Main = ({ children, style, ...otherProps }) => {
  return (
    <View style={[Styles.main, style]} {...otherProps}>
      {children}
    </View>
  )
}

Main.propTypes = {
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
  children: PropTypes.node,
}

const CTAs = ({ children, hasOffset, style, ...otherProps }) => {
  return (
    <View
      style={[
        Styles.ctas,
        {
          paddingBottom: children ? 40 : 0,
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

Page.Header = Header // TODO Remove this.
Page.HeaderBtn = HeaderBtn
Page.HeaderBtnSettings = HeaderBtnSettings
Page.Main = Main
Page.CTAs = CTAs
