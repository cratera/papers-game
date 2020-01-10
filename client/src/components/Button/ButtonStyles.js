import { css } from '@emotion/core';
import * as Theme from 'Theme.js';

const variants = {
  primary: {
    bg: Theme.colors.primary,
    text: Theme.colors.bg,
  },
  success: {
    bg: Theme.colors.success,
    text: Theme.colors.bg,
  },
  danger: {
    bg: Theme.colors.danger,
    text: Theme.colors.bg,
  },
  light: {
    bg: Theme.colors.bg,
    text: Theme.colors.primary,
  },
  flat: {
    bg: Theme.colors.bg,
    text: Theme.colors.grayDark, // primary just on skip. @mmbotelho
  },
};

export const button = ({ variant, hasBlock, size }) => {
  return variant === 'icon'
    ? css`
        width: 4.4rem;
        height: 4.4rem;
        border: none;
        background: none;
        border-radius: 50%;
        font-size: 1.6rem;
        display: flex;
        align-items: center;
        justify-items: center;

        svg {
          width: 2.4rem;
        }
      `
    : css`
    ${
      variant === 'flat'
        ? `
      padding: 0;
      `
        : `
        padding: 1.6rem 2.4rem;
        ${variant !== 'success' ? 'box-shadow: 0px 4px 16px rgba(0, 56, 255, 0.3);' : ''}
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
