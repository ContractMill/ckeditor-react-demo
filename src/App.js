import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import Editor from './components/editor-component'

class App extends Component {
  render () {
    return (
      <div className='App'>
        {/* <header className='App-header'>
          <h1 className='App-title'>CKEditor on React
            <img src={logo} className='App-logo' alt='logo' />
          </h1>
        </header> */}
        <Editor />
      </div>
    )
  }
}

export default App
