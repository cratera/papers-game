/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import { base } from 'Theme.js';
import Home from 'views/Home.js';
import GameRoom from 'views/GameRoom.js';
import CoreContext, { CoreContextProvider } from 'store/CoreContext.js';
import { PapersContextProvider } from 'store/PapersContext.js';

export default function App(props) {
  return (
    <CoreContextProvider>
      <PapersContextProvider>
        <div css={base}>
          <Switch>
            <Route path="/game/:id">
              <GameRoom />
            </Route>
            <Route path="/game">
              <Redirect to="/" />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
        <CoreContext.Consumer>
          {({ room, modal }) => {
            const ModalComponent = modal.component;
            const props = modal.props || {};
            return (
              <Fragment>
                {/* {room && room.name && (
                  <Redirect push to={`/room/${room.name}`} />
                )} */}
                {ModalComponent && <ModalComponent {...props} />}
              </Fragment>
            );
          }}
        </CoreContext.Consumer>
      </PapersContextProvider>
    </CoreContextProvider>
  );
}
