/* global FileReader */

import React, { Component } from 'react'
import { css, cx } from 'emotion'
import PropTypes from 'prop-types'
import request from 'request-promise-native'

import SideMenu from './SideMenu'

import htmlFixer from './helper'

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

const menu = css`
  height: 100%;
  width: 0;
  position: absolute;
`

async function docxToHtmlConver (arrayBuffer, file) {
  let formData = {
    docFile: arrayBufferToBase64(arrayBuffer),
    options: {
      mimeType: file.type,
      name: file.name
    }
  }
  let params = {
    url: 'https://script.google.com/macros/s/AKfycbwoWFWecEVJ7wLGoWtAbcT_jex48Ovp7bxm0HFjwtsxlzKpckoZ/exec',
    followAllRedirects: true,
    form: formData
  }
  console.log(params)
  let result = await request.post(params)
  console.log('Result:', result)
  return result
}

function arrayBufferToBase64 (buffer) {
  let binary = ''
  let bytes = new Uint8Array(buffer)
  bytes.map(byte => { binary += String.fromCharCode(byte) })
  return window.btoa(binary)
}

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
    var reader = new FileReader()

    reader.onload = (e) => {
      console.log(e)
      const arrayBuffer = e.target.result
      console.log(arrayBuffer)

      try {
        docxToHtmlConver(arrayBuffer, file).then(link => {
          const options = {
            url: 'https://zmeu213.unit.run/1-19?key=jA2zefFhS0q30Lc3YyhCaP46o0vACB3W',
            form: {
              link: link
            }
          }
          console.log(options)
          request.post(options).then(async html => {
            console.log('->', html)
            let fixedHtml = await htmlFixer(html)
            console.log('-->', fixedHtml)
            file.content = fixedHtml
            this.props.onFile && this.props.onFile(file)
          })
        })
      } catch (err) {
        console.error(err)
      }
    }

    reader.readAsArrayBuffer(file.file)
  }

  render () {
    const { hover, target } = this.state
    const className = cx(styles.container, hover && styles.hover, target && styles.target)
    const childStyle = target ? { display: 'none' } : {}

    return (
      <div
        onDragEnter={this.handleDragEnter}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
        className={className}
      >
        <input
          className={styles.file}
          name='upload'
          type='file'
          ref='upload'
          onChange={this.handleChange}
        />
        <SideMenu className={menu} selectExample={this.props.selectExample} />
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
