/** @jsx jsx */
import { jsx, Global, css } from '@emotion/core';

export const colors = {
  grayDark: '#484F5D',
  grayMedium: '#7F848E',
  grayLight: '#E5E6E8',
  primary: '#0038FF',
  primaryLight: '#E6EBFF',
  success: '#4EBD81',
  danger: '#e51d1d', // TODO/REVIEW @mmbotelho
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
    color: ${colors.grayMedium};
  `,
  small: css`
    font-size: 1.4rem;
  `,
  italic: css`
    color: ${colors.grayMedium};
    font-style: italic;
  `,
};

export const base = css`
  background-color: white;
  color: ${colors.grayDark};
  ${typography.default};
  line-height: 1.4;
`;

export const bp = {
  xs: `@media (max-height: 35.5em)`, // 568px; - iphone5
};

export function ThemeGlobal() {
  return (
    <Global
      styles={css`
        html {
          font-size: 62.5%;
          letter-spacing: -0.5px;
          font-family: -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          color: ${colors.grayDark};
        }

        body {
          box-sizing: border-box;
          font-size: 1.6rem;
          line-height: 1.4;
        }

        body * {
          box-sizing: inherit;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }
      `}
    />
  );
}
