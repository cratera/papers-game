import { css } from '@emotion/core';
import * as Theme from 'Theme.js';

// TODO: Create Modal component when design is finished.
export const modal = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
`;

export const backdrop = css`
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

export const box = css`
  position: absolute;
  top: 10vw;
  width: 90vw;
  height: auto;
  left: 5vw;
  background-color: white;
  border-radius: 0.4rem;
  padding: 1.6rem;
`;

export const btnClose = css`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 4;
  height: 4.4rem;
  width: 4.4rem;
  border: none;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  background-color: white;

  &::before,
  &::after {
    content: '';
    position: absolute;
    display: block;
    left: 50%;
    top: 50%;
    width: 1.2rem;
    height: 0.2rem;
    background-color: ${Theme.colors.grayDark};
    transition: transform 0.15s ease-in;
    transform: translate(-50%, -50%) rotate(45deg);
    transform-origin: center center;
    border-radius: 0.2rem;
  }

  &::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }

  &:focus,
  &:hover {
    outline: none;

    &::before {
      transform: translate(-50%, -50%) rotate(0);
    }

    &::after {
      transform: translate(-50%, -50%) rotate(0);
    }
  }
`;

// ---------------------

export const title = css`
  margin-top: 0.8rem;
`;

export const tip = css`
  margin: 0.8rem 0 1.6rem;
`;

// TODO - dry same as HomeStyles.css
export const input = css`
  border: none;
  border-bottom: 1px solid ${Theme.colors.grayLight};
  border-radius: 0;
  width: 100%;
  text-align: center;
  ${Theme.typography.h1}
  margin: 0 0 1.6rem;

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
