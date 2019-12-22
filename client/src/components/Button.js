/** @jsx jsx */
import { jsx } from '@emotion/core';
import { memo } from 'react';
import * as Styles from './ButtonStyles.js';

function Button({ as, variant, hasBlock, children, ...restProps }) {
  const Tag = as || 'button';
  return (
    <Tag {...restProps} css={Styles.button({ variant, hasBlock })}>
      {children}
    </Tag>
  );
}

Button.defaultProps = {
  variant: 'primary',
};

export default memo(Button);
