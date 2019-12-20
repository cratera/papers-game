import { css } from '@emotion/core'
import * as theme from 'Theme.js';

export const container = css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.6rem 1.6rem 6rem;
  height: 100vh;
  overflow: hidden;
`

export const body = css`
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export const logo = css`
  font-size: 8rem;
`;

export const paragraph = css`
  text-align: center;
  margin: 0.8rem auto;
`;

export const step = css`
  margin-top: 10vh;
  display: block;
  text-align: center;
`;

export const input = css`
  border: none;
  border-bottom: 1px solid ${theme.colors.grayLight};
  border-radius: 0;
  width: 100%;
  text-align: center;
  ${theme.typography.h1}
  margin-top: 4rem;

  &:focus {
    outline: none;
    border-color: ${theme.colors.grayMedium};
  }
`

export const avatarPlace = css`
  width: 80vw;
  height: 80vw;
  border-radius: 50%;
  border: 3px solid ${theme.colors.grayLight};
  margin: 1.6rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const avatarImg = css`
  ${avatarPlace}
  border: none;
  object-fit: cover;
`;

export const memeContainer = css`
  position: relative;
  margin-bottom: 1rem;
`;


export const memeFace = css`
  ${avatarImg}
  width: 7rem;
  height: 7rem;
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
`;

export const memeBody = css`
  width: 25rem;
  height: 25rem;
  fill: ${theme.colors.grayDark};
`;

export const btnBack = css`
  text-align: left;
  position: absolute;
  top: 0;
  left: 0;
`;