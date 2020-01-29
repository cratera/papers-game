import { css } from '@emotion/core';
import * as Theme from 'Theme.js';

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
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  max-width: 50rem;
  height: 100%;
  background-color: white;
  padding: 1.6rem;
`;

export const btnClose = css`
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  z-index: 4;
  height: 4.4rem;
  width: 4.4rem;
  border: none;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  background-color: transparent;

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
