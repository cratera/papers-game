import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import Styles from './PageStyles.js';
// import SettingsToggle from 'components/Settings';

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
        },
      ]}
      {...otherProps}
    >
      {children}
      <Text>[⚙️]</Text>
      {/* <SettingsToggle /> */}
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

const CTAs = ({ children, ...otherProps }) => {
  return (
    <View
      style={[
        Styles.ctas,
        {
          paddingBottom: !!children ? 56 : 0,
        },
      ]}
      {...otherProps}
    >
      {children}
    </View>
  );
};

export default Page;

Page.Header = Header;
Page.Main = Main;
Page.CTAs = CTAs;
