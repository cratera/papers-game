import * as Theme from 'Theme.js';
import { css } from '@emotion/core';

// Same as HomeStyles.
export const container = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 1.6rem 1.6rem 5rem; /* confirm the bottom of iphoneX */
  height: 100vh;
  height: calc(var(--vh) * 100);
  overflow: hidden;
`;

export const header = css`
  text-align: center;
  height: 5vh;
  height: calc(var(--vh) * 5);
  margin-bottom: 4rem;
`;

export const cap = css`
  padding-bottom: 0.8rem;
`;

// same as TeamsStyles
export const team = css`
  margin-top: 0.8rem;
  margin-bottom: 4rem;
`;

// same as TeamsStyles
export const headerTeam = css`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.6rem;
`;
