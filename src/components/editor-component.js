import CKEditor from 'react-ckeditor-component'
import React from 'react'
import request from 'request-promise-native'

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.updateContent = this.updateContent.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onChangeHeader = this.onChangeHeader.bind(this)
    this.onButtonClick = this.onButtonClick.bind(this)
    this.state = {
      content: 'content',
      header: ''
    }
  }

  updateContent (newContent) {
    this.setState({
      content: newContent
    })
  }

  async onButtonClick () {
    let result
    try {
      result = await request.post({
        url: 'https://script.google.com/macros/s/AKfycbyu0p0OFLepWOk4mULxu-AMHjAkx_HXOyqGR4JfYAUTgD9RPoA/exec',
        followAllRedirects: true,
        form: {
          document: this.state.content,
          header: this.state.header,
          footer: 0
        }
      })
    } catch (err) {
      console.error('->', err)
    }
    console.log('[RESULT]: ', result)
    window.location.href = result
  }

  onChange (evt) {
    const newContent = evt.editor.getData()
    this.updateContent(newContent)
  }

  onChangeHeader (evt) {
    this.setState({
      header: evt.editor.getData()
    })
  }

  onBlur (evt) {
    // console.log('onBlur event called with event info: ', evt)
  }

  afterPaste (evt) {
    // console.log('afterPaste event called with event info: ', evt)
  }

  render () {
    return (
      <div>
        <h2>Header</h2>
        <CKEditor
          activeClass='cke4-inline__anchor cke_editable cke_editable_inline cke_contents_ltr cke_show_borders'
          content={'Edit header here'}
          events={{
            'change': this.onChangeHeader
          }}
        />
        <h2>Main section</h2>
        <CKEditor
          content={this.state.content}
          events={{
            'change': this.onChange
          }}
        />
        <button onClick={this.onButtonClick}>Save</button>
      </div>
    )
  }
}
