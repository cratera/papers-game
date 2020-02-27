/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as Styles from './PageStyles.js';
import SettingsToggle from 'components/Settings';

const Page = ({ children, ...otherProps }) => {
  return (
    <div css={Styles.page} {...otherProps}>
      {children}
    </div>
  );
};

const Header = ({ children, ...otherProps }) => {
  return (
    <div css={Styles.header({ hasChildren: !!children })} {...otherProps}>
      {children}
      <SettingsToggle />
    </div>
  );
};

const Main = ({ children, ...otherProps }) => {
  return (
    <div css={Styles.main} {...otherProps}>
      {children}
    </div>
  );
};

const CTAs = ({ children, ...otherProps }) => {
  return (
    <div css={Styles.ctas} {...otherProps}>
      {children}
    </div>
  );
};

export default Page;

Page.Header = Header;
Page.Main = Main;
Page.CTAs = CTAs;
