import React from 'react';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';

import { Stages } from '~/constants';

class InitHost extends React.Component {
  _copyLink(e) {
    e.preventDefault();

    let range = document.createRange();
    range.selectNode(document.getElementById('welcome-link-text'));
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
      <div className='l-flexbox-wrapper'>
      <main className=''>
        <div className='l-container l-valign l-center'>
          {this.props.session.stage != Stages.HANDSHAKE
          ? <div>
              <h3>Generating link...</h3>
            </div>
          : <div>
              <div style={{marginTop: '30px'}}>
                <h5>Scan QR code </h5>
                <QRCode value={this.props.session.inviteLink} size={256} />
              </div>
              <div style={{marginTop: '20px'}}>
                <h5>Or use the link </h5>
                <div id='welcome-link'>
                <span id='welcome-link-text'>
                  {this.props.session.inviteLink}
                </span>
                </div>
                <div id='welcome-controls'>
                <a className='welcome-button btn waves-effect waves-light'
                  onClick={e => this._copyLink(e)}>
                  <i className='material-icons'>content_copy</i>
                </a>
                {process.env.NODE_ENV !== 'production' &&
                  (<a className='welcome-button btn waves-effect waves-light'
                    target='_new' href={this.props.session.inviteLink}>
                    <i className='material-icons'>open_in_new</i>
                  </a>)}
                </div>
              </div>
            </div>
          }
        </div>
      </main>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    session: state.session
  };
}

export default connect(mapStateToProps)(InitHost);
