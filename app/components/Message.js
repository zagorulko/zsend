import React from 'react';
import ReactEmoji from 'react-emoji';
import ReactLinkify from 'react-linkify';
import filesize from 'filesize';
import strftime from 'strftime-component';

import { MessageSources } from '~/constants';

export default class Message extends React.Component {
  _download(e) {
    e.preventDefault();

    let link = document.createElement('a');
    link.href = URL.createObjectURL(this.props.message.blob);
    link.download = this.props.message.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  renderConnectionMessage() {
    return (
      <div className='message l-row card-panel white black-text'>
        <div className='l-row'>
        <div className='l-left'>
          <i><span className='grey-text text-darken-1'>
            {this.props.message.isConnected ? 'Connected' : 'Disconnected'}
          </span></i>
        </div>
        <div className='l-right grey-text'>
          {strftime('%H:%M',this.props.message.time)}
        </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.props.message.source == MessageSources.CONNECTION)
      return this.renderConnectionMessage();

    return (
      <div className='message l-row card-panel white black-text'>
        <div className='l-row message-header'>
        <div className='l-left'>
          <b>
          {this.props.message.source == MessageSources.OUTGOING ?
                <span>You</span> : <span className='red-text text-darken-4'>Peer</span>}
          </b>
        </div>
        <div className='l-right grey-text'>
          {strftime('%H:%M',this.props.message.time)}
        </div>
        </div>
        {this.props.message.text && (
        <ReactLinkify properties={{target: '_blank', className: 'blue-text text-darken-2'}}>
        <span className='l-row message-text'>
          {ReactEmoji.emojify(this.props.message.text)}
        </span>
        </ReactLinkify>
        )}
        {this.props.message.mime && (
          <div className='message-file'>
          {this.props.message.name && (
            <div className='message-file-label'>
            <span>
              {this.props.message.name}
            </span>
            <span className='grey-text'>
              {this.props.message.done ?
                ' ('+filesize(this.props.message.size)+')' :
                ' ('+filesize(this.props.message.sizeOk)+' / '+filesize(this.props.message.size)+')'}
            </span>
            {this.props.message.blob && (
              <button className='btn-floating waves-effect waves-circle grey lighten-3'
                onClick={e => this._download(e)}>
              <i className='material-icons'>file_download</i>
              </button>
            )}
            </div>
          )}
          {this.props.message.blob && this.props.message.mime.indexOf('image') == 0 && (
            <div>
            <img src={URL.createObjectURL(this.props.message.blob)}
              onClick={e => this._download(e)} />
            </div>
          )}
          {!this.props.message.done && (
            <div className='progress'>
              <div className='determinate' style={{width:
                (this.props.message.sizeOk / this.props.message.size * 100).toString()+'%'
              }}>
              </div>
            </div>
          )}
          </div>
        )}
      </div>
    );
  }
}
