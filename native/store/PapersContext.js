import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';

import { createUniqueId } from '@constants/utils.js';
// import wordsForEveryone from './wordsForEveryone.js';

// OPTIMIZE - Pass this as prop, so it's agnostic to any type of server / API.
import serverInit, { serverReconnect } from './Firebase.js';

const PapersContext = React.createContext({});

export const loadProfile = async () => {
  const id = (await AsyncStorage.getItem('profile_id')) || null;
  const name = (await AsyncStorage.getItem('profile_name')) || null;
  const avatar = (await AsyncStorage.getItem('profile_avatar')) || null;
  const gameId = (await AsyncStorage.getItem('profile_gameId')) || null;

  return { id, name, avatar, gameId };
};

export class PapersContextProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: null, // rename to serverAPI?
      profile: {
        id: props.initialProfile.id,
        name: props.initialProfile.name,
        avatar: props.initialProfile.avatar,
        // the last game this player tried to access
        gameId: props.initialProfile.gameId,
      },
      game: undefined,
      /* {
        players: {},
        state: {},
        settings: {},
      } */
    };

    this._removeGameFromState = this._removeGameFromState.bind(this);
    this._subscribeGame = this._subscribeGame.bind(this);

    this.PapersAPI = {
      open: this.open.bind(this),

      // pausePlayer: this.pausePlayer.bind(this),
      recoverPlayer: this.recoverPlayer.bind(this),

      updateProfile: this.updateProfile.bind(this),
      resetProfile: this.resetProfile.bind(this),

      accessGame: this.accessGame.bind(this),
      recoverGame: this.recoverGame.bind(this),
      leaveGame: this.leaveGame.bind(this),
      kickoutOfGame: this.kickoutOfGame.bind(this),

      setTeams: this.setTeams.bind(this),
      setWords: this.setWords.bind(this),
      setWordsForEveyone: this.setWordsForEveyone.bind(this),

      startGame: this.startGame.bind(this),
      startTurn: this.startTurn.bind(this),
      finishTurn: this.finishTurn.bind(this),

      startNextRound: this.startNextRound.bind(this),
    };
  }

  // Maybe it should be a Route to ask for this,
  // because it might want to retrieve different stuff...
  // ex: on room/:id, i don't care about profile.gameId,
  // instead I want the room/:id
  async componentDidMount() {
    const { id, name, gameId } = this.state.profile;
    console.log('PapersContext Mounted:', { name, gameId, id });
    await this.tryToReconnect();
  }

  // =========== Papers API

  open() {
    // Legacy...
  }

  init() {
    console.log('📌 init()');
    let socket = this.state.socket;

    if (socket) {
      console.error('init(): Already connected.');
    } else {
      socket = serverInit();
      this.setState({ socket });
    }

    return socket;
  }

  async tryToReconnect() {
    console.log('📌tryToReconnect()');
    let socket = this.state.socket;

    if (socket) {
      console.error(':: Already connected. Should not happen!');
      return;
    } else {
      const { id, name, gameId } = this.state.profile;

      if (!gameId) {
        console.log(':: no gameId');
        return;
      }

      this.accessGame('join', gameId, () => {
        console.log(`Joined to ${gameId} completed!`);
      });
    }
  }

  initAndSign(doAfterSignIn) {
    console.log('📌 initAndSign()');
    const socket = this.init();

    const { name, avatar } = this.state.profile;

    if (!name) {
      console.log(`Missing name! ${name}`);
      return false;
    }

    socket.on('signed', async (topic, id) => {
      console.log('📌 on.signed', id);
      await this.PapersAPI.updateProfile({ id });
      doAfterSignIn();
    });

    socket.signIn({ name, avatar }, (res, error) => {
      if (error) {
        return cb(null, error);
      }
    });
  }

  async accessGame(variant, gameName, cb) {
    if (!this.state.socket) {
      console.log('📌 accessGame() - init needed first');

      this.initAndSign((res, error) => {
        if (error) return cb(null, error);
        this.accessGame(variant, gameName, cb);
      });

      return;
    }

    // TODO/OPTMIZE - Verify the profile is updated.

    console.log('📌 accessGame()', variant, gameName);

    if (!gameName) {
      return cb(null, new Error('Missing game name'));
    }

    if (!variant || ['join', 'create'].indexOf(variant) < 0) {
      return cb(null, new Error(`variant incorrect - ${variant}`));
    }

    // createGame | joinGame
    try {
      const gameId = await this.state.socket[`${variant}Game`](gameName);
      this._subscribeGame(gameId);
      this.PapersAPI.updateProfile({ gameId });
      cb(gameId);
    } catch (e) {
      const errorMsgMap = {
        exists: () => 'Choose other name.',
        notFound: () => 'This game does not exist.',
        alreadyStarted: () => 'The game already started.',
        ups: () => `Ups! Error: ${e.message}`,
      };

      const errorMsg = (errorMsgMap[e.message] || errorMsgMap.ups)();
      console.warn(':: accessGame error!:', errorMsg);
      return cb(null, errorMsg);
    }
  }

  _subscribeGame(gameId) {
    console.log('📌 _subscribeGame', gameId);

    const socket = this.state.socket;

    socket.on('set-game', (topic, data) => {
      console.log(':: on.set-game');
      this.setState({ game: data.val() });
    });

    socket.on('leave-game', (topic, data) => {
      console.log(':: on.leave-game');
      this._removeGameFromState();
    });
  }

  // Not needed yet.
  // pausePlayer() {
  //   console.log('pausePlayer');
  //   this.state.socket.emit('pause-player');
  // }

  recoverPlayer() {
    console.log('📌 recoverPlayer');
    const socket = this.state.socket.open();
    socket.emit('recover-player');
  }

  // { id, name, avatar, gameId }
  async updateProfile(profile) {
    console.log('📌 updateProfile()', profile);
    const mapKeys = {
      id: 'profile_id',
      name: 'profile_name',
      avatar: 'profile_avatar',
      gameId: 'profile_gameId',
    };

    try {
      for (const key in profile) {
        if (typeof profile[key] === 'string') {
          await AsyncStorage.setItem(mapKeys[key], profile[key]);
        } else {
          await AsyncStorage.removeItem(mapKeys[key]);
        }
      }
    } catch (e) {
      // TODO - report this to an external Error log service
      console.error(':: error!', e);
    }

    if (this.state.socket) {
      console.log(':: update to socket too.');
      this.state.socket.updateProfile(profile);
    } else {
      console.log(':: not connected to socket yet.');
    }

    this.setState(state => ({
      profile: {
        ...state.profile,
        ...profile,
      },
    }));

    return;
  }

  async resetProfile(profile) {
    try {
      await AsyncStorage.removeItem('id');
      await AsyncStorage.removeItem('name');
      await AsyncStorage.removeItem('avatar');
      await AsyncStorage.removeItem('groupId');

      if (this.state.socket) {
        this.state.socket.resetProfile();
      }
    } catch (e) {
      console.error('PapersContext.js resetProfile error!', e);
    }

    this.setState(state => ({
      profile: {},
    }));
  }

  setWordsForEveyone() {
    console.log('setWordsForEveyone()');
    const allWords = Object.keys(this.state.game.players).reduce((acc, playerId, i) => {
      return { ...acc, [playerId]: wordsForEveryone[i] };
    }, {});

    this.state.socket.emit('set-words-for-everyone', {
      gameId: this.state.game.name,
      playerId: this.state.profile.id,
      allWords,
    });
  }

  setWords(words, cb) {
    console.log('setWords()');
    this.state.socket.emit(
      'set-words',
      {
        gameId: this.state.game.name,
        playerId: this.state.profile.id,
        words,
      },
      cb
    );
  }

  setTeams(teams) {
    console.log('setTeams()');
    this.state.socket.emit(
      'set-teams',
      {
        gameId: this.state.game.name,
        playerId: this.state.profile.id,
        teams,
      },
      e => console.warn('TODO HANDLE ERROR', e)
    );
  }

  startGame() {
    console.log('startGame()');
    this.state.socket.emit('start-game', {
      gameId: this.state.game.name,
      playerId: this.state.profile.id,
    });
  }

  startTurn() {
    console.log('startTurn()');
    this.state.socket.emit('start-turn', {
      gameId: this.state.game.name,
      playerId: this.state.profile.id,
    });
  }

  finishTurn(papersTurn) {
    console.log('finishTurn()');
    this.state.socket.emit('finish-turn', {
      gameId: this.state.game.name,
      playerId: this.state.profile.id,
      papersTurn,
    });
  }

  startNextRound() {
    console.log('startNextRound()');
    this.state.socket.emit('start-next-round', {
      gameId: this.state.game.name,
      playerId: this.state.profile.id,
    });
  }

  async _removeGameFromState() {
    console.log('📌 _removeGameFromState()');

    await this.PapersAPI.updateProfile({ gameId: null });
    // window.localStorage.removeItem('turn'); // TODO / REVIEW

    // Leaving room, there is no point in being connected
    // this.state.socket && this.state.socket.close();

    this.setState(state => ({
      game: null,
    }));
  }

  recoverGame(socket = this.state.socket) {
    socket.emit('recover-game', (err, result) => {
      if (err) {
        this._removeGameFromState();

        const errorMsgMap = {
          notFound: 'recover-game: Does not exist',
          // dontBelong: 'recover-game: You dont belong to:',
          empty: 'recover-game: No games stored',
          ups: `recover-game: Ups!', ${JSON.stringify(err)}`,
        };

        console.warn(errorMsgMap[err] || errorMsgMap.ups);
        return;
      }

      console.log('recover-game success:', result.game.name);

      this.setState({
        game: result.game,
      });
    });
  }

  async leaveGame(playerId) {
    console.log('📌 leaveGame()');

    try {
      await this.state.socket.leaveGame();
      // this._removeGameFromState();
    } catch (err) {
      console.warn('error!', err);
    }
  }

  kickoutOfGame(playerId) {
    this.state.socket.emit(
      'kickout-of-game',
      {
        gameId: this.state.game.name,
        playerId,
      },
      err => {
        if (err) return true;
      }
    );
  }

  render() {
    return (
      <PapersContext.Provider
        value={{
          status: this.state.status,
          state: {
            profile: this.state.profile,
            game: this.state.game,
          },
          ...this.PapersAPI,
        }}
      >
        {this.props.children}
      </PapersContext.Provider>
    );
  }
}

export default PapersContext;

// export const PapersContextProvider = withRouter(PapersContextComp);

// export default PapersContext;
