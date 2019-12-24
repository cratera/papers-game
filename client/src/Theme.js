import { css } from '@emotion/core';

export const colors = {
  grayDark: '#484F5D',
  grayMedium: '#7F848E',
  grayLight: '#E5E6E8',
  primary: '#0038FF',
  primaryLight: '#E6EBFF',
  bg: '#fff',
};

export const typography = {
  h1: css`
    font-size: 4rem;
    font-weight: 700;
    line-height: 4.8rem;
    display: block;
  `,
  h2: css`
    font-size: 3.2rem;
    font-weight: 700;
  `,
  h3: css`
    font-size: 1.6rem;
    font-weight: 700;
  `,
  default: css`
    font-size: 1.6rem;
  `,
  secondary: css`
    font-size: 1.6rem;
    color: ${colors.grayMedium};
  `,
  small: css`
    font-size: 1.4rem;
  `,
};

export const base = css`
  background-color: white;
  color: ${colors.grayDark};
  ${typography.default};
  line-height: 1.4;
`;
