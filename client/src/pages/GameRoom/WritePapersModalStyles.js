import { css } from '@emotion/core';
import * as Theme from 'Theme.js';

export const header = css`
  margin: 0 2.4rem 0 0;
  display: flex;
  align-items: center;
`;

export const headerSvg = css`
  width: 2.4rem;
  height: 2.4rem;
  margin-right: 0.8rem;
  flex-shrink: 0;
`;

export const slides = css`
  width: 100vw;
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding: 1.6rem 0;
  margin-left: -1.6rem; /* page padding */

  &::after {
    /* make margin work on last slide */
    content: '';
    width: 1px;
    display: block;
    flex-shrink: 0;
  }
  /* &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: black;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  } */
`;

export const slide = css`
  width: calc(100vw - (1.6rem * 2));
  min-height: 24.5rem;
  ${Theme.bp.xs} {
    min-height: 14.5rem; /* space for 2 lines */
  }
  margin: 0 0.4rem;
  padding: 0.8rem 3.2rem 3.2rem;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  scroll-snap-align: center;
  background: ${Theme.colors.bg};
  box-shadow: 0px 4px 16px rgba(0, 56, 255, 0.2);
  opacity: 0.8;
  transition: opacity 250ms;

  &:first-child /* emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason */ {
    margin-left: 1.6rem;
  }

  &:last-child {
    margin-right: 1.6rem;
  }
`;

export const isActive = css`
  opacity: 1;
`;

export const slideTitle = css`
  text-align: center;
  ${Theme.typography.small}
  ${Theme.typography.secondary}
  opacity: 0.5;
`;

export const textarea = css`
  font-family: inherit;
  font-size: inherit;
  ${Theme.typography.h2}
  color: ${Theme.typography.grayDark};
  border: none;
  border-radius: 0;
  border-bottom: 1px solid ${Theme.colors.primaryLight};
  width: 100%;
  height: 4rem;
  text-align: center;
  resize: none;

  &::-moz-placeholder,
  &::-webkit-input-placeholder {
    color: ${Theme.colors.grayMedium};
  }

  &:focus {
    outline: none;
    border-color: ${Theme.colors.primary};
  }
`;

export const sliderLabels = css`
  display: flex;
  justify-content: space-between;
  ${Theme.typography.secondary}
  ${Theme.typography.small}
  margin-top: -0.8rem;
  margin-bottom: 2.4rem;
`;

export const sliderNav = css`
  display: flex;
`;
/* Don't need button navigation */
/* @supports (scroll-snap-type) {
} */
