import base64 from 'base64-js';
import msgpack from 'msgpack-js';

import * as actions from '~/actions';
import { ActionTypes, Stages } from '~/constants';
import * as Crypto from './crypto';

function newConnection() {
  let ws = new WebSocket((window.location.protocol === 'https:' ? 'wss:' : 'ws:')
                                + '//' + window.location.host + '/ws');
  ws.binaryType = 'arraybuffer';
  return ws;
}

function sendFile(dispatch, messageId, sessionKey, readChunk, size, mime,
                  submitTransferId) {
  let ws = newConnection();
  let started = false;
  let offset = 0;
  let blob = [];

  ws.onopen = () => {
    ws.send(JSON.stringify({type: 'id'}));
  };

  ws.onmessage = (e) => {
    if (!started) {
      submitTransferId(JSON.parse(e.data));
      started = true;
    } else {
      let sendChunk = (chunk) => {
        blob = new Blob([blob, chunk], {type: mime});
        offset += chunk.length;
        Crypto.aesEncrypt(sessionKey, chunk)
          .then(encrypted => {
            ws.send(msgpack.encode(encrypted));
            dispatch(actions.transferUpdate(messageId, offset));
            if (offset >= size) {
              ws.close();
              dispatch(actions.transferBlob(messageId,blob));
              dispatch(actions.transferDone(messageId));
            } else {
              readChunk(offset, sendChunk);
            }
          });
      };

      readChunk(offset, sendChunk);
    }
  };
}

function receiveFile(dispatch, messageId, sessionKey, transferId, size, mime) {
  let ws = newConnection();
  let started = false;
  let offset = 0;
  let blob = [];

  ws.onopen = () => {
    ws.send(JSON.stringify({type: 'join', id: transferId}));
  };

  ws.onmessage = (e) => {
    if (!started) {
      ws.send(msgpack.encode(0));
      started = true;
    } else {
      Crypto.aesDecrypt(sessionKey, msgpack.decode(new Uint8Array(e.data)))
        .then(decrypted => {
          blob = new Blob([blob, decrypted], {type: mime});
          offset += decrypted.length;
          dispatch(actions.transferUpdate(messageId, offset));
          if (offset >= size) {
            ws.close();
            dispatch(actions.transferBlob(messageId,blob));
            dispatch(actions.transferDone(messageId));
          }
        });
    }
  };
}

