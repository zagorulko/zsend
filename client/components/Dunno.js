import React from 'react';

export default class Dunno extends React.Component {
  render() {
    return (
      <div className='l-flexbox-wrapper'>
      <main className='l-valign-wrapper blue-grey darken-4'>
      <div className='l-container l-valign l-center'>
        <h1 className='teal-text'>¯\_(ツ)_/¯</h1>
        <h3 className='white-text'>{this.props.title}</h3>
        {this.props.text &&
          <h5 className='white-text'>{this.props.text}</h5>}
      </div>
      </main>
      </div>
    );
  }
}
