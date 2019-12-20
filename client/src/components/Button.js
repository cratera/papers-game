/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { memo } from 'react';
import * as Styles from './ButtonStyles.js';

function Button({ variant, hasBlock, children, ...restProps}) {
  return (
    <button { ...restProps } css={Styles.button({ variant, hasBlock })}>
      {children}
    </button>
  )
}

Button.defaultProps = {
  variant: 'primary'
};

export default memo(Button);