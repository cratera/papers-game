/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';

import * as ModalStyles from './ModalStyles.js';
import * as Theme from 'Theme.js';
import Button from 'components/Button.js';
import CoreContext from 'store/CoreContext.js';
import PapersContext from 'store/PapersContext.js';

// TODO: Create Modal component when design is finished.

export default function ModalaccessGame({ variant }) {
  const Papers = useContext(PapersContext);
  const { closeModal } = useContext(CoreContext);
  const [state, setState] = useState({
    gameName: null,
    gameToRedirect: null,
    errorMsg: null,
  });

  const handleInputChange = e => {
    const gameName = e.target.value;

    setState(state => ({
      ...state,
      gameName,
    }));
  };

  const handleBtnClick = () => {
    Papers.accessGame(variant, state.gameName, (err, game) => {
      if (err) {
        // TODO - Move this out of here - redux(mapstatetoprops?)/context/wtv...
        const errorMsgMap = {
          exists: () => 'Choose other name.',
          notFound: () => 'This game does not exist.',
          ups: () => `Ups, something went wrong! Error: ${JSON.stringify(err)}`,
        };

        const errorMsg = (errorMsgMap[err] || errorMsgMap.ups)();

        console.warn('accessGame() err:', errorMsg);

        return setState(state => ({ ...state, errorMsg }));
      }

      setState(state => ({
        ...state,
        gameToRedirect: game.name,
      }));

      closeModal();
    });
  };

  const copy = {
    join: {
      title: "What's the game name?",
      description: 'Ask your friend for it!',
    },
    create: {
      title: 'Name your game',
      description: 'Pick a short and sweet name:',
    },
  }[variant];

  if (state.gameToRedirect) {
    return <Redirect to={`/game/${state.gameToRedirect}`} />;
  }

  return (
    <section css={ModalStyles.modal}>
      <div css={ModalStyles.backdrop} onClick={closeModal} role="none"></div>
      <div css={ModalStyles.box}>
        <button css={ModalStyles.btnClose} aria-label="Close Modal" onClick={closeModal}></button>
        <label>
          <h1 css={[ModalStyles.title, Theme.typography.h3]}>{copy.title}</h1>
          <p css={[Theme.typography.secondary, ModalStyles.tip]}>{copy.description}</p>
          <input onChange={handleInputChange} css={ModalStyles.input} autoFocus type="text"></input>
          {state.errorMsg && <p css={ModalStyles.errorMsg}>{state.errorMsg}</p>}
        </label>
        {state.gameName && state.gameName.length >= 3 && (
          <Button hasBlock onClick={handleBtnClick}>
            Let's go!
          </Button>
        )}
      </div>
    </section>
  );
}

ModalaccessGame.defaultProps = {
  /** String - 'join' || 'create' */
  variant: 'join',
};
