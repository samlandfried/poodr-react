import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';
import App from './App';
import Callback from './Callback/Callback';
import history from './history';

export const makeMainRoutes = () => {
  return (
      <BrowserRouter history={history} component={App}>
        <div>
          <Route path="/" render={(props) => <App  {...props} />} />
          <Route path="/callback" render={(props) => <Callback {...props} /> }/>
        </div>
      </BrowserRouter>
  );
}