/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import { ThemeGlobal } from 'Theme.js';
import { Home, GameRoom } from 'pages';
import CoreContext, { CoreContextProvider } from 'store/CoreContext.js';
import { PapersContextProvider } from 'store/PapersContext.js';

export default function App(props) {
  return (
    <CoreContextProvider>
      <PapersContextProvider>
        <ThemeGlobal />
        <Switch>
          <Route path="/game/:id">
            <GameRoom />
          </Route>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="*">
            {/* TODO - a 404 in the future? */}
            <Redirect to="/" />
          </Route>
        </Switch>
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
