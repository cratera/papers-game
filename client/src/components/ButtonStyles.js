import { css } from '@emotion/core';
import * as theme from '../Theme.js';

const variants = {
  primary: {
    bg: theme.colors.primary,
    text: theme.colors.bg,
  },
  light: {
    bg: theme.colors.bg,
    text: theme.colors.primary,
  },
  flat: {
    bg: theme.colors.bg,
    text: theme.colors.grayDark,
  },
};

export const button = ({ variant, hasBlock, size }) => {
  return css`
    ${
      variant === 'flat'
        ? `
      padding: 0;
      `
        : `
      box-shadow: 0px 4px 16px rgba(0, 56, 255, 0.1);
      padding: 1.6rem 2.4rem;
  `
    }
    ${
      size === 'sm'
        ? `
      padding: 0.5rem 1.5rem;
      font-size: 1.4rem;
  `
        : ''
    }
    box-shadow: ${variants[variant].boxShadow};
    border: none;
    border-radius: 4.2rem;
    font-size: inherit;
    background-color: ${variants[variant].bg};
    color: ${variants[variant].text};
    width: ${hasBlock ? '100%' : ''};
    display: ${hasBlock ? 'block' : 'inline-block'};
    flex-shrink: 0;
    text-align: center;
    text-decoration: none;

    &:focus {
      outline: 0;
      box-shadow: 0px 4px 16px rgba(0, 56, 255, 0.1), 0 0px 5px rgba(72, 79, 93, 0.4); /* verify with maggie */
    }
  `;
};
