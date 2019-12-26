/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment } from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import { base } from 'Theme.js';
import Home from 'views/HomeEntry.js';
import GameRoom from 'views/GameRoom.js';
import CoreContext, { CoreContextProvider } from 'store/CoreContext.js';
import { PapersContextProvider } from 'store/PapersContext.js';

export default function App(props) {
  return (
    <CoreContextProvider>
      <PapersContextProvider>
        <button
          css={css`
            position: fixed;
            top: 0;
            right: 0;
            font-size: 1.3rem;
          `}
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
        <div css={base}>
          <Switch>
            <Route path="/game/:id">
              <GameRoom />
            </Route>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="*">
              {/* Do a 404 in the future? */}
              <Redirect to="/" />
            </Route>
          </Switch>
        </div>
        <CoreContext.Consumer>
          {({ room, modal }) => {
            const ModalComponent = modal.component;
            const props = modal.props || {};
            return <Fragment>{ModalComponent && <ModalComponent {...props} />}</Fragment>;
          }}
        </CoreContext.Consumer>
      </PapersContextProvider>
    </CoreContextProvider>
  );
}
