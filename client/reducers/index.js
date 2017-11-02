import { combineReducers } from 'redux';
import { ActionTypes, MessageSources } from '~/constants';

function session(state={}, action) {
  switch (action.type) {
  case ActionTypes.SET_SESSION_STATUS:
    return Object.assign({}, state, {
      stage: action.stage
    });
  case ActionTypes.SET_FAIL_TYPE:
    return Object.assign({}, state, {
      failType: action.failType
    });
  case ActionTypes.SET_FAIL_REASON:
    return Object.assign({}, state, {
      failReason: action.failReason
    });
  case ActionTypes.SET_INVITE_LINK:
    return Object.assign({}, state, {
      inviteLink: action.url
    });
  default:
    return state;
  }
}

function dialog(state={},action) {
  switch (action.type) {
  case ActionTypes.SHOW_DIALOG:
    return Object.assign({}, state, {
      show: true
    });
  case ActionTypes.PEER_IS_TYPING:
    return Object.assign({}, state, {
      peerIsTyping: action.isTyping
    });
  default:
    return state;
  }
}

function message(state={},action) {
  switch (action.type) {
  case ActionTypes.ADD_CONNECTION_MESSAGE:
    return {
      source: MessageSources.CONNECTION,
      time: action.time,
      isConnected: action.isConnected
    };
  case ActionTypes.INCOMING_TEXT:
    return {
      source: MessageSources.INCOMING,
      time: action.time,
      text: action.text
    };
  case ActionTypes.INCOMING_FILE:
    return {
      source: MessageSources.INCOMING,
      time: action.time,
      done: false,
      name: action.name,
      mime: action.mime,
      size: action.size,
      sizeOk: 0
    };
  case ActionTypes.SEND_TEXT:
    return {
      source: MessageSources.OUTGOING,
      time: action.time,
      text: action.text
    };
  case ActionTypes.SEND_FILE:
    return {
      source: MessageSources.OUTGOING,
      time: action.time,
      done: false,
      name: action.name,
      mime: action.mime,
      size: action.size,
      sizeOk: 0,
      blob: action.blob
    };
  case ActionTypes.TRANSFER_UPDATE:
    return Object.assign({}, state, {
      sizeOk: action.sizeOk
    });
  case ActionTypes.TRANSFER_DONE:
    return Object.assign({}, state, {
      done: true
    });
  case ActionTypes.TRANSFER_BLOB:
    return Object.assign({}, state, {
      blob: action.blob
    });
  default:
    return state;
  }
}

function messages(state={},action) {
  switch (action.type) {
  case ActionTypes.ADD_CONNECTION_MESSAGE:
  case ActionTypes.INCOMING_TEXT:
  case ActionTypes.INCOMING_FILE:
  case ActionTypes.SEND_TEXT:
  case ActionTypes.SEND_FILE:
  case ActionTypes.TRANSFER_UPDATE:
  case ActionTypes.TRANSFER_DONE:
  case ActionTypes.TRANSFER_BLOB:
    return Object.assign({}, state, {
      [action.id]: message(state[action.id], action)
    });
  default:
    return state;
  }
}

export default combineReducers({
  session,
  dialog,
  messages
});
