/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, useContext, useState } from 'react';
import compressImg from 'browser-image-compression';
import Page from 'components/Page';
import * as Styles from './HomeStyles.js';
import * as Theme from 'Theme.js';
import Button from 'components/Button';
import PapersContext from 'store/PapersContext.js';
import { encodeImgToBase64 } from 'utils/index.js';

export default function HomeNewPlayer(props) {
  const Papers = useContext(PapersContext);
  const profile = Papers.state.profile;
  const [state, setState] = useState({
    name: profile.name,
    avatar: profile.avatar,
    step: 0,
    avatarStatus: null, // loading || loaded || error?
  });

  const StepWelcome = () => (
    <Fragment>
      <span css={Styles.logo} role="img" aria-label="logo">
        🎲
      </span>
      <h1 css={Theme.typography.h1}>Welcome!</h1>
      <p css={[Styles.paragraph, Theme.typography.secondary]}>
        Papers is the perfect game for your{' '}
        <span
          css={css`
            white-space: nowrap;
          `}
        >
          dinner party
        </span>
        .
        <br />
        Made with love by Maggie and Sandy <span aria-hidden="true">😎</span>
      </p>
    </Fragment>
  );

  const StepName = () => (
    <Fragment>
      <label>
        <span>How should we call you?</span>
        <input
          css={Styles.input}
          type="text"
          autoFocus
          defaultValue={state.name}
          onChange={e => updateTempProfile('name', e)}
        ></input>
      </label>

      {state.name && <Button onClick={goNextStep}>Next</Button>}
    </Fragment>
  );

  const StepAvatar = () => (
    <label>
      <span>Add your avatar</span>
      <input
        type="file"
        className="sr-only"
        accept="image/png, image/jpeg"
        onChange={e => updateTempProfile('avatar', e)}
      />
      {state.avatar ? (
        <img css={Styles.avatarImg} src={state.avatar} alt="Your avatar" />
      ) : (
        <div css={Styles.avatarPlace}>
          {/* prettier-ignore */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Upload or take a picture</span>
        </div>
      )}
      <span>
        {state.avatarStatus === 'loading' && 'Loading...'}
        {state.avatarStatus === 'loaded' && 'Looking good!'}
      </span>
    </label>
  );

  function updateTempProfile(key, event) {
    return {
      name: () => {
        const name = event.target.value;
        setState(state => ({ ...state, name }));
      },
      avatar: async () => {
        const file = event.target.files[0];
        setState(state => ({ ...state, avatarStatus: 'loading' }));

        if (!file) return;

        const compressedFile = await compressImg(file, {
          maxWidthOrHeight: 500,
        });

        encodeImgToBase64(compressedFile, avatar => {
          console.log('Avatar compressed!');
          setState(state => ({ ...state, avatar, avatarStatus: 'loaded' }));
        });
      },
    }[key]();
  }

  function goNextStep() {
    setState(state => ({
      ...state,
      step: state.step + 1,
    }));
  }

  function goBackStep() {
    setState(state => ({
      ...state,
      step: state.step - 1,
    }));
  }

  function setProfile() {
    Papers.updateProfile({
      name: state.name,
      avatar: state.avatar,
    });
  }

  const CurrentStep = {
    0: StepWelcome,
    1: StepName,
    2: StepAvatar,
  }[state.step];

  return (
    <Page>
      <Page.Header>
        {/* {window.navigator && !window.navigator.standalone ? (
          <p css={Theme.typography.small}>
            Open this as an App. Click share and "Add to Homescreen"
          </p>
        ) : null} */}
        {state.step > 0 && (
          <Button variant="flat" onClick={goBackStep}>
            Back
          </Button>
        )}
      </Page.Header>
      <Page.Main css={Styles.main({ centered: state.step === 0 })}>
        <CurrentStep />
      </Page.Main>
      <Page.CTAs>
        {state.step === 0 && <Button onClick={goNextStep}>Next</Button>}
        {state.step === 2 && (
          <Button onClick={setProfile} variant={state.avatar ? 'primary' : 'flat'}>
            {state.avatar ? 'Finish' : 'Skip this step'}
          </Button>
        )}
      </Page.CTAs>
    </Page>
  );
}
