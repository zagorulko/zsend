import { ActionTypes } from '../constants';

export function setStage(stage) {
  return { type: ActionTypes.SET_SESSION_STATUS, stage: stage };
}
export function setFailType(failType) {
  return { type: ActionTypes.SET_FAIL_TYPE, failType: failType };
}
export function setFailReason(failReason) {
  return { type: ActionTypes.SET_FAIL_REASON, failReason: failReason };
}
export function setInviteLink(url) {
  return { type: ActionTypes.SET_INVITE_LINK, url: url };
}

export function showDialog() {
  return { type: ActionTypes.SHOW_DIALOG };
}

let nextMessageId = 0;
export function incomingText(text) {
  return {
    type: ActionTypes.INCOMING_TEXT,
    id: nextMessageId++,
    time: new Date(),
    text: text
  };
}
export function incomingFile(name, mime, size) {
  return {
    type: ActionTypes.INCOMING_FILE,
    id: nextMessageId++,
    time: new Date(),
    name: name,
    mime: mime,
    size: size
  };
}
export function sendText(text) {
  return {
    type: ActionTypes.SEND_TEXT,
    id: nextMessageId++,
    time: new Date(),
    text: text
  };
}
export function sendFile(name, mime, size, reader) {
  return {
    type: ActionTypes.SEND_FILE,
    id: nextMessageId++,
    name: name,
    mime: mime,
    size: size,
    reader: reader
  };
}
export function transferUpdate(id, sizeOk) {
  return {
    type: ActionTypes.TRANSFER_UPDATE,
    id: id,
    sizeOk: sizeOk
  };
}
export function transferDone(id) {
  return {
    type: ActionTypes.TRANSFER_DONE,
    id: id
  };
}
export function transferBlob(id, blob) {
  return {
    type: ActionTypes.TRANSFER_BLOB,
    id: id,
    blob: blob
  };
}
