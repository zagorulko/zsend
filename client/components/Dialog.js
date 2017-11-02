import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';

import * as actions from '~/actions';
import { Stages } from '~/constants';
import Message from './Message';

class Dialog extends React.Component {
  _sendText(target) {
    if (this.props.session.stage == Stages.DISCONNECTED)
      return;

    let text = this._messageField.value.trim();
    if (text !== '')
      this.props.onSendText(text);
    else
      ReactDOM.findDOMNode(this._messageField).focus();

    this._messageField.value = "";
    $('#message-field').trigger('autoresize');
  }

  _onMessage(e) {
    e.preventDefault();

    if (this.props.session.stage == Stages.DISCONNECTED)
      return;

    this.props.onTypeMessage();
    if (e.which != 13 || e.shiftKey)
      return false;

    this._sendText();
  }

  _onChangeFile(e) {
    e.preventDefault();

    if (this.props.session.stage == Stages.DISCONNECTED)
      return;

    if (!e.target.files.length)
      return;
    let file = e.target.files[0];

    let offset = 0;
    let chunkSize = Math.max(16384, file.size / 300);

    let readChunk = (offset, callback) => {
      let reader = new FileReader();
      reader.onload = e => {
        if (e.target.error) {
          // FIXME: output error
          callback(false);
          return;
        }
        callback(new Uint8Array(e.target.result));
      };
      reader.readAsArrayBuffer(file.slice(offset, offset+chunkSize));
    };

    this.props.onSendFile(
      file.name,
      file.type ? file.type : 'application/octet-stream',
      file.size,
      readChunk
    );
  }

  componentDidUpdate(prevProps) {
    if (Object.keys(this.props.messages).length !=
        Object.keys(prevProps.messages).length) {
      let objDialog = document.getElementById('message-list');
      objDialog.scrollTop = objDialog.scrollHeight;
    }
  }

  render() {
    return (
    <div className='l-flexbox-wrapper'>
      <main id='message-list' className='grey lighten-3'>
        <div className='l-container'>
          <br/>
          {Object.keys(this.props.messages).map(id => {
            return (<Message key={'message-'+id} message={this.props.messages[id]} />);
          })}
        </div>
      </main>
      <div className='grey darken-4 white-text'>
      <footer id='dialog-footer'>
      <div className='l-container'>
        <form onSubmit={(e) => {
          e.preventDefault();
          this._sendText();}}>
        <div className='input-field'>
          <MediaQuery minWidth={501}>
            <textarea className='materialize-textarea white-text'
              id='message-field' ref={ref => this._messageField = ref}
              placeholder='Message'
              onKeyUp={e => this._onMessage(e)}>
            </textarea>
          </MediaQuery>
          <MediaQuery maxWidth={500}>
            <textarea className='materialize-textarea white-text'
              id='message-field' ref={ref => this._messageField = ref}
              placeholder='Message'>
            </textarea>
          </MediaQuery>
        </div>
        </form>
        <div id='footer-controls'>
          <form onSubmit={e => e.preventDefault()}>
          <div className='left-button file-field input-field'>
            <div className='btn-floating waves-effect waves-circle blue'>
            <i className='material-icons'>photo_camera</i>
            <input type='file' accept='image/*' onChange={e => this._onChangeFile(e)} />
            </div>
          </div>
          <div className='left-button file-field input-field'>
            <div className='btn-floating waves-effect waves-circle purple'>
            <i className='material-icons'>attachment</i>
            <input type='file' onChange={e => this._onChangeFile(e)} />
            </div>
          </div>
          </form>
          <div>
            {this.props.dialog.peerIsTyping && (
            <div>
            <MediaQuery minWidth={501}>
              <span className='grey-text text-darken-2' id='peer-status'>
              Peer is typing...
              </span>
            </MediaQuery>
            </div>
            )}
          </div>
          <div>
            <MediaQuery minWidth={501}>
              <button className='btn waves-effect waves-light red'
                onClick={() => this._sendText()}>
              Send<i className='material-icons right'>send</i>
              </button>
            </MediaQuery>
            <MediaQuery maxWidth={500}>
              <button className='btn-floating waves-effect waves-light'
                onClick={() => this._sendText()}>
              <i className='material-icons right'>send</i>
              </button>
            </MediaQuery>
          </div>
        </div>
      </div>
      </footer>
      </div>
  </div>
  );
  }
}

function mapStateToProps(state) {
  return {
    session: state.session,
    dialog: state.dialog,
    messages: state.messages
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onTypeMessage: () => {
      dispatch(actions.typingMessage());
    },
    onSendText: (text) => {
      dispatch(actions.sendText(text));
    },
    onSendFile: (name, mime, size, reader) => {
      dispatch(actions.sendFile(name,mime,size,reader));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dialog);
