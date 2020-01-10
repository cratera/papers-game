import { css } from '@emotion/core';
import * as Theme from 'Theme.js';

export const avatar = ({ hasMargin }) => css`
  width: 4.8rem;
  height: 4.8rem;
  object-fit: cover;
  border-radius: 50%;
  background: ${Theme.colors.primaryLight};
  margin-right: ${hasMargin && '1.6rem'};
`;
