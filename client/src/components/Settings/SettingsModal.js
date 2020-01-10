/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useContext } from 'react';
import { typography as Typography } from 'Theme.js';

import PapersContext from 'store/PapersContext.js';

import Button from 'components/Button';
import Modal from 'components/Modal';

const StylesGroup = css``;

const StylesInfo = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
`;

export default function SettingsModal(props) {
  const Papers = useContext(PapersContext);
  const { game } = Papers.state;
  const gameId = game && game.name;

  const handleLeaveGame = () => {
    if (window.confirm('Are you sure you wanna leave the game?')) {
      Papers.leaveGame();
    }
  };

  return (
    <Modal>
      <h1 css={Typography.h2}>Game Settings</h1>
      <br />
      {gameId ? (
        <div css={StylesGroup}>
          <div css={StylesInfo}>
            <h2 css={Typography.h3}>
              <span aria-label="" role="img">
                🔌{' '}
              </span>
              Leave Game
            </h2>
            <Button size="sm" onClick={handleLeaveGame}>
              Leave Game
            </Button>
          </div>
          <p css={Typography.secondary}>
            You'll leave the group. If the game starts meanwhile, you won't be able to join again.
          </p>
        </div>
      ) : (
        <p css={Typography.secondary}>Nothing here for now... come back later...</p>
      )}

      <br />

      <h1 css={Typography.h2}>App Settings</h1>
      <br />
      <div css={StylesGroup}>
        <div css={StylesInfo}>
          <h2 css={Typography.h3}>
            <span aria-label="" role="img">
              ♻️{' '}
            </span>
            Refresh Page
          </h2>
          <Button size="sm" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
        <p css={Typography.secondary}>This will simply refresh the page.</p>
      </div>
      <br />

      <div css={StylesGroup}>
        <div css={StylesInfo}>
          <h2 css={Typography.h3}>
            <span aria-label="" role="img">
              ✨{' '}
            </span>
            Reset Profile
          </h2>
          <Button
            size="sm"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Reset Profile
          </Button>
        </div>
        <p css={Typography.secondary}>
          This will delete your local profile and you'll have a fresh start. If you are in the
          middle of a game, you'll leave the game too.
        </p>
      </div>
    </Modal>
  );
}
