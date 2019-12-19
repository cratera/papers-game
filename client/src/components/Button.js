/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import * as theme from '../Theme.js';

const variants = {
  primary: {
    bg: theme.colors.grayDark,
    text: theme.colors.bg,
  },
  light: {
    bg: theme.colors.bg,
    text: theme.colors.grayDark,
  },
  flat: {
    bg: theme.colors.bg,
    text: theme.colors.grayDark,
  }
}

const style = ({ variant, hasBlock }) => {
  console.log('hum', variant)
  return css`
  ${variant === 'flat' ? `
    padding: 1.6rem;
  `: `
    box-shadow: 0px 0.4rem 1.6rem rgba(72, 79, 93, 0.3);
    padding: 1.6rem 2.4rem;
  `}
  border: none;
  border-radius: 4.2rem;
  font-size: inherit;
  background-color: ${variants[variant].bg};
  color: ${variants[variant].text};
  width: ${hasBlock ? '100%' : ''};
  display: ${hasBlock ? 'block' : 'inline-block'};
  flex-shrink: 0;
`};

export default function Button({ variant, hasBlock, children, ...restProps}) {
  return (
    <button { ...restProps } css={style({ variant, hasBlock })}>
      {children}
    </button>
  )
}

Button.defaultProps = {
  variant: 'primary'
};