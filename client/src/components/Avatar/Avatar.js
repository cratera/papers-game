/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as Styles from './AvatarStyles.js';

export default function Avatar({ src, alt, hasMargin, ...otherProps }) {
  const Tag = src ? 'img' : 'span';
  return <Tag src={src} alt={alt} css={Styles.avatar({ hasMargin })} {...otherProps} />;
}
