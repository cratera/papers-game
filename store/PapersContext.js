import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';

import { createUniqueId } from '@constants/utils.js';
import wordsForEveryone from './wordsForEveryone.js';

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
        // Our profile
        id: props.initialProfile.id,
        name: props.initialProfile.name,
        avatar: props.initialProfile.avatar,
        // the last game this player tried to access
        gameId: props.initialProfile.gameId,
      },
      game: null, // see Firebase.js to see structure.
      profiles: {}, // List of game players' profiles.
    };

    this._removeGameFromState = this._removeGameFromState.bind(this);
    this._subscribeGame = this._subscribeGame.bind(this);

    this.PapersAPI = {
      open: this.open.bind(this),

      // pausePlayer: this.pausePlayer.bind(this),
      // recoverPlayer: this.recoverPlayer.bind(this),

      updateProfile: this.updateProfile.bind(this),
      resetProfile: this.resetProfile.bind(this),

      accessGame: this.accessGame.bind(this),
      recoverGame: this.recoverGame.bind(this),
      leaveGame: this.leaveGame.bind(this),
      removePlayer: this.removePlayer.bind(this),

      setTeams: this.setTeams.bind(this),
      setWords: this.setWords.bind(this),
      setWordsForEveyone: this.setWordsForEveyone.bind(this),

      startGame: this.startGame.bind(this),
      startTurn: this.startTurn.bind(this),
      getNextTurn: this.getNextTurn.bind(this),
      finishTurn: this.finishTurn.bind(this),

      getTurnLocalState: this.getTurnLocalState.bind(this),
      setTurnLocalState: this.setTurnLocalState.bind(this),

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

  render() {
    return (
      <PapersContext.Provider
        value={{
          status: this.state.status,
          state: {
            status: this.state.status,
            profile: this.state.profile,
            game: this.state.game,
            profiles: this.state.profiles,
          },
          ...this.PapersAPI,
        }}
      >
        {this.props.children}
      </PapersContext.Provider>
    );
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
    const socket = this.state.socket;

    if (socket) {
      console.error(':: Already connected. Should not happen!');
    } else {
      const { id, name, gameId } = this.state.profile;

      if (!gameId) {
        console.log(':: no gameId');
        return;
      }

      this.setState({
        status: 'isJoining',
      });

      // TODO - Add Global Status accessing game.

      const hum = await this.accessGame('join', gameId, () => {
        console.log(`Joined to ${gameId} completed!`);
        this.setState({ status: 'inGame' });
      });

      console.log('joined log', hum);
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

    socket.on('profile.signed', async (topic, id) => {
      console.log('📌 on.profile.signed', id);
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

    const setGame = cb => {
      this.setState(state => {
        if (!state.game) return {};
        return {
          game: {
            ...state.game,
            ...cb(state.game),
          },
        };
      });
    };

    socket.on('game.set', (topic, data) => {
      console.log(`:: on.${topic}`);
      const { game, profiles } = data;
      this.setState({ game, profiles });
    });

    // Players Subscription
    socket.on('game.players.added', (topic, data) => {
      console.log(`:: on.${topic}`, data);
      const { id, info, profile } = data;

      setGame(game => ({
        players: {
          ...game.players,
          [id]: info,
        },
      }));

      this.setState(state => ({
        profiles: {
          ...state.profiles,
          [id]: profile,
        },
      }));
    });

    socket.on('game.players.removed', async (topic, data) => {
      console.log(`:: on.${topic}`, data);
      const { id: playerId, newAdmin } = data;

      if (playerId === this.state.profile.id) {
        console.log(':: we are the player being removed! A.k.a we were quicked out');
        await this.leaveGame();
        return;
      }

      setGame(game => {
        const otherPlayers = Object.keys(game.players).reduce((acc, p) => {
          return p === playerId ? acc : { ...acc, [p]: game.players[p] };
        }, {});

        return {
          // admin: newAdmin // TODO
          players: otherPlayers,
        };
      });
    });

    socket.on('game.players.changed', (topic, data) => {
      console.log(`:: on.${topic}`, data);
      const { id, info } = data;

      setGame(game => ({
        players: {
          ...game.players,
          [id]: {
            ...(game.players[id] || {}),
            ...info,
          },
        },
      }));
    });

    // Teams subscription
    socket.on('game.teams.set', (topic, data) => {
      console.log(`:: on.${topic}`, data);
      const teams = data;

      setGame(game => ({
        teams,
      }));
    });

    // Words subscription
    socket.on('game.words.set', (topic, data) => {
      console.log(`:: on.${topic}`, data);
      const { pId, words } = data;

      setGame(game => ({
        words: {
          ...game.words,
          [pId]: words,
        },
      }));
    });

    // Sub to game starting
    socket.on('game.hasStarted', (topic, data) => {
      console.log(`:: on.${topic}`, data);
      const hasStarted = data;

      setGame(game => ({
        hasStarted,
      }));
    });

    // Sub to round status - OPTIMIZE!!
    socket.on('game.round', (topic, data) => {
      console.log(`:: on.${topic}`);
      const round = data;

      setGame(game => ({
        round,
      }));
    });

    // Sub to score status - OPTIMIZE!!
    socket.on('game.score', (topic, data) => {
      console.log(`:: on.${topic}`);
      const score = data;

      setGame(game => ({
        score,
      }));
    });

    socket.on('game.leave', topic => {
      console.log(`:: on.${topic}`);
      this._removeGameFromState();
    });
  }

  // Not needed yet.
  // pausePlayer() {
  //   console.log('pausePlayer');
  //   this.state.socket.emit('pause-player');
  // }

  // recoverPlayer() {
  //   console.log('📌 recoverPlayer');
  //   const socket = this.state.socket.open();
  //   socket.emit('recover-player');
  // }

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

    const { id, gameId, ...serverProfile } = profile;

    if (Object.keys(serverProfile).length > 0) {
      if (this.state.socket) {
        console.log(':: update socket too.');
        this.state.socket.updateProfile(serverProfile);
      } else {
        console.log(':: not connected to socket');
      }
    }

    this.setState(state => ({
      profile: {
        ...state.profile,
        ...profile,
      },
    }));
  }

  async resetProfile(profile) {
    console.log('📌 resetProfile()');
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

  async setWords(words, cb) {
    console.log('📌 setWords()');
    await this.state.socket.setWords(words, cb);
    cb();
  }

  async setWordsForEveyone(cb) {
    console.log('📌 setWordsForEveyone()');
    const allWords = Object.keys(this.state.game.players).reduce((acc, playerId, i) => {
      return { ...acc, [playerId]: wordsForEveryone[i] };
    }, {});

    await this.state.socket.setWordsForEveryone(allWords);

    cb();
  }

  setTeams(teams) {
    this.state.socket.setTeams(teams, (res, e) => console.warn('TODO HANDLE ERROR', e));
  }

  startGame() {
    console.log('📌 startGame()');
    const words = this.state.game.words;
    this.state.socket.startGame(words);
  }

  startTurn() {
    console.log('📌 startTurn()');
    this.state.socket.startTurn();
  }

  getNextTurn() {
    const { teams, round } = this.state.game;
    const { 0: teamIndex, 1: playerIndex } = round.turnWho;
    const totalTeams = Object.keys(teams).length;

    // BUG / TODO - Handle correctly when teams are not even! [1]
    if (teamIndex < totalTeams - 1) {
      const nextTeamIndex = teamIndex + 1;
      const totalTeamPlayers = teams[nextTeamIndex].players.length;

      if (playerIndex < totalTeamPlayers) {
        return { 0: nextTeamIndex, 1: playerIndex };
      } else {
        return { 0: nextTeamIndex, 1: playerIndex, 2: true }; // [1]
      }
    } else {
      const totalTeamPlayers = teams[0].players.length;
      const nextPlayer = playerIndex + 1;

      if (nextPlayer < totalTeamPlayers) {
        return { 0: 0, 1: nextPlayer };
      } else {
        return { 0: 0, 1: 0 };
      }
    }

    // if (player < totalPlayers) {
    //   return [team, player + 1];
    // } else {
    //   if (team < totalTeams) {
    //     return [team + 1, 0];
    //   } else {
    //     return [0, 0];
    //   }
    // }
  }

  finishTurn(papersTurn) {
    console.log('📌 finishTurn()');
    const game = this.state.game;
    const profileId = this.state.profile.id;
    const { round, teams, score } = game;

    const roundCurrent = round.current;
    const current = papersTurn.current ? [papersTurn.current] : [];
    const wordsLeft = [...papersTurn.wordsLeft, ...papersTurn.passed, ...current];
    const roundStatus =
      wordsLeft.length > 0
        ? {
            current: roundCurrent,
            turnWho: this.getNextTurn(),
            turnCount: round.turnCount + 1,
            status: 'getReady',
            wordsLeft,
          }
        : {
            current: roundCurrent,
            status: 'finished',
            wordsLeft: [],
          };

    if (!game.score) {
      game.score = [];
    }

    if (!game.score[roundCurrent]) {
      game.score[roundCurrent] = {};
    }

    const wordsSoFar = game.score[roundCurrent][profileId] || [];

    this.state.socket.finishTurn({
      playerScore: {
        [profileId]: [...wordsSoFar, ...papersTurn.guessed],
      },
      roundStatus,
    });
  }

  startNextRound() {
    console.log('📌 startNextRound()');
    const game = this.state.game;

    this.state.socket.startNextRound({
      round: game.round,
      teams: game.teams,
      words: game.words,
    });
  }

  async getTurnLocalState() {
    console.log('📌 getPaperTurnState()');
    const storedTurn = await AsyncStorage.getItem('turn');
    const turnState = JSON.parse(storedTurn) || {
      current: null, // String - current paper on the screen
      passed: [], // [String] - papers passed
      guessed: [], // [String] - papers guessed
      wordsLeft: this.state.game.round.wordsLeft, // [String] - words left
    };
    return turnState;
  }

  async setTurnLocalState(state) {
    console.log('📌 setPaperTurnState()');
    // TODO / OPTIMIZE this very much needed.
    await AsyncStorage.setItem('turn', JSON.stringify(state));
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
    } catch (err) {
      console.error(':: error!', err);
      this._removeGameFromState();
    }
  }

  async removePlayer(playerId) {
    console.log('📌 removePlayer()');
    await this.state.socket.removePlayer(playerId);
    // eventually pub on 'players.removed' will be called
    return true;
  }
}

export default PapersContext;

// export const PapersContextProvider = withRouter(PapersContextComp);

// export default PapersContext;