export default function ({getState, dispatch}) {
  let _ecdhPrivateKey = null;
  let _ecdhPublicKeyJwk = null;
  let _sessionKey = null;

  let _inviteId = null;
  let _inviteKey = null;

  let _keepConnection = 0;
  let _lastType = 0;
  let _clearPeerTyping = 0;

  let ws = newConnection();

  ws.onopen = () => {
    let chain = Promise.resolve();

    if (getState().session.isHost) {
      dispatch(actions.setFailType('Failed to generate invitation'));
    } else {
      dispatch(actions.setFailType('Failed to initiate connection'));

      let hsData = msgpack.decode(base64.toByteArray(window.location.hash.substr(1)));
      chain.then(t => {
        return Crypto.aesImportRawKey(hsData[1]);
      })
      .then(inviteKey => {
        _inviteId = hsData[0];
        _inviteKey = inviteKey;
      });
    }

    chain.then(t => {
      return Crypto.ecdhGenerate();
    })
    .catch(err => {
      dispatch(actions.setFailReason('It seems that your browser does not support ECDH'));
      return Promise.reject(err);
    })
    .then(key => {
      _ecdhPrivateKey = key[0];
      _ecdhPublicKeyJwk = key[1];

      if (getState().session.isHost) {
        ws.send(JSON.stringify({type: 'id'}));
        dispatch(actions.setStage(Stages.SELF_ID));
      } else {
        ws.send(JSON.stringify({type: 'join', id: _inviteId}));
        dispatch(actions.setStage(Stages.HANDSHAKE));
      }
      _keepConnection = setInterval(() => {
        ws.send(JSON.stringify({type: 'keep'}));
      }, 5000);
    })
    .catch(err => {
      dispatch(actions.setStage(Stages.FAILED));
    });
  };

  ws.onmessage = (e) => {
    let session = getState().session;

    switch (session.stage) {
    case Stages.SELF_ID: {
      let _inviteRawKey;

      Crypto.aesGenerateRawKey()
        .then(key => {
          _inviteId = JSON.parse(e.data);
          _inviteKey = key[0];
          _inviteRawKey = key[1];
          return Crypto.aesEncrypt(_inviteKey, _ecdhPublicKeyJwk);
        })
        .then(encrypted => {
          ws.send(msgpack.encode(encrypted));

          let inviteData = msgpack.encode([_inviteId, _inviteRawKey]);
          let url = window.location.href+'#'+base64.fromByteArray(inviteData);
          dispatch(actions.setInviteLink(url));
          dispatch(actions.setStage(Stages.HANDSHAKE));
        })
        .catch(err => {
          dispatch(actions.setStage(Stages.FAILED));
        });
      break;
    };

    case Stages.HANDSHAKE: {
      dispatch(actions.setFailType('Handshake failed'));

      let encrypted = msgpack.decode(new Uint8Array(e.data));

      let chain = Crypto.aesDecrypt(_inviteKey, encrypted)
        .then(peerPublicKeyJwk => {
          return Crypto.ecdhDerive(_ecdhPrivateKey, peerPublicKeyJwk);
        })
        .then(sessionKey => {
          _sessionKey = sessionKey;
        });

      if (!session.isHost) {
        chain.then(t => {
          return Crypto.aesEncrypt(_inviteKey, _ecdhPublicKeyJwk);
        })
        .then(encrypted => {
          ws.send(msgpack.encode(encrypted));
        });
      }

      chain.then(t => {
        dispatch(actions.setFailType(''));
        dispatch(actions.setFailReason(''));
        dispatch(actions.setStage(Stages.CONNECTED));
        dispatch(actions.addConnectionMessage(true));
        dispatch(actions.showDialog());
      })
      .catch(err => {
        dispatch(actions.setStage(Stages.FAILED));
      });

      break;
    }

    case Stages.CONNECTED: {
      let encrypted = msgpack.decode(new Uint8Array(e.data));
      Crypto.aesDecrypt(_sessionKey, encrypted)
        .then(packet => {
          switch (packet.type) {
          case 'typing':
            if (_clearPeerTyping)
              clearTimeout(_clearPeerTyping);
            _clearPeerTyping = setTimeout(() => {
              dispatch(actions.peerIsTyping(false));
            }, 2000);
            dispatch(actions.peerIsTyping(true));
            break;

          case 'text':
            dispatch(actions.incomingText(decodeURIComponent(packet.text)));
            dispatch(actions.peerIsTyping(false));
            break;

          case 'file':
            let action = actions.incomingFile(decodeURIComponent(packet.name),
                                              packet.mime, packet.size);
            dispatch(action);
            receiveFile(dispatch, action.id, _sessionKey, packet.transferId,
                        packet.size, packet.mime);
            break;
          }
        });
      break;
    }
    }
  };

  ws.onclose = () => {
    let session = getState().session;
    if (_keepConnection)
      clearInterval(_keepConnection);
    dispatch(actions.setStage(session.stage == Stages.CONNECTED
                              ? Stages.DISCONNECTED
                              : Stages.FAILED));
    dispatch(actions.addConnectionMessage(false));
  };

  return next => action => {
    if (action.type == ActionTypes.TYPING_MESSAGE) {
      let time = new Date().getTime();
      if (time - _lastType >= 4000) {
        Crypto.aesEncrypt(_sessionKey, {
          type: 'typing'
        })
        .then(encrypted => {
          ws.send(msgpack.encode(encrypted));
        });
      }
      _lastType = time;
    }

    if (action.type == ActionTypes.SEND_TEXT) {
      Crypto.aesEncrypt(_sessionKey, {
        type: 'text',
        text: encodeURIComponent(action.text)
      })
      .then(encrypted => {
        ws.send(msgpack.encode(encrypted));
      });
      _lastType = 0;
    }

    if (action.type == ActionTypes.SEND_FILE) {
      sendFile(dispatch, action.id, _sessionKey, action.reader, action.size,
        action.mime, transferId => {
          Crypto.aesEncrypt(_sessionKey, {
            type: 'file',
            transferId: transferId,
            name: encodeURIComponent(action.name),
            mime: action.mime,
            size: action.size
          })
          .then(encrypted => {
            ws.send(msgpack.encode(encrypted));
          });
      });
    }

    return next(action);
  };
}
