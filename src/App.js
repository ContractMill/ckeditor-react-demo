import React, { Component } from 'react'
// import logo from './logo.svg'
import './App.css'
import Editor from './components/Editor'
import FileDrop from './components/FileDrop'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = { file: null, exampleSelected: 0 }
    this.handleFile = this.handleFile.bind(this)
    this.selectExample = this.selectExample.bind(this)
  }

  handleFile (file) {
    this.setState({
      file: file
    })
  }

  selectExample (number) {
    this.setState({
      exampleSelected: number
    })
  }

  render () {
    return (
      <div className='App'>
        <FileDrop onFile={this.handleFile} selectExample={this.selectExample}>
          <Editor file={this.state.file} exampleNumber={this.state.exampleSelected} />
        </FileDrop>
      </div>
    )
  }
}

export default App
