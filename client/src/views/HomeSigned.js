/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import compressImg from 'browser-image-compression';

import * as Styles from './HomeStyles.js';
import * as Theme from 'Theme.js';
import Button from 'components/Button.js';
import CoreContext from 'store/CoreContext.js';
import PapersContext from 'store/PapersContext.js';
import { encodeImgToBase64 } from 'utils/index.js';
import ModalAccessGame from 'views/ModalAccessGame.js';

export default function Home(props) {
  const Papers = useContext(PapersContext);
  const { setModal } = useContext(CoreContext);
  const profile = Papers.state.profile;

  const AvatarMeme = () => (
    <div css={Styles.memeContainer} aria-hidden="true">
      <label>
        <span className="sr-only">Edit your avatar</span>
        <input
          type="file"
          className="sr-only"
          accept="image/png, image/jpeg"
          onChange={e => updateTempProfile('avatar', e)}
        />
        {profile.avatar ? (
          <img css={Styles.memeFace} src={profile.avatar} alt="avatar preview"></img>
        ) : (
          <div css={Styles.memeFace} />
        )}
      </label>
      {/* prettier-ignore */}
      <svg css={Styles.memeBody} version='1.0' xmlns='http://www.w3.org/2000/svg' width='458.667' height='518.667' viewBox='0 0 344 389'>
          <path d='M163.5 31.8c-5.2 2.5-11.9 9.4-15.3 15.7-2.5 4.7-2.7 5.8-2.7 18 0 10.7.4 14.5 2.4 21.5 1.3 4.7 2.8 8.9 3.3 9.4.4.6.8 1.7.8 2.5.1.9.9 3.4 2 5.6 1.1 2.2 1.9 4.3 2 4.7 0 1.1 5.3 12.2 6 12.8 1.1.8 2 15.2 1.2 18.9-.6 2.9-1.7 3.9-6.7 6.6-7 3.7-13.4 10.7-22.1 24.5-7.2 11.3-10.7 18.8-13.8 29.5-4.4 15.1-10 32.4-11.7 36-1 2.2-3.7 9.2-6 15.5-4.1 11.1-4.2 11.9-4 22.5.2 16.4 1.8 19.5 9.5 19.5 3.1 0 3.8-.5 5.6-4 1.3-2.6 2-5.9 2-9.9 0-5.1-.5-6.6-3.6-11.2-4.3-6.5-4.4-5.8 5.2-29.4 1.8-4.4 4.2-11.4 5.4-15.5 1.2-4.1 2.7-9.3 3.5-11.5.8-2.2 2.6-8 4-12.9 4.9-16.1 23.3-44 30.3-45.8 2.2-.6 2.2-.5 2.3 16 0 16.7.4 21.5 3.3 43.2 1.5 11.5 5.4 28.2 10.2 43.8 1.8 5.5 2.4 9.4 2 11.6-.7 3.5-8.2 15.1-14.4 22.1-6.1 6.9-21.5 32.2-27.2 44.5-2.9 6.3-5.7 12.1-6.2 12.7-.6.7-3.1 1.3-5.7 1.3-4.4 0-21.9 5.8-24.8 8.2-.7.6-1.3 2-1.3 3.2 0 4.4 4.1 5.8 9 3.3 5.2-2.7 14.7-5.5 20.5-6.2 8.6-.9 9.2-1.2 10.8-5.3 1.5-3.8 8-18.1 9.8-21.7.5-1.1 3.4-5.8 6.4-10.5 3-4.7 6.8-10.8 8.4-13.5 1.6-2.8 5.3-7.7 8.1-11s6.8-8.6 8.8-11.7c2-3.2 3.9-5.8 4.2-5.8 1.4 0 6.1 19.1 8 32.5.5 3.8 1.6 9.7 2.4 13 .8 3.3 2.2 11.2 3.1 17.5 2.2 14.8 2.6 15.6 8.5 16.9 6.7 1.4 15.3 4.8 17.6 6.9 7.9 7.1 15.6 9.1 16.2 4.3.3-1.9-.9-3.7-5.2-7.7-3-2.9-7.3-5.8-9.3-6.4-2.1-.7-4.2-1.6-4.8-2-.5-.4-3.6-1.5-6.7-2.4-5.2-1.5-5.8-1.9-6.3-4.9-.3-1.7-1.2-6.8-2-11.2-6.8-39.9-10.1-53.7-15.3-64.6-1.7-3.5-4.2-10.5-5.7-15.4-1.4-5-3-10.1-3.5-11.5-.5-1.4-1.2-4.3-1.6-6.5-.4-2.2-1-4.5-1.4-5-.9-1.2-4.6-23.6-6-36.7-.5-5.4-1-17.7-1-27.5v-17.8l11.8-2.9c25.3-6.2 42.8-13.2 48.3-19.4 3.6-4 9.5-12.6 11.9-17.2.7-1.4 1.6-2.7 2-3 .4-.3 1.9-2.8 3.5-5.5 1.6-2.8 3.3-5.6 3.9-6.4.6-.7 3.6-7 6.7-13.9l5.6-12.6 5.1.3c4.6.2 5.5-.1 8.2-2.7 2.5-2.5 3-3.9 3-7.6 0-3.6-.5-5-2.7-7.1-1.5-1.4-3.6-2.5-4.6-2.5-1.4 0-1.7-.5-1.3-1.7 1.5-3.9 1.8-10.3.6-11.8-1.8-2.1-5.3-1.9-7.4.6-3.1 3.7-6.5 12-7.1 17.8-.8 7.1-3 14.1-6.5 21.1-1.5 3-4 8.3-5.6 11.7-1.6 3.5-3.2 6.3-3.6 6.3-.5 0-.8.5-.8 1 0 1-4.8 8.9-6.1 10-.3.3-2 3.1-3.8 6.2-4.2 7.6-11.7 15-16.6 16.6-2.2.7-4.9 1.7-6 2.2-6.4 2.6-22.9 8.1-28 9.4-3.3.8-7 1.8-8.2 2.2-2.2.6-2.3.5-2.3-7.1 0-4.7.5-8.1 1.3-9 .6-.7 3.5-3.7 6.3-6.6 21.8-23.1 31.2-49.1 24.3-67.3-2.4-6.5-9.3-14.1-16.3-18.1-6.5-3.7-18.2-4.5-24.1-1.7zm18 9.1c5.4 2.4 10.8 7.6 13.5 12.9 2 3.8 2.2 5.4 1.7 13-.6 10.7-3.3 17.8-11 29.5-4.5 6.8-15.4 19.7-16.6 19.7-.5 0-1.6-1.7-2.6-3.8-.9-2-2-4.6-2.5-5.7-4.9-10.8-9.1-27.6-9.7-39-.5-8.7-.3-10.6 1.5-14.5 2-4.4 9.2-12.2 12.2-13.3 3.2-1.1 9.7-.6 13.5 1.2z' />
        </svg>
    </div>
  );

  function openModalAccessGame(variant) {
    setModal({
      component: ModalAccessGame,
      props: {
        variant,
      },
    });
  }

  // TODO - Create a hook for profile?
  function updateTempProfile(key, event) {
    return {
      // name: () => {
      //   const name = event.target.value;
      //   setState(state => ({ ...state, name }));
      // },
      avatar: async () => {
        const file = event.target.files[0];

        if (!file) return;

        const compressedFile = await compressImg(file, {
          maxWidthOrHeight: 500,
        });

        encodeImgToBase64(compressedFile, avatar => {
          console.log('Avatar compressed!');
          Papers.updateProfile({ name: profile.name, avatar });
        });
      },
    }[key]();
  }

  return (
    <div css={Styles.container}>
      <div css={Styles.body}>
        <div css={Styles.step}>
          <AvatarMeme />
          <h1>
            Welcome
            <span css={Theme.typography.h1}>{profile.name}</span>
          </h1>
        </div>
      </div>
      <div css={Styles.ctas}>
        <Button hasBlock onClick={() => openModalAccessGame('join')}>
          Join Game
        </Button>
        <Button hasBlock variant="light" onClick={() => openModalAccessGame('create')}>
          Create Game
        </Button>
      </div>
    </div>
  );
}
