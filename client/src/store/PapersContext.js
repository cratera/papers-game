import React, { Component } from 'react';
import io from 'socket.io-client';
import { createUniqueId } from 'utils/index.js';
import { withRouter, matchPath } from 'react-router';
import wordsForEveryone from './wordsForEveryone.js';

const PapersContext = React.createContext({});

// TODO - split into 2 Contexts: methods (mutations) and state (lookups)
class PapersContextComp extends Component {
  constructor(props) {
    super(props);
    const isDev = process.env.NODE_ENV !== 'production';
    // TIL: 🤯🐛🤬 (AFTER 1 DAY trying to make this work..)
    // - on dev: https://github.com/socketio/socket.io/issues/1942#issuecomment-71443823
    // - on Heroku:  https://github.com/socketio/socket.io-website/issues/139
    // - Heroku still not working: https://stackoverflow.com/questions/59455178/heroku-websockets-issue-getting-connected-clients-always-empty
    this.URL = isDev ? `${window.location.hostname}:5000` : window.location.host;

    this.state = {
      socket: null,
      profile: {
        id: window.localStorage.getItem('profile_id') || null,
        name: window.localStorage.getItem('profile_name') || null,
        avatar: window.localStorage.getItem('profile_avatar') || null,
        // the last game this player tryed to access
        gameId: window.localStorage.getItem('profile_gameId') || null,
      },
      game: undefined,
      /* {
        players: {},
        state: {},
        settings: {},
      } */
    };

    this._removeGameFromState = this._removeGameFromState.bind(this);

    this.PapersAPI = {
      open: this.open.bind(this),

      // pausePlayer: this.pausePlayer.bind(this),
      recoverPlayer: this.recoverPlayer.bind(this),

      updateProfile: this.updateProfile.bind(this),

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
    };
  }

  // Maybe it should be a Route to ask for this,
  // because it might want to retrieve different stuff...
  // ex: on room/:id, i don't care about profile.gameId,
  // instead I want the room/:id
  componentDidMount() {
    const { id, gameId } = this.state.profile;
    const { location } = this.props;
    const GameRoom = matchPath(location.pathname, {
      path: '/game/:id',
    });

    console.log('PapersContext Mounted:', { playedId: id, gameId });

    if (GameRoom) {
      console.log('PapersContext - on a GameRoom');
      // do nothing... GameRoom will do it.
    } else {
      console.log('PapersContext - on Home');
      // somewhere else, handle it!
      // Update: why not at Home.js?? Cant remember...
      if (id && gameId) {
        const socket = this.PapersAPI.open();
        this.PapersAPI.recoverGame(socket);
      }
    }
  }

  // =========== Papers API

  open(passedGameId) {
    let socket = this.state.socket;
    const { id: playerId, gameId: gameIdStored } = this.state.profile;
    const gameId = passedGameId || gameIdStored;

    if (socket) {
      if (socket.connected) {
        console.warn('socket already opened!', playerId);
      } else {
        console.warn('reconnecting socket...', playerId);
        socket.open();
      }
      return socket;
    }
    console.log('creating a socket!', playerId);

    socket = io(this.URL, {
      query: { playerId, gameId },
      // TIL: https://stackoverflow.com/a/57459569/4737729
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('connected!', playerId);
      // Q: Maybe all socket.on() should be added here ?
    });

    this.setState({ socket });

    return socket;
  }

  accessGame(variant, gameName, cb) {
    let socket = this.state.socket;

    if (!socket) {
      socket = this.PapersAPI.open(gameName);
    }

    // This can happen when the user left the chat.
    // Maybe
    // if(!socket.opened) {
    //   socket.open();
    //   socket.on('reopen', () => {
    //     accessGame(variant, gameName, cb)
    //   });
    // }

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
        // 'finishes-turn': game => {
        //   const roundStatus = payload;

        //   return {
        //     ...game,
        //     round: {
        //       ...game.round,
        //       ...roundStatus,
        //     },
        //   };
        // },
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
    console.log('recoverPlayer');
    const socket = this.state.socket.open();
    socket.emit('recover-player');
  }

  updateProfile(profile) {
    const id = profile.id || createUniqueId(`player_${profile.name}`);

    window.localStorage.setItem('profile_id', id);
    window.localStorage.setItem('profile_name', profile.name);

    if (profile.avatar) {
      // its optional
      window.localStorage.setItem('profile_avatar', profile.avatar);
    }

    this.setState(state => ({
      profile: {
        ...state.profile,
        ...profile,
        id,
      },
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
    this.state.socket.emit('set-teams', {
      gameId: this.state.game.name,
      playerId: this.state.profile.id,
      teams,
    });
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

  finishTurn(wordsGuessed) {
    this.state.socket.emit('start-turn', {
      gameId: this.state.game.name,
      playerId: this.state.profile.id,
      wordsGuessed,
    });
  }

  _removeGameFromState() {
    console.log('removing game');
    window.localStorage.removeItem('profile_gameId');

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

export const PapersContextProvider = withRouter(PapersContextComp);

export default PapersContext;
