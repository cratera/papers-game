import { css } from '@emotion/core';
import * as Theme from 'Theme.js';

const sizes = {
  md: '4.8rem',
  lg: '5.6rem',
};

export const avatar = ({ hasMargin, size = 'md' }) => css`
  width: ${sizes[size]};
  height: ${sizes[size]};
  object-fit: cover;
  border-radius: 50%;
  background: ${Theme.colors.primaryLight};
  margin-right: ${hasMargin && '1.6rem'};
`;
