import { css } from '@emotion/core';
import * as Theme from 'Theme.js';

export const page = css`
  padding: 1.6rem;
`;

export const backBtn = css``;

export const title = css`
  text-align: center;
  margin: 2.4rem auto 3.2rem;
`;

export const cta = css`
  width: 100%;
  background: ${Theme.colors.primaryLight};
  border: none;
  border-radius: 10px;
  padding: 6.4rem 1.6rem;
  text-align: center;
  font-size: inherit;
  color: ${Theme.colors.primary};

  svg {
    width: 100%;
    margin-bottom: 4.8rem;
  }
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
  padding-bottom: 13rem; /* space for footer */
`;

export const footer = css`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: ${Theme.colors.bg};
  padding: 1.6rem;

  > *:not(:last-child) {
    margin-bottom: 1.6rem;
  }
`;
