import { css } from '@emotion/core';
// import * as Theme from 'Theme.js';

export const list = css`
  margin-top: 1.6rem;
`;

export const item = css`
  display: flex;
  align-items: center;
  margin-bottom: 1.6rem; /* 2.4 too big */
  justify-content: space-between;

  span {
    display: flex;
    align-items: center;
  }
`;

export const itemStatus = css`
  max-height: 5.6rem;
`;
