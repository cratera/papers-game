/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';

import CoreContext from 'store/CoreContext.js';

import * as Styles from './ModalStyles.js';

export default function Modal({ children }) {
  const { closeModal } = useContext(CoreContext);

  return (
    <section css={Styles.modal}>
      <div css={Styles.backdrop} onClick={closeModal} role="none"></div>
      <div css={Styles.box}>
        <button css={Styles.btnClose} aria-label="Close Modal" onClick={closeModal}></button>
        {children}
      </div>
    </section>
  );
}
