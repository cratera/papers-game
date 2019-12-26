/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useRef, useContext } from 'react';

import * as ModalStyles from './ModalStyles.js';
import * as Theme from 'Theme.js';
import Button from 'components/Button.js';
import CoreContext from 'store/CoreContext.js';
import PapersContext from 'store/PapersContext.js';
import throttle from 'lodash/throttle';

// TODO: Create Modal component when design is finished.
export default function ModalWriteWords() {
  const Papers = useContext(PapersContext);
  const setPapersWordsThrottled = useRef(throttle(q => Papers.setWords(q), 3000)).current;
  const { closeModal } = useContext(CoreContext);
  const [words, setLocalWords] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const wordsGoal = Papers.state.game.settings.words;
  const wordsCount = words.length;

  const handleChange = e => {
    const value = e.target.value;
    const words = value.split(/\n/g).filter(word => !!word);
    console.log('Words written:', words.length);

    setLocalWords(words);
    setPapersWordsThrottled(words.length);
  };

  const handleBtnClick = () => {
    Papers.setWords(words, err => {
      if (err) {
        return setErrorMsg(`Something went wrong. ${JSON.stringify(err)}`);
      }
      closeModal();
    });
  };

  return (
    <section css={ModalStyles.modal}>
      <div css={ModalStyles.backdrop} onClick={closeModal} role="none"></div>
      <div css={ModalStyles.box}>
        <button css={ModalStyles.btnClose} aria-label="Close Modal" onClick={closeModal}></button>
        <div>
          <h1 css={[ModalStyles.title, Theme.typography.h3]}>Write your words.</h1>
          <p css={[Theme.typography.secondary, ModalStyles.tip]}>
            Write a word / expression per line
          </p>
          {wordsCount !== 10 && <p>Words missing: {wordsGoal - wordsCount} </p>}
          {errorMsg && <p css={ModalStyles.errorMsg}>{errorMsg}</p>}
          <textarea onChange={handleChange} css={ModalStyles.textarea} autoFocus></textarea>
        </div>
        {wordsCount === 10 && (
          <Button hasBlock onClick={handleBtnClick}>
            That's it!
          </Button>
        )}
      </div>
    </section>
  );
}
