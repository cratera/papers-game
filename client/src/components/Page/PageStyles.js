import { css } from '@emotion/core';

const gutter = '1.6rem';
const fadeH = '4rem';
const headerH = '6.4rem';

// [1] - REVIEW - How to handle headers. Discuss with @mmbotelho.

export const page = css`
  position: relative;
  width: 100vw;
  max-width: 50rem;
  margin: 0 auto;
  height: 100vh;
  overflow: hidden;
  display: grid;
  /* grid-template-areas: 'header' 'main' 'ctas'; [1] */
  grid-template-areas: 'main' 'main' 'ctas';
  grid-template-rows: ${headerH} 1fr auto;
  justify-content: 'space-between';
`;

export const header = ({ hasChildren }) => css`
  /* grid-area: header; */
  position: absolute;
  top: 0;
  width: 100%; /* [1] */

  height: ${headerH};
  padding: 0 0.4rem 0.8rem ${gutter}; /* 0.4 is for icon on the corner */
  display: flex;
  justify-content: ${hasChildren ? 'space-between' : 'flex-end'};
  align-items: center;
`;

export const main = css`
  grid-area: main;
  place-self: stretch;
  overflow: scroll;
  padding: ${headerH} ${gutter} 0;

  /* space for fadeout */
  &::after {
    content: '';
    display: block;
    height: calc(${fadeH} + ${gutter});
    flex-shrink: 0;
  }
`;

export const ctas = css`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  grid-area: ctas;
  align-self: end;
  padding: 0 ${gutter} 5.6rem;

  /* fadeout effect */
  box-shadow: 0 -${fadeH} 3rem white;

  &::before {
    content: '';
    display: block;
    height: 1px;
    width: calc(100% + (${gutter} * 2));
    margin-left: -${gutter};
    margin-top: -${fadeH};
  }

  & > button:not(:last-child),
  & > a:not(:last-child) {
    margin-bottom: 1.6rem;
  }
`;
