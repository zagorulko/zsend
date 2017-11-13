import React from 'react';

export default class Error extends React.Component {
  render() {
    return (
      <div className='l-flexbox-wrapper'>
      <main className='l-valign-wrapper'>
      <div className='l-container l-valign l-center'>
        <h1 className='deep-orange-text text-darken-4'>¯\_(ツ)_/¯</h1>
        <h3>{this.props.title}</h3>
        {this.props.text && <h5>{this.props.text}</h5>}
      </div>
      </main>
      </div>
    );
  }
}
