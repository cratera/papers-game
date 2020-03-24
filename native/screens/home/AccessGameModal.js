import React, { Fragment, useState, useContext, useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, View, Text, TextInput } from 'react-native';

import * as Theme from '@theme';
import PapersContext from '@store/PapersContext.js';
import Button from '@components/button';
import Modal from '@components/modal';

import Styles from './AccessGameModalStyles.js';

export default function AccessGameModal({ isOpen, variant, onClose }) {
  const Papers = useContext(PapersContext);
  const [isAccessing, setAccessing] = useState(false);
  const [state, setState] = useState({
    gameName: null,
    // gameToRedirect: null,
    errorMsg: null,
  });
  const copy = {
    join: {
      title: "What's the party name?",
      description: 'Ask your friend for it!',
      cta: "Let's go!",
    },
    create: {
      title: 'Give this party an original name!',
      description: 'Your friends will use it to join the game.',
      cta: 'Next: Add Players',
    },
  }[variant];

  useEffect(() => {
    // Reset state each time the modal is toggled
    setAccessing(false);
    setState({});
  }, [isOpen]);

  // if (state.gameToRedirect) {
  //   alert(`TODO: redirect to game ${state.gameToRedirect}!`);
  //   // return <Redirect to={`/game/${state.gameToRedirect}`} />;
  // }

  return (
    <Modal visible={isOpen} onClose={onClose}>
      {!variant ? (
        // I hope this never happens
        <Button onPress={onClose}>Hum... Weird. Close modal</Button>
      ) : (
        <KeyboardAvoidingView
          behavior={'padding'}
          keyboardShouldPersistTaps="always"
          style={{ flex: 1, alignSelf: 'stretch' }}
        >
          <ScrollView>
            <Text style={[Styles.title, Theme.typography.h3]}>{copy.title}</Text>
            <Text nativeID="inputNameLabel" style={[Styles.tip, Theme.typography.secondary]}>
              {copy.description}
            </Text>

            {/* TODO - detect emojis and ignore them */}
            <TextInput
              style={[Theme.typography.h1, Styles.input]}
              inputAccessoryViewID="name"
              autoFocus
              autoCorrect={false}
              nativeID="inputNameLabel"
              onChangeText={handleInputChange}
            />
            {state.errorMsg && (
              <Text style={[Theme.typography.small, Styles.errorMsg]}>{state.errorMsg}</Text>
            )}
          </ScrollView>
          {state.gameName && state.gameName.length >= 3 ? (
            <Button onPress={handleBtnClick} place="edgeKeyboard" isLoading={isAccessing}>
              {copy.cta}
            </Button>
          ) : (
            undefined
          )}
        </KeyboardAvoidingView>
      )}
    </Modal>
  );

  function handleInputChange(gameName) {
    setState(state => ({
      ...state,
      gameName,
    }));
  }

  function handleBtnClick() {
    if (isAccessing) {
      return;
    }

    setAccessing(true);
    setState(state => ({ ...state, errorMsg: null }));

    Papers.accessGame(variant, state.gameName, (res, err) => {
      if (err) {
        setAccessing(false);
        setState(state => ({ ...state, errorMsg: err }));
      } else {
        // The App Routing will detect the PapersContext state and redirect the page.
        onClose();
      }
    });
  }
}

AccessGameModal.defaultProps = {
  /** required: String - 'join' | 'create' */
  variant: undefined,
};
