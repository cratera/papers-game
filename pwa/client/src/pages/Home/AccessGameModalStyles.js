import { css } from '@emotion/core';
import * as Theme from 'Theme.js';

export const modal = css``;

export const backdrop = css``;

export const box = css``;

export const btnClose = css``;

export const title = css`
  text-align: center;
  margin-top: 4rem;
`;

export const tip = css`
  text-align: center;
  margin: 0.8rem 0 1.6rem;
`;

// TODO - component Input - same as HomeStyles.css
export const input = css`
  border: none;
  border-bottom: 1px solid ${Theme.colors.grayLight};
  border-radius: 0;
  width: 100%;
  text-align: center;
  ${Theme.typography.h1}
  margin: 0 0 1.6rem;
  margin-top: 6rem;

  ${Theme.bp.xs} {
    margin-top: 0.8rem;
  }

  &:focus {
    outline: none;
    border-color: ${Theme.colors.grayMedium};
  }
`;

export const errorMsg = css`
  ${Theme.typography.small}
  color: #da4040;
  margin-bottom: 1.6rem;
  text-align: center;
`;
