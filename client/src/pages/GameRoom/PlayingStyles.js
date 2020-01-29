import { css } from '@emotion/core';
import * as Theme from 'Theme.js';

export const header = css`
  text-align: center;
`;

export const headerTitle = css`
  ${Theme.typography.h1}
  margin-bottom: 0.8rem;
`;

// turnOther screen
export const to = {
  wrapper: css`
    display: flex;
    flex-direction: column;
  `,
  main: css`
    text-align: center;
    padding-top: 25%;
  `,
};
export const tos = {
  container: css`
    display: grid;
    grid-template-areas:
      'title title'
      'avatar name'
      'avatar team';
    grid-template-columns: min-content;
  `,
  title: css`
    grid-area: title;
    margin-bottom: 0.8rem;
  `,
  avatar: css`
    grid-area: avatar;
  `,
  name: css`
    grid-area: name;
    align-self: center;
  `,
  team: css`
    grid-area: team;
    align-self: center;
  `,
};
