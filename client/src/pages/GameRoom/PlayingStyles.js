import { css } from '@emotion/core';
import * as Theme from 'Theme.js';

export const header = css`
  text-align: center;
`;

export const headerTitle = css`
  ${Theme.typography.h1}
  margin-bottom: 0.8rem;
`;

export const inst = {
  container: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  first: css`
    transform: rotate(18deg) translate(10vh, -2rem);
    width: 18rem;
    ${Theme.typography.small}

    ${Theme.bp.xs} {
      width: 8rem;
      text-align: left;
      transform: translate(20vh, 6rem);
    }
  `,
  img: css`
    height: 100%;
    max-height: 40vh;
  `,
  second: css`
    transform: rotate(-10deg) translate(-5vh, -1rem);
    width: 23rem;
    ${Theme.typography.small}

    ${Theme.bp.xs} {
      transform: translate(-14vw, -14vw);
      text-align: left;
      width: 18rem; /* REVIEW / TODO with @mmbotelho */
    }
  `,
};

export const count321 = css`
  ${Theme.typography.h1}
  color: ${Theme.colors.primary};
  text-align: center;
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
    ${Theme.bp.xs} {
      padding-top: 15%;
    }
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

export const go = {
  main: css`
    position: relative;
    height: calc(100% - 11rem); /* REVIEW 11rem */
    display: flex;
    flex-direction: column;
    justify-content: center;
  `,

  ctaDim: css`
    opacity: 0.5;
  `,

  // Q: How can we do nesting on CSS? .main .count321
  count: css`
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
  `,

  paper: css`
    position: relative;
    ${Theme.typography.h2};
    background: ${Theme.colors.bg};
    box-shadow: 0 0.4rem 1.6rem rgba(0, 56, 255, 0.1);
    padding: 1.6rem;
    height: 60vw;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: color 250ms ease-out, background-color 250ms ease-out,
      transform 400ms 500ms cubic-bezier(0.23, 1, 0.32, 1);
    will-change: transform; /* to be smooth on safari */
  `,

  gotcha: css`
    transform: translate(-100vw, -50%) rotate(-45deg);
    color: ${Theme.colors.success};
    background-color: ${Theme.colors.successLight};
  `,
  nop: css`
    transform: translate(0, 70vh) rotate(30deg);
    color: ${Theme.colors.grayLight};
  `,

  paperWord: css`
    transition: filter 250ms;
    filter: blur(0px);
    outline: 30px solid white; /* so filter animation works correctly on ios */
  `,

  paperWordInsideGotch: css`
    outline: none; /* Q: WTF how do i do nesting here?? */
  `,
  blur: css`
    filter: blur(20px);
  `,

  tipBlur: css`
    white-space: nowrap;
    ${Theme.typography.default};
    color: ${Theme.colors.grayMedium};
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translate(-50%, 0);
    font-weight: 400;
  `,
};

export const tscore = {
  main: css`
    text-align: center;
  `,
  header: css`
    text-align: center;
  `,
  headerKicker: css`
    ${Theme.typography.small};
    color: ${Theme.colors.grayMedium};
    margin-bottom: -0.5rem;
  `,
  list: css`
    margin: 2.4rem 0;
    border-top: 1px solid ${Theme.colors.grayLight};
  `,
  item: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid ${Theme.colors.grayLight};
    font-weight: bold;
  `,
  btn: type => css`
    position: relative;
    transform: ${type === 'add' && `rotate(-45deg)`};
    box-shadow: 0 0.4rem 0.8rem rgba(${type === 'add' ? '69, 153, 0' : '153, 0, 0'}, 0.2);

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform-origin: 50% 50%;
      width: 2rem;
      height: 0.2rem;
      border-radius: 0.2rem;
      background-color: ${type === 'add' ? Theme.colors.success : Theme.colors.danger};
    }

    &::before {
      transform: translate(-50%, -50%) rotate(-45deg);
    }
    &::after {
      transform: translate(-50%, -50%) rotate(45deg);
    }
  `,

  btnToggle: css`
    ${Theme.typography.small};
    color: ${Theme.colors.grayMedium};
    width: 100%;
    padding: 0.4rem 0.8rem;
  `,
};
