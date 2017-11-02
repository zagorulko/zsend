import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Stages } from '~/constants';
import Dialog from './Dialog';
import Dunno from './Dunno';
import InitClient from './InitClient';
import InitHost from './InitHost';

class Root extends Component {
  render() {
    if (this.props.dialog.show)
      return (<Dialog/>);
    if (this.props.session.stage == Stages.FAILED)
      return (<Dunno title={this.props.session.failType}
                     text={this.props.session.failReason} />);
    return this.props.session.isHost ? (<InitHost />) : (<InitClient />);
  }
}

function mapStateToProps(state) {
  return {
    session: state.session,
    dialog: state.dialog
  };
}

export default connect(mapStateToProps)(Root);
