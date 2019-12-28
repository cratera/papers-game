/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { typography as Typography } from 'Theme.js';
import * as Styles from './PlayingStyles.js';
import Button from 'components/Button.js';
import PapersContext from 'store/PapersContext.js';

export default function GameRoom(props) {
  const Papers = useContext(PapersContext);
  const { profile, game } = Papers.state;

  return <div css={Styles.page}>ROUND 1 starting here...</div>;
}
