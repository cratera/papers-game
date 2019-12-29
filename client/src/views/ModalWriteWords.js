/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useRef, useContext } from 'react';

import * as ModalStyles from './ModalStyles.js';
import * as Styles from './ModalWriteWordsStyles.js';
import * as Theme from 'Theme.js';
import Button from 'components/Button.js';
import CoreContext from 'store/CoreContext.js';
import PapersContext from 'store/PapersContext.js';
// import { focusAndOpenKeyboard } from 'utils';
import debounce from 'lodash/debounce';

// TODO: Create Modal component when design is finished.
export default function ModalWriteWords() {
  const Papers = useContext(PapersContext);
  const refSlider = useRef(null);
  // const setPapersWordsThrottled = useRef(throttle(q => Papers.setWords(q), 3000)).current;
  const handleScrollDebounced = useRef(debounce(handleScroll, 250)).current;
  const { closeModal } = useContext(CoreContext);
  const [words, setLocalWords] = useState([]);
  const [textareasHeight, setTextareasHeight] = useState({});

  const [errorMsg, setErrorMsg] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const wordsGoal = Papers.state.game.settings.words;
  const wordsCount = words.filter(word => !!word).length;

  const focusTextareaAtSlide = index => {
    const textarea = refSlider.current.childNodes[index].getElementsByTagName('textarea')[0];

    if (textarea) {
      textarea.focus(); // 🐛 it doesnt work on IOS...
    } else {
      console.warn('textarea doesnt exist', refSlider.current, index, textarea);
    }
  };

  useEffect(() => {
    refSlider.current.scrollTo(0, 0);
    focusTextareaAtSlide(0);
  }, [refSlider]);

  useEffect(() => {
    setTimeout(() => {
      focusTextareaAtSlide(slideIndex);
    }, 500); // give time to scroll finish
  }, [slideIndex]);

  const handleWordChange = (e, index) => {
    const wordsToEdit = [...words];
    wordsToEdit[slideIndex] = e.target.value;

    setTextareasHeight({
      // OPTIMIZE - recover 1 line when wrote too much
      [index]: e.target.scrollHeight,
    });

    // OPTIMIZE - Maybe change state only on blur?
    setLocalWords(wordsToEdit);
  };

  function handleClickNext() {
    const nextEmpty = words.findIndex(word => !word);
    const nextSlide = nextEmpty > -1 ? nextEmpty : slideIndex === 9 ? 0 : slideIndex + 1;
    const gutter = 24; // page padding - TODO connect emotion here
    refSlider.current.scrollTo((window.innerWidth - gutter) * nextSlide, 0);

    setSlideIndex(nextSlide);
  }

  const handleSubmitClick = () => {
    Papers.setWords(words, err => {
      if (err) {
        return setErrorMsg(`Something went wrong. ${JSON.stringify(err)}`);
      }
      closeModal();
    });
  };

  function handleScroll(e, currentSlide) {
    const el = refSlider.current;
    const newSlide = Math.round((el.scrollLeft / el.scrollWidth) * 10);

    if (currentSlide !== newSlide) {
      setSlideIndex(newSlide);
    }
  }

  function renderSliders() {
    const papers = [];
    for (let i = 0; i < wordsGoal; i++) {
      const isActive = i === slideIndex;
      const StylesIsActive = isActive && Styles.isActive;
      const height = textareasHeight[i] || '4rem';

      papers.push(
        <div css={[Styles.slide, StylesIsActive]} data-slide={i + 1} key={i}>
          <p css={Styles.slideTitle}>Paper nº {i + 1}</p>
          <textarea
            style={{ height }}
            onChange={e => handleWordChange(e, i)}
            placeholder="Write here..."
            {...(isActive ? { autoFocus: 'autofocus' } : {})}
            css={Styles.textarea}
          ></textarea>
        </div>
      );
    }

    return papers;
  }

  return (
    <section css={ModalStyles.modal}>
      <div css={ModalStyles.backdrop} onClick={closeModal} role="none"></div>
      <div css={ModalStyles.box}>
        <button css={ModalStyles.btnClose} aria-label="Close Modal" onClick={closeModal}></button>
        <div>
          {/* eslint-disable-next-line */}
          <p css={[Theme.typography.small, Theme.typography.secondary, Styles.header]}>
            💡Write down words or expressions. Make sure everyone knows what you’re talking about!
          </p>
          <div
            css={Styles.slides}
            onScroll={e => handleScrollDebounced(e, slideIndex)}
            ref={refSlider}
          >
            {renderSliders()}
          </div>
          {errorMsg && <p css={Styles.sliderLabel}>{errorMsg}</p>}
          <p css={Styles.sliderLabel}>
            {wordsCount} of {wordsGoal} done
          </p>
          <div css={Styles.sliderNav}>
            {wordsCount !== 10 ? (
              <Button hasBlock variant="light" onClick={handleClickNext}>
                Next paper
              </Button>
            ) : (
              <Button hasBlock onClick={handleSubmitClick}>
                All done!! Eheheheh
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
