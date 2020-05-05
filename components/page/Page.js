import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'

import Styles from './PageStyles.js'
import SettingsToggle from '@components/settings'

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

const Main = ({ children, style, ...otherProps }) => {
  return (
    <View style={[Styles.main, style]} {...otherProps}>
      {children}
    </View>
  )
}

Main.propTypes = {
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
  children: PropTypes.node,
}

export default Page

Page.Header = Header
Page.Main = Main
Page.CTAs = CTAs
