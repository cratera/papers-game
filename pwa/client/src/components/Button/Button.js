/** @jsx jsx */
import { jsx } from '@emotion/core';
import { memo } from 'react';
import * as Styles from './ButtonStyles.js';

function Button({ as, variant, hasBlock, size, children, ...restProps }) {
  const Tag = as || 'button';
  return (
    <Tag {...restProps} css={Styles.button({ variant, hasBlock, size })}>
      {children}
    </Tag>
  );
}

Button.defaultProps = {
  variant: 'primary', // primary | success | light | flat | icon
};

export default memo(Button);
