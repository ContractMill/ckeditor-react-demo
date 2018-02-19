import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import Editor from './components/Editor'
import FileDrop from './components/FileDrop'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = { file: null }
    this.handleFile = this.handleFile.bind(this)
  }

  handleFile (file) {
    this.setState({
      file: file
    })
  }

  render () {
    return (
      <div className='App'>
        <FileDrop onFile={this.handleFile} >
          <Editor file={this.state.file} />
        </FileDrop>
      </div>
    )
  }
}

export default App
