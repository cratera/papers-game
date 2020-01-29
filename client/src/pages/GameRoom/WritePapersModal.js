/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useRef, useContext } from 'react';
import debounce from 'lodash/debounce';

import * as Theme from 'Theme.js';
import CoreContext from 'store/CoreContext.js';
import PapersContext from 'store/PapersContext.js';
import Button from 'components/Button';
import Modal from 'components/Modal';

import * as Styles from './WritePapersModalStyles.js';

export default function WritePapersModal() {
  const Papers = useContext(PapersContext);
  const { game, profile } = Papers.state;
  const refSlider = useRef(null);
  // const setPapersWordsThrottled = useRef(throttle(q => Papers.setWords(q), 3000)).current;
  const handleScrollDebounced = useRef(debounce(handleScroll, 250)).current;
  const { closeModal } = useContext(CoreContext);
  const [words, setLocalWords] = useState([]);
  const [textareasHeight, setTextareasHeight] = useState({});

  const [errorMsg, setErrorMsg] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const wordsGoal = game.settings.words;
  const wordsCount = words.filter(word => !!word).length;
  const wordsAreStored = !!game.words[profile.id];

  const focusTextareaAtSlide = index => {
    const textarea = refSlider.current.childNodes[index].getElementsByTagName('textarea')[0];

    if (textarea) {
      textarea.focus(); // 🐛 it doesnt work on IOS...
    } else {
      console.warn('textarea doesnt exist', refSlider.current, index, textarea);
    }
  };

  useEffect(() => {
    if (wordsAreStored) {
      closeModal();
    }
  }, [wordsAreStored]); // eslint-disable-line

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
      // OPTIMIZE - recuce to 1 line when deleting chars
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

  const color = Theme.colors.primary;

  return (
    <Modal>
      <p css={[Theme.typography.small, Theme.typography.secondary, Styles.header]}>
        {/* prettier-ignore */}
        <svg css={Styles.headerSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" fill="white"/>
          <path d="M7.34851 10.3703C7.26855 11.8112 7.81518 13.2126 8.84837 14.2148C9.66244 15.0045 10.1293 16.0919 10.1293 17.1982V17.8361C10.1293 18.5135 10.6803 19.0645 11.3577 19.0645H13.2522C13.9296 19.0645 14.4805 18.5135 14.4805 17.8361V17.1987C14.4805 16.0783 14.9357 15.002 15.7294 14.2457C16.7224 13.2995 17.2692 12.0233 17.2692 10.6522C17.2692 7.91472 15.0423 5.68775 12.3048 5.68775C12.118 5.68775 11.9283 5.69814 11.741 5.71892C9.36948 5.98117 7.4811 7.9809 7.34851 10.3703ZM11.8404 6.61703C11.9949 6.59986 12.1512 6.59128 12.305 6.59128C14.5442 6.59128 16.3659 8.41279 16.3659 10.6522C16.3659 11.7737 15.9187 12.8175 15.1064 13.5916C14.1347 14.5175 13.5772 15.8321 13.5772 17.1987V17.8361C13.5772 18.0153 13.4313 18.1609 13.2524 18.1609H11.3579C11.1788 18.1609 11.0331 18.015 11.0331 17.8361V17.1982C11.0331 15.849 10.4661 14.5254 9.47767 13.5663C8.63265 12.7466 8.1854 11.5998 8.25091 10.4204C8.35911 8.46632 9.90233 6.83139 11.8404 6.61703Z" fill={color}/>
          <path d="M12.3051 7.82685C12.9814 7.82685 13.6363 8.07058 14.149 8.51331C14.2132 8.56865 14.2918 8.59576 14.3704 8.59576C14.4655 8.59576 14.5599 8.556 14.627 8.4783C14.7494 8.33667 14.7336 8.12276 14.592 8.00033C13.9561 7.45144 13.1441 7.14898 12.3051 7.14898C12.1179 7.14898 11.9663 7.30055 11.9663 7.48781C11.9663 7.67506 12.1179 7.82685 12.3051 7.82685Z" fill={color}/>
          <path d="M15.1305 10.6522C15.1305 10.8394 15.2821 10.991 15.4693 10.991C15.6566 10.991 15.8082 10.8394 15.8082 10.6522C15.8082 10.2192 15.7295 9.79608 15.5746 9.39447C15.5073 9.22008 15.3114 9.13335 15.1366 9.20043C14.962 9.26775 14.875 9.46404 14.9426 9.63842C15.0673 9.96188 15.1305 10.303 15.1305 10.6522Z" fill={color}/>
          <path d="M13.7752 19.5106H10.8347C10.6474 19.5106 10.4958 19.6622 10.4958 19.8494C10.4958 20.0367 10.6474 20.1882 10.8347 20.1882H13.7754C13.9627 20.1882 14.1143 20.0367 14.1143 19.8494C14.1143 19.6622 13.9625 19.5106 13.7752 19.5106Z" fill={color}/>
          <path d="M14.114 20.9201C14.114 20.7328 13.9625 20.5813 13.7752 20.5813H10.8347C10.6474 20.5813 10.4958 20.7328 10.4958 20.9201C10.4958 21.1073 10.6474 21.2589 10.8347 21.2589H13.7754C13.9625 21.2589 14.114 21.1071 14.114 20.9201Z" fill={color}/>
          <path d="M4.33882 9.96618C4.15157 9.96618 4 10.1177 4 10.305C4 10.4923 4.15157 10.6438 4.33882 10.6438H6.29112C6.47838 10.6438 6.62994 10.4923 6.62994 10.305C6.62994 10.1177 6.47838 9.96618 6.29112 9.96618H4.33882Z" fill={color}/>
          <path d="M20.2713 10.6438C20.4586 10.6438 20.6102 10.4923 20.6102 10.305C20.6102 10.1177 20.4586 9.96618 20.2713 9.96618H18.319C18.1318 9.96618 17.9802 10.1177 17.9802 10.305C17.9802 10.4923 18.1318 10.6438 18.319 10.6438H20.2713Z" fill={color}/>
          <path d="M11.9663 2.33882V4.29112C11.9663 4.47838 12.1179 4.62994 12.3051 4.62994C12.4924 4.62994 12.644 4.47838 12.644 4.29112V2.33882C12.644 2.15157 12.4924 2 12.3051 2C12.1179 2 11.9663 2.15157 11.9663 2.33882Z" fill={color}/>
          <path d="M16.7971 6.29198L18.1775 4.91161C18.3099 4.77947 18.3099 4.56466 18.1775 4.43252C18.0451 4.30015 17.8308 4.30015 17.6984 4.43252L16.318 5.81288C16.1857 5.94502 16.1857 6.15984 16.318 6.29198C16.3842 6.35816 16.4709 6.39114 16.5577 6.39114C16.6444 6.39114 16.7309 6.35816 16.7971 6.29198Z" fill={color}/>
          <path d="M7.81289 14.318L6.43253 15.6984C6.30016 15.8305 6.30016 16.0451 6.43253 16.1775C6.49871 16.2437 6.58545 16.2766 6.67219 16.2766C6.75893 16.2766 6.84567 16.2437 6.91185 16.1775L8.29221 14.7971C8.42458 14.665 8.42458 14.4504 8.29221 14.318C8.15985 14.1857 7.94526 14.1857 7.81289 14.318Z" fill={color}/>
          <path d="M6.91162 4.43252C6.77926 4.30015 6.56489 4.30015 6.43253 4.43252C6.30016 4.56466 6.30016 4.77947 6.43253 4.91161L7.81289 6.29198C7.87907 6.35816 7.96581 6.39114 8.05255 6.39114C8.13929 6.39114 8.22603 6.35816 8.29221 6.29198C8.42458 6.15984 8.42458 5.94502 8.29221 5.81288L6.91162 4.43252Z" fill={color}/>
          <path d="M16.318 14.318C16.1857 14.4504 16.1857 14.665 16.318 14.7971L17.6984 16.1775C17.7646 16.2437 17.8513 16.2766 17.9381 16.2766C18.0248 16.2766 18.1115 16.2437 18.1777 16.1775C18.3101 16.0451 18.3101 15.8305 18.1777 15.6984L16.7973 14.318C16.6648 14.1857 16.4504 14.1857 16.318 14.318Z" fill={color}/>
          <path d="M13.3789 21.9905C13.3789 21.8033 13.2273 21.6517 13.04 21.6517H11.5698C11.3825 21.6517 11.231 21.8033 11.231 21.9905C11.231 22.1778 11.3825 22.3294 11.5698 22.3294H13.04C13.2273 22.3294 13.3789 22.1778 13.3789 21.9905Z" fill={color}/>
        </svg>
        <span>
          Write down words or expressions. Make sure everyone knows what you’re talking about!
        </span>
      </p>
      <div css={Styles.slides} onScroll={e => handleScrollDebounced(e, slideIndex)} ref={refSlider}>
        {renderSliders()}
      </div>
      {errorMsg && <p css={Styles.sliderLabels}>{errorMsg}</p>}
      <div css={Styles.sliderLabels} aria-label="Papers status">
        <p>
          {slideIndex + 1} of {wordsGoal}
        </p>
        <p>
          {wordsCount} {wordsCount === 1 ? 'paper' : 'papers'} filled
        </p>
      </div>
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
    </Modal>
  );
}
