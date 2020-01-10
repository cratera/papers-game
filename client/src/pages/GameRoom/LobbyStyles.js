import { css } from '@emotion/core';
import * as Theme from 'Theme.js';

export const header = css`
  text-align: center;
  margin-bottom: 4rem;

  ${Theme.bp.xs} {
    margin-bottom: 2rem;
  }
`;

export const headerImg = css`
  margin-top: 0.8rem;
  max-height: 14.7rem;
`;

export const cap = css`
  padding-bottom: 0.8rem;
`;

export const title = profileIsAdmin => css`
  display: flex;
  justify-content: center;
  align-items: baseline;
  ${profileIsAdmin && `padding-left: 3rem;`} /* svg space */
`;

// same as TeamsStyles
export const headerTeam = css`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.6rem;
`;

// same as TeamsStyles
export const team = css`
  margin-top: 0.8rem;
  margin-bottom: 4rem;
`;
