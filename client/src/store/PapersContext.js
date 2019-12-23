import React, { Component } from 'react';
import io from 'socket.io-client';
import { createUniqueId } from 'utils/index.js';

const PapersContext = React.createContext({});

// TODO - split into 2 Contexts: methods (mutations) and state (lookups)
export class PapersContextProvider extends Component {
  constructor(props) {
    super(props);
    const isDev = process.env.NODE_ENV !== 'production';
    // TIL: 🤯🐛🤬 (AFTER 1 DAY trying to make this work..)
    // on dev: https://github.com/socketio/socket.io/issues/1942#issuecomment-71443823
    // and on Heroku: https://github.com/socketio/socket.io-website/issues/139
    this.URL = isDev ? `${window.location.hostname}:5000` : window.location.host;

    this.state = {
      socket: null,
      status: 'LOADING', // LOADING || READY || ???
      profile: {
        id: window.localStorage.getItem('profile_id') || null,
        name: window.localStorage.getItem('profile_name') || null,
        avatar: window.localStorage.getItem('profile_avatar') || null,
        // the current game this player belongs to
        gameId: window.localStorage.getItem('profile_gameId') || null,
      },
      game: undefined,
      /* {
        players: {},
        state: {},
        settings: {},
      } */
    };

    this.PapersAPI = {
      open: this.open.bind(this),
      close: this.close.bind(this),

      pausePlayer: this.pausePlayer.bind(this),
      recoverPlayer: this.recoverPlayer.bind(this),

      updateProfile: this.updateProfile.bind(this),

      accessGame: this.accessGame.bind(this),
      recoverGame: this.recoverGame.bind(this),
    };
  }

  // Maybe it should be a Route to ask for this,
  // because it might want to retrieve different stuff...
  // ex: on room/:id, i don't care about profile.gameId,
  // instead I want the room/:id
  componentDidMount() {
    const { id, gameId } = this.state.profile;

    console.log('Player status:', { id, gameId });

    // Q: How I do this with useEffect?
    if (id && gameId) {
      const socket = this.PapersAPI.open();
      this.PapersAPI.recoverGame(socket);
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

  close() {
    console.log('TODO Papers.close...');
    // this.state.socket.open();
    // this.state.socket.emit('close');

    // const game = this.state.game;
    // const playerId = this.state.profile.id;

    // this.setState({
    //   ...game,
    //   players: {
    //     ...game.players,
    //     [playerId]: {
    //       ...game.players[playerId],
    //       isAfk: true,
    //     },
    //   },
    // });
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

    socket.emit(
      `${variant}-game`,
      {
        gameId: gameName,
        player: this.state.profile,
      },
      cb
    );

    socket.on('set-game', game => {
      console.log('set-game:', game.name);
      window.localStorage.setItem('profile_gameId', game.name);

      this.setState(state => ({
        profile: {
          ...state.profile,
          gameId: game.name,
        },
        game,
      }));
    });

    socket.on('game-update', (actionType, payload) => {
      console.log('game-update:', actionType);
      const game = this.state.game;
      const reaction = {
        'new-player': () => {
          const player = payload;
          return {
            ...game,
            players: {
              ...game.players,
              [player.id]: player,
            },
          };
        },
        'pause-player': () => {
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
        'recover-player': () => {
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
        ups: () => {
          console.log('Ups! game-update', payload);
          return game;
        },
      };

      const newGame = reaction[actionType] ? reaction[actionType]() : reaction.ups();

      this.setState({ game: newGame });
    });
  }

  pausePlayer() {
    console.log('pausePlayer');
    this.state.socket.emit('pause-player');
  }

  recoverPlayer() {
    this.state.socket.open();
    this.state.socket.emit('recover-player');
  }

  updateProfile(profile) {
    const id = profile.id || createUniqueId(profile.name);
    window.localStorage.setItem('profile_name', profile.name);
    window.localStorage.setItem('profile_avatar', profile.avatar);
    window.localStorage.setItem('profile_id', id);

    this.setState(state => ({
      profile: {
        ...state.profile,
        ...profile,
        id,
      },
    }));
  }

  recoverGame(socket = this.state.socket) {
    console.log('recovering game...');
    socket.emit('recover-game', (err, result) => {
      if (err) {
        window.localStorage.removeItem('profile_gameId');

        this.setState(state => ({
          status: 'READY',
          profile: {
            ...state.profile,
            gameId: null,
          },
          game: null,
        }));

        const errorMsgMap = {
          notFound: 'recover-game: Does not exist',
          dontBelong: 'recover-game: You dont belong to:',
          empty: 'recover-game: No games stored',
          ups: `recover-game: Ups!', ${JSON.stringify(err)}`,
        };

        console.warn(errorMsgMap[err] || errorMsgMap.ups);
        return;
      }

      console.log('recover-game success:', result.game.name);

      this.setState({
        status: 'READY',
        game: result.game,
      });
    });
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
