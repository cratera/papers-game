/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import compressImg from 'browser-image-compression';

import * as Styles from './HomeStyles.js';
import * as Theme from 'Theme.js';
import Page from 'components/Page';
import AccessGameModal from './AccessGameModal.js';
import Button from 'components/Button';
import CoreContext from 'store/CoreContext.js';
import PapersContext from 'store/PapersContext.js';
import { encodeImgToBase64 } from 'utils/index.js';

export default function Home(props) {
  const Papers = useContext(PapersContext);
  const { setModal } = useContext(CoreContext);
  const profile = Papers.state.profile;

  const AvatarMeme = () => (
    <div css={Styles.memeContainer}>
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
          <span css={Styles.memeFace} />
        )}
      </label>
      <img css={Styles.memeBody} src="images/dance.gif" aria-hidden="true" alt="" />
    </div>
  );

  function openAccessGameModal(variant) {
    setModal({
      component: AccessGameModal,
      props: {
        variant,
      },
    });
  }

  function updateTempProfile(key, event) {
    return {
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
    <Page>
      <Page.Header></Page.Header>
      <Page.Main css={Styles.main}>
        <AvatarMeme />
        <h1>
          Welcome
          <span css={Theme.typography.h1}>{profile.name}</span>
        </h1>
      </Page.Main>
      <Page.CTAs>
        <Button onClick={() => openAccessGameModal('join')}>Join Game</Button>
        <Button variant="light" onClick={() => openAccessGameModal('create')}>
          Create Game
        </Button>
      </Page.CTAs>
    </Page>
  );
}
