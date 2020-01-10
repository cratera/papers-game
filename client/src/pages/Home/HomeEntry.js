/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import { Redirect } from 'react-router-dom';

import PapersContext from 'store/PapersContext.js';

import HomeNewPlayer from './HomeNewPlayer.js';
import HomeSigned from './HomeSigned.js';

export default function HomeEntry(props) {
  const Papers = useContext(PapersContext);
  const storedGameId = Papers.state.game && Papers.state.game.name;

  if (storedGameId) {
    return <Redirect push to={`/game/${storedGameId}`} />;
  }

  return Papers.state.profile.name ? <HomeSigned /> : <HomeNewPlayer />;
}
