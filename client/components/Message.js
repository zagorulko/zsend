import React from 'react';
import filesize from 'filesize';
import strftime from 'strftime-component';

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

  _copy_text(e) {
    e.preventDefault();

    let range = document.createRange();
    range.selectNode(this.refs.textNode);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    if (document.execCommand('copy')) {
      window.getSelection().removeAllRanges();
      Materialize.toast('Copied!', 500);
    } else {
      Materialize.toast('Press Ctrl-C to copy', 1500);
    }
  }

  render() {
    return (
      <div className='message l-row card-panel white black-text'>
       {<div className='l-row message-header'>
          <div className='l-left'>
            <b>
            {this.props.message.isIncoming
                ? <span className='red-text text-darken-4'>In</span>
                : <span className='blue-text text-darken-3'>Out</span>}
            </b>
          </div>
          <div className='l-right grey-text'>
            {strftime('%H:%M', this.props.message.time)}
          </div>
        </div>
        }
        {this.props.message.text && (
          <div>
            <div className='message-label'>
              <b>Text</b>
              <button className='btn-floating' onClick={e => this._copy_text(e)}>
                <i className='material-icons'>content_copy</i>
              </button>
            </div>
            <div className='message-text' ref='textNode'>
              {this.props.message.text}
            </div>
          </div>
        )}
        {this.props.message.mime && (
          <div>
          {this.props.message.name && (
            <div className='message-label'>
              <b>{this.props.message.name}</b>
              {this.props.message.done ?
                ' ('+filesize(this.props.message.size)+')' :
                ' ('+filesize(this.props.message.sizeOk)+' / '+
                      filesize(this.props.message.size)+')'}
              {this.props.message.blob && (
                <button className='btn-floating' onClick={e => this._download(e)}>
                  <i className='material-icons left'>file_download</i>
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
