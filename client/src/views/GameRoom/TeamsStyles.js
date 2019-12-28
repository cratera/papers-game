import { css } from '@emotion/core';
import * as Theme from 'Theme.js';

export const page = css`
  padding: 1.6rem;
`;

export const backBtn = css``;

export const title = css`
  text-align: center;
  margin: 2.4rem auto 0;
`;

export const cta = css`
  width: 100%;
  background: ${Theme.colors.primaryLight};
  border: none;
  border-radius: 10px;
  margin-top: 3.2rem;
  padding: 6.4rem 1.6rem;
  text-align: center;
  font-size: inherit;
  color: ${Theme.colors.primary};

  svg {
    width: 100%;
    margin-bottom: 4.8rem;
  }
`;

export const team = css`
  margin-top: 0.8rem;
  margin-bottom: 4rem;
`;

export const headerTeam = css`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.6rem;

  button {
    color: ${Theme.colors.primary}; /* TODO DS */
  }
`;

export const main = css`
  padding-bottom: 10rem; /* space for footer */
`;

export const footer = css`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: ${Theme.colors.bg};
  padding: 0 1.6rem 1.6rem;
  box-shadow: 0 -2rem 2rem white; /* fadeout effect */

  /* REVIEW THIS first-child emotion error */
  > button:first-of-type {
    margin-top: -1rem; /* to appear above the fadeout */
  }

  > *:not(:last-child) {
    margin-bottom: 1.6rem;
  }
`;
