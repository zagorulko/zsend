import React from 'react';
import { connect } from 'react-redux';

import { Stages } from '~/constants';

class InitClient extends React.Component {
  render() {
    return (
      <div className='l-flexbox-wrapper'>
      <main className='l-valign-wrapper'>
      <div className='l-container l-valign l-center'>
        <h4>Establishing connection...</h4>
        <div className='progress'>
        <div className='indeterminate'></div>
        </div>
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

export default connect(mapStateToProps)(InitClient);
