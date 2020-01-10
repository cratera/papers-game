/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';

import * as Theme from 'Theme.js';
import CoreContext from 'store/CoreContext.js';
import PapersContext from 'store/PapersContext.js';
import Button from 'components/Button';
import Modal from 'components/Modal';
import * as Styles from './AccessGameModalStyles.js';

export default function AccessGameModal({ variant }) {
  const Papers = useContext(PapersContext);
  const { closeModal } = useContext(CoreContext);
  const [isAccessing, setAccessing] = useState(false);
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
    setAccessing(true);
    Papers.accessGame(variant, state.gameName, err => {
      if (err) {
        // TODO - Move this out of here - redux(mapstatetoprops?)/context/wtv...
        const errorMsgMap = {
          exists: () => 'Choose other name.',
          notFound: () => 'This game does not exist.',
          ups: () => `Ups, something went wrong! Error: ${JSON.stringify(err)}`,
        };

        const errorMsg = (errorMsgMap[err] || errorMsgMap.ups)();

        console.warn('accessGame() err:', state.gameName, errorMsg);
        setAccessing(false);
        return setState(state => ({ ...state, errorMsg }));
      }

      closeModal();
    });
  };

  const copy = {
    join: {
      title: "What's the party name?",
      description: 'Ask your friend for it!',
      cta: "Let's go!",
    },
    create: {
      title: 'Give this party a name!',
      description: 'Pick a short and sweet name.',
      cta: 'Next: Add Players',
    },
  }[variant];

  if (state.gameToRedirect) {
    return <Redirect to={`/game/${state.gameToRedirect}`} />;
  }

  return (
    <Modal>
      <Fragment>
        <h1 css={[Styles.title, Theme.typography.h3]}>{copy.title}</h1>
        <label>
          <p css={[Styles.tip, Theme.typography.secondary]}>{copy.description}</p>
          <input onChange={handleInputChange} css={Styles.input} autoFocus type="text"></input>
          {state.errorMsg && <p css={Styles.errorMsg}>{state.errorMsg}</p>}
        </label>
        {state.gameName && state.gameName.length >= 3 && (
          <Button hasBlock onClick={handleBtnClick}>
            {copy.cta}
            {isAccessing && '⏳'}
          </Button>
        )}
      </Fragment>
    </Modal>
  );
}

AccessGameModal.defaultProps = {
  /** String - 'join' || 'create' */
  variant: 'join',
};
