import React from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';

import * as actions from '~/actions';
import { Stages } from '~/constants';
import Message from './Message';

class Dialog extends React.Component {
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

  _onOpenEditor(e) {
    e.preventDefault();
    this._editorModal = $(findDOMNode(this.refs.editorModal)).modal({
      dismissible: false,
      opacity: 0.7
    });
    this._editorModal.modal('open');
  }

  _onSendText(e) {
    e.preventDefault();

    if (this.props.session.stage == Stages.DISCONNECTED)
      return;

    let field = findDOMNode(this.refs.textField);
    let text = field.value.trim();

    if (text !== '') {
      this.props.onSendText(text);
      field.value = '';
      $(field).trigger('autoresize');
      $(field).trigger('blur');
      this._editorModal.modal('close');
    } else {
      field.focus();
    }
  }

  componentDidUpdate(prevProps) {
    if (Object.keys(this.props.messages).length !=
        Object.keys(prevProps.messages).length) {
      let objDialog = document.getElementById('message-list');
      objDialog.scrollTop = objDialog.scrollHeight;
    }
    if (this.props.session.stage != prevProps.session.stage
          && this.props.session.stage == Stages.DISCONNECTED) {
      let disconnectModal = $(findDOMNode(this.refs.disconnectModal)).modal({
        dismissible: false,
        opacity: 0.7
      });
      disconnectModal.modal('open');
    }
  }

  render() {
    return (
    <div className='l-flexbox-wrapper'>
      {Object.keys(this.props.messages).length > 0
        ? <main id='message-list' className='grey lighten-3'>
            <div className='l-container'>
              <br/>
              {Object.keys(this.props.messages).map(id => {
                return (<Message key={'message-'+id} message={this.props.messages[id]} />);
              })}
            </div>
          </main>
        : <main className='l-valign-wrapper grey lighten-3'>
            <div className='l-container l-valign l-center' id='dialog-welcome'>
              <h5 className='grey-text'><strong>Connection established</strong></h5>
              <h5 className='grey-text'>Your transfers will appear here</h5>
            </div>
          </main>
      }
      {this.props.session.stage != Stages.DISCONNECTED && (
        <div className='fixed-action-btn'>
          <button className='btn-floating btn-large red'>
            <i className='large material-icons'>attach_file</i>
          </button>
          <ul>
            <form onSubmit={e => e.preventDefault()}>
              <li>
                <button className={'btn-floating green'}
                    onClick={e => this._onOpenEditor((e))}>
                  <i className='large material-icons'>message</i>
                </button>
              </li>
              <li>
                <div className='file-field input-field btn-floating blue'>
                  <i className='large material-icons'>photo_camera</i>
                <input type='file' accept='image/*' onChange={e => this._onChangeFile(e)} />
                </div>
              </li>
              <li>
                <div className='file-field input-field btn-floating purple'>
                  <i className='large material-icons'>insert_drive_file</i>
                  <input type='file' onChange={e => this._onChangeFile(e)} />
                </div>
              </li>
            </form>
          </ul>
        </div>
      )}
      <div className='modal' ref='editorModal'>
        <div className='modal-content'
            style={{paddingTop: '5px', paddingBottom: 0}}>
          <div className='input-field'>
            <textarea id='textField' ref='textField'
              className='materialize-textarea'
              style={{marginBottom: 0}}>
            </textarea>
            <label htmlFor='textField'>Paste text here</label>
          </div>
        </div>
        <div className='modal-footer'>
          <button className='modal-action modal-close btn-flat'>
            Cancel
          </button>
          <button className='modal-action btn-flat teal white-text'
              onClick={e => this._onSendText(e)}>
            Send
          </button>
        </div>
      </div>
      <div className='modal' ref='disconnectModal'>
        <div className='modal-content' style={{paddingBottom: 0}}>
          <h5>Connection lost</h5>
        </div>
        <div className='modal-footer'>
          <button className='modal-action modal-close btn-flat teal white-text'>
            OK
          </button>
        </div>
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
    onSendText: (text) => {
      dispatch(actions.sendText(text));
    },
    onSendFile: (name, mime, size, reader) => {
      dispatch(actions.sendFile(name,mime,size,reader));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dialog);
