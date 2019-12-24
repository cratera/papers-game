import { css } from '@emotion/core';

// Same as HomeStyles.
export const container = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 1.6rem 1.6rem 5rem; // confirm the bottom of iphoneX
  height: 100vh;
  overflow: hidden;
`;

export const header = css`
  text-align: center;
  padding-top: 5vh;
  margin-bottom: 4rem;
`;

export const cap = css`
  padding-bottom: 0.8rem;
`;

export const lobby = css`
  margin-top: 1.6rem;
`;

export const lobbyItem = css`
  display: flex;
  align-items: center;
  margin-bottom: 2.4rem;
  justify-content: space-between;

  span {
    display: flex;
    align-items: center;
  }
`;

export const lobbyAvatar = css`
  width: 5.6rem;
  height: 5.6rem;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 1.6rem;
`;
