import { css } from '@emotion/core';
import * as Theme from 'Theme.js';

export const main = ({ centered }) => css`
  display: flex;
  flex-grow: 1;
  text-align: center;
  flex-direction: column;
  justify-content: ${centered ? 'center' : 'flex-start'};
`;

export const logo = css`
  font-size: 8rem;
`;

export const paragraph = css`
  margin: 0.8rem auto;
`;

export const input = css`
  ${Theme.typography.h1}
  border: none;
  border-bottom: 1px solid ${Theme.colors.grayLight};
  border-radius: 0;
  width: 100%;
  text-align: center;
  margin-top: 4.8rem;
  margin-bottom: 4.8rem;

  ${Theme.bp.xs} {
    margin-top: 1.6rem;
    margin-bottom: 1.6rem;
  }

  &:focus {
    outline: none;
    border-color: ${Theme.colors.primaryLight};
  }
`;

export const avatarPlace = css`
  width: 80vw;
  height: 80vw;
  max-width: 28.4rem;
  max-height: 28.4rem;
  border-radius: 50%;
  background-color: ${Theme.colors.primaryLight};
  color: ${Theme.colors.primary};
  margin: 2.4rem auto;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  svg {
    /* camera */
    stroke: ${Theme.colors.primary};
    display: inline-block;
    margin-bottom: 1.6rem;
  }
`;

export const avatarImg = css`
  ${avatarPlace}
  border: none;
  object-fit: cover;
`;

// -----

export const memeContainer = css`
  position: relative;
  margin-bottom: 4.8rem;

  ${Theme.bp.xs} {
    margin-bottom: 1.4rem;
  }
`;

export const memeFace = css`
  ${avatarImg}
  background: ${Theme.colors.grayDark};
  margin: -0.6rem 0;
  width: 7rem;
  height: 7rem;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
`;

export const memeBody = css`
  width: 20rem;
  height: 20rem;
  opacity: 0.8;
`;
