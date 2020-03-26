import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import Styles from './PageStyles.js';
import SettingsToggle from '@components/settings';

const Page = ({ children, ...otherProps }) => {
  return (
    <View style={Styles.page} {...otherProps}>
      {children}
    </View>
  );
};

const Header = ({ children, ...otherProps }) => {
  return (
    <View
      style={[
        Styles.header,
        {
          justifyContent: !!children ? 'space-between' : 'flex-end',
          paddingRight: 8,
        },
      ]}
      {...otherProps}
    >
      {children}
      <SettingsToggle />
    </View>
  );
};

const Main = ({ children, style, ...otherProps }) => {
  return (
    <View style={[Styles.main, style]} {...otherProps}>
      {children}
    </View>
  );
};

const CTAs = ({ children, hasOffset, style, ...otherProps }) => {
  return (
    <View
      style={[
        Styles.ctas,
        {
          paddingBottom: !!children ? 40 : 0,
        },
        style,
      ]}
      {...otherProps}
    >
      {/* a blank element to push buttons up. */}
      {hasOffset && <View style={{ marginTop: -22 }}></View>}
      {children}
    </View>
  );
};

export default Page;

Page.Header = Header;
Page.Main = Main;
Page.CTAs = CTAs;
