import React, { Component } from 'react'
import { css, cx } from 'emotion'
import PropTypes from 'prop-types'

const mammoth = require('mammoth/mammoth.browser.js')

const styles = css`
  .container {
    position: relative;
    min-height: 100px;
    width: 100%;
  }

  .file {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }

  .target {
    border: 2px dashed rgba(0,0,0,0.2);
  }

 .target::after {
    position: absolute;
    height: 100%;
    width: 100%;
    border-color: rgba(0,0,0, 0.5);
    content: 'Drop file here';
    background: white;
    font-size: 1.5em;
    font-weight: 500;
    height: 100%;
    left: 0;
    line-height: 1.5;
    text-align: center;
    top: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }

  .hover {
    border-color: black;
    & .content  {
      display: block;
    }
  }
`

class FileDrop extends Component {
  constructor (props) {
    super(props)
    this.state = { target: false, hover: false }

    this.handleChange = this.handleChange.bind(this)
    this.dropLeave = this.dropLeave.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.dropTarget = this.dropTarget.bind(this)
    this.handleDragEnter = this.handleDragEnter.bind(this)
    this.handleDragLeave = this.handleDragLeave.bind(this)
    this.handleDragOver = this.handleDragOver.bind(this)
  }

  componentDidMount () {
    window.addEventListener('dragover', this.dropTarget)
    window.addEventListener('dragleave', this.dropLeave)
    window.addEventListener('drop', this.handleDrop)
  }

  componentWillUnmount () {
    window.removeEventListener('dragover', this.dropTarget)
    window.removeEventListener('dragleave', this.dropLeave)
    window.removeEventListener('drop', this.handleDrop)
  }

  handleChange (e) {
    if (!e.target.files || !e.target.files.length) return
    var file = e.target.files[0]

    this.handleFile({
      file: file,
      name: file.name,
      type: file.type
    })
  }

  dropTarget (e) {
    if (!this.state.active) {
      this.setState({
        // target: true
      })
    }
  }

  dropLeave (e) {
    if (e.screenX === 0 && e.screenY === 0) { // Checks for if the leave event is when leaving the window
      this.setState({
        target: false
      })
    }
  }

  handleDrop (e) {
    e.preventDefault()
    e.stopPropagation()

    var uploadObj = {
      target: e.nativeEvent.dataTransfer
    }

    this.setState({
      // target: false,
      // hover: false
    })

    this.handleChange(uploadObj)
  }

  handleDragEnter (e) {
    e.preventDefault()
    e.stopPropagation()

    console.log('handleDragEnter', e)
    if (!this.state.active) {
      this.setState({
        // hover: true
      })
    }
  }

  handleDragLeave (e) {
    console.log('handleDragLeave', e)
    this.setState({
      // hover: false,
      // target: false
    })
  }

  handleDragOver (e) {
    e.preventDefault()
    console.log('handleDragOver', e)
    this.setState({
      // hover: false,
      // target: false
    })
  }

  handleFile (file) {
    console.log(file)
    var reader = new FileReader()

    reader.onload = (e) => {
      const arrayBuffer = e.target.result
      // file.content = reader.result
      // console.log('--->', arrayBuffer)
      // this.props.onFile && this.props.onFile(file)
      mammoth.convertToHtml({ arrayBuffer })
        .then(result => {
          console.log('=====>>>', result)
          file.content = result.value
          this.props.onFile && this.props.onFile(file)
        })
    }

    // reader.readAsDataURL(file.file)
    reader.readAsArrayBuffer(file.file)
  }

  render () {
    const { hover, target } = this.state
    const className = cx(styles.container, hover && styles.hover, target && styles.target)
    const childStyle = target ? { display: 'none' } : {}
    return (
      <div
        // className={styles.container}
        onDragEnter={this.handleDragEnter}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
        className={className}
        >
        <input
          // ref='file'
          className={styles.file}
          name='upload'
          type='file'
          ref='upload'
          onChange={this.handleChange}
        />
        <div style={childStyle}>{this.props.children}</div>
      </div>
    )
  }
}

FileDrop.propTypes = {
  onFile: PropTypes.any,
  children: PropTypes.any
}

export default FileDrop
