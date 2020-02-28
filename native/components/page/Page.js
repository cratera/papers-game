import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

// import * as Styles from './PageStyles.js';
// import SettingsToggle from 'components/Settings';

const Styles = {};

const Page = ({ children, ...otherProps }) => {
  return (
    <View css={Styles.page} {...otherProps}>
      {children}
    </View>
  );
};

const Header = ({ children, ...otherProps }) => {
  return (
    // css={Styles.header({ hasChildren: !!children })}
    <View {...otherProps}>
      {children}
      <Text>[TG]</Text>
      {/* <SettingsToggle /> */}
    </View>
  );
};

const Main = ({ children, ...otherProps }) => {
  return (
    // css={Styles.main}
    <View {...otherProps}>{children}</View>
  );
};

const CTAs = ({ children, ...otherProps }) => {
  // css={Styles.ctas}
  return <View {...otherProps}>{children}</View>;
};

export default Page;

Page.Header = Header;
Page.Main = Main;
Page.CTAs = CTAs;
