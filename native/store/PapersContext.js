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
      isConnected: false,
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
    this._subscribeToGame = this._subscribeToGame.bind(this);

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
    console.log('P_ init()');
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
    console.log('P_ tryToReconnect()');
    let socket = this.state.socket;

    if (socket) {
      console.error('tryToReconnect(): Already connected.');
      return;
    } else {
      const { id, name, gameId } = this.state.profile;
      const response = await serverReconnect({ id, name, gameId });

      if (!response.socket) {
        return;
      }

      this.setState({ socket: response.socket });

      if (response.game) {
        console.log('P_ rejoin game! TODO');
      }
    }
  }

  initAndSign(doAfterSignIn) {
    console.log('P_ initAndSign()');
    const socket = this.init();

    const { name, avatar } = this.state.profile;

    if (!name) {
      console.log(`Missing name! ${name}`);
      return false;
    }

    socket.on('signed', async (topic, id) => {
      console.log('P_ on.signed', id);
      await this.PapersAPI.updateProfile({ id });
      doAfterSignIn();
    });

    socket.signIn({ name, avatar }, (res, error) => {
      if (error) {
        return cb(null, error);
      }
    });
  }

  accessGame(variant, gameName, cb) {
    if (!this.state.socket) {
      console.log('P_ accessGame() - init needed first');

      this.initAndSign((res, error) => {
        if (error) return cb(null, error);
        this.accessGame(variant, gameName, cb);
      });

      return;
    }

    // TODO/OPTMIZE - Verify the profile is updated.

    console.log('P_ accessGame() - accessing...');

    if (!gameName) {
      return cb(null, new Error('Missing game name'));
    }

    if (!variant || ['join', 'create'].indexOf(variant) < 0) {
      return cb(null, new Error(`variant incorrect - ${variant}`));
    }

    // createGame | joinGame
    this.state.socket[`${variant}Game`](gameName, async (gameData, err) => {
      if (err) {
        const errorMsgMap = {
          exists: () => 'Choose other name.',
          notFound: () => 'This game does not exist.',
          alreadyStarted: () => 'The game already started.',
          ups: () => `Ups! Error: ${err.message}`,
        };

        const errorMsg = (errorMsgMap[err.message] || errorMsgMap.ups)();

        console.warn('P_ accessGame() err:', errorMsg);
        return cb(null, errorMsg);
      }

      await this._subscribeToGame(gameData);
      cb();
    });
  }

  async _subscribeToGame(game) {
    console.log('P_ _subscribeToGame', game.id);

    this.setState({ game });

    await this.PapersAPI.updateProfile({ gameId: game.id });
  }

  __accessGame(variant, gameName, cb) {
    let socket = this.state.socket;

    if (!socket) {
      socket = this.PapersAPI.open(gameName);
    }

    console.log('accessGame', variant, gameName);

    if (!gameName) {
      return cb(new Error('Missing gameId'));
    }

    socket.emit(
      `${variant}-game`,
      {
        gameId: gameName,
        player: this.state.profile,
      },
      cb
    );

    socket.on('set-game', game => {
      console.log('on set-game', game.name);
      window.localStorage.setItem('profile_gameId', game.name);

      this.setState(state => ({
        profile: {
          ...state.profile,
          gameId: game.name,
        },
        game,
      }));
    });

    socket.on('kickouted', () => {
      // TODO - global status
      console.log('Global Status: You were quickedout! 😭');
      this._removeGameFromState();
    });

    socket.on('leave-game', () => {
      // TODO - global status
      console.log('on leave-game');
      this._removeGameFromState();
    });

    socket.on('game-update', (actionType, payload) => {
      console.log('game-update:', actionType, { payload });

      // Maybe actionType should be in past?
      // player-added, player-paused, etc...
      const reaction = {
        'new-player': game => {
          const player = payload;
          return {
            ...game,
            players: {
              ...game.players,
              [player.id]: player,
            },
          };
        },
        'pause-player': game => {
          const playerId = payload;

          return {
            ...game,
            players: {
              ...game.players,
              [playerId]: {
                ...game.players[playerId],
                isAfk: true,
              },
            },
          };
        },
        'recover-player': game => {
          const playerId = payload;
          return {
            ...game,
            players: {
              ...game.players,
              [playerId]: {
                ...game.players[playerId],
                isAfk: false,
              },
            },
          };
        },
        'remove-player': game => {
          const { playerId, creatorId } = payload;

          const otherPlayers = Object.keys(game.players).reduce((acc, p) => {
            return p === playerId ? acc : { ...acc, [p]: game.players[p] };
          }, {});

          let newPlayers;

          if (!game.hasStarted) {
            newPlayers = otherPlayers;
          } else {
            newPlayers = {
              ...game.players,
              [playerId]: {
                ...game.players[playerId],
                hasLeft: true,
              },
            };
          }

          return {
            ...game,
            creatorId,
            players: newPlayers,
          };
        },
        'set-words': game => {
          const { words, playerId } = payload;

          return {
            ...game,
            words: {
              ...game.words,
              [playerId]: words,
            },
          };
        },
        'set-words-for-everyone': game => {
          const everyonesWords = payload;

          return {
            ...game,
            words: everyonesWords,
          };
        },
        'set-teams': game => {
          const teams = payload;

          return {
            ...game,
            teams,
          };
        },
        'start-game': game => {
          const { round, hasStarted } = payload;

          return {
            ...game,
            hasStarted,
            round,
          };
        },
        'start-turn': game => {
          const roundStatus = payload;

          return {
            ...game,
            round: {
              ...game.round,
              ...roundStatus,
            },
          };
        },
        'finish-turn': game => {
          window.localStorage.removeItem('turn'); // OPTIMIZE - maybe it shouldnt be here?
          const { round, score } = payload;

          return {
            ...game,
            round,
            score,
          };
        },
        'start-next-round': game => {
          const round = payload;

          return {
            ...game,
            round,
          };
        },
        ups: game => {
          console.log('Ups! game-update', payload);
          return game;
        },
      };

      const updateGame = reaction[actionType] || reaction.ups;

      this.setState(state => ({
        game: updateGame(state.game),
      }));
    });
  }

  // Not needed yet.
  // pausePlayer() {
  //   console.log('pausePlayer');
  //   this.state.socket.emit('pause-player');
  // }

  recoverPlayer() {
    console.log('P_ recoverPlayer');
    const socket = this.state.socket.open();
    socket.emit('recover-player');
  }

  // { id, name, avatar, gameId }
  async updateProfile(profile) {
    console.log('P_ updateProfile()', Object.keys(profile));

    try {
      if (profile.id && typeof profile.id === 'string')
        await AsyncStorage.setItem('profile_id', profile.id);
      if (profile.name && typeof profile.name === 'string')
        await AsyncStorage.setItem('profile_name', profile.name);
      if (profile.avatar && typeof profile.avatar === 'string')
        await AsyncStorage.setItem('profile_avatar', profile.avatar);
      if (profile.gameId && typeof profile.gameId === 'string')
        await AsyncStorage.setItem('profile_gameId', profile.gameId);
    } catch (e) {
      // TODO - report this to an external Error log service
      console.error('PapersContext.js updateProfile error!', e);
    }

    if (this.state.socket) {
      console.log('P_ update to socket');
      this.state.socket.updateProfile(profile);
    } else {
      console.log('P_ not yet connected to socket');
    }

    this.setState(state => ({
      profile: {
        ...state.profile,
        ...profile,
      },
    }));
  }

  async resetProfile(profile) {
    try {
      await AsyncStorage.clear();
      if (this.state.socket) {
        this.state.socket.resetProfile(); // user or profile? hum...
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

  _removeGameFromState() {
    console.log('removing game');
    window.localStorage.removeItem('profile_gameId');
    window.localStorage.removeItem('turn');

    // Leaving room, there is no point in being connected
    this.state.socket && this.state.socket.close();

    this.setState(state => ({
      profile: {
        ...state.profile,
        gameId: null,
      },
      game: null,
      socket: null,
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

  leaveGame(playerId) {
    console.log('leaveGame()');
    this.state.socket.emit(
      'leave-game',
      {
        gameId: this.state.game.name,
        playerId: this.state.profile.id,
      },
      err => {
        if (err) return true;
        this._removeGameFromState();
      }
    );
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
