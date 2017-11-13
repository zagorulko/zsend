import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';

import '~/styles/main.scss';

import Root from '~/components/Root';
import Error from '~/components/Error';
import reducers from '~/reducers';
import sessionMiddleware from '~/session';
import { Stages } from '~/constants';

if (process.env.NODE_ENV === 'production' && window.location.protocol != "https:") {
  window.location.href = "https:" +
    window.location.href.substring(window.location.protocol.length);
}

function browserIsOk() {
  if (!window.WebSocket) {
    ReactDOM.render(
      <Error title='Your browser does not support WebSockets' />,
      document.getElementById('app')
    );
    return false;
  }
  if (!window.crypto) {
    ReactDOM.render(
      <Error title='Your browser does not support WebCrypto API' />,
      document.getElementById('app')
    );
    return false;
  }
  return true;
}

if (browserIsOk()) {
  let initialState = {
    session: {
      isHost: window.location.hash === '',
      stage: Stages.INITIAL,
      failType: '',
      failReason: ''
    },
    dialog: {
      show: false
    },
    messages: {}
  };

  let store = createStore(
    reducers,
    initialState,
    process.env.NODE_ENV === 'production' ?
      applyMiddleware(sessionMiddleware) :
      applyMiddleware(sessionMiddleware,createLogger())
  );

  render(
    <Provider store={store}>
      <Root />
    </Provider>,
    document.getElementById('app')
  );
}
