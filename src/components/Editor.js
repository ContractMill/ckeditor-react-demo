import CKEditor from 'react-ckeditor-component'
import React from 'react'
import request from 'request-promise-native'
import { css } from 'emotion'
import { Button, Grid, Row, Col } from 'react-bootstrap'
import CKeditorInline from './CKEditorInline'

const editorBlock = css`
  margin-right: auto;
  margin-left: auto;
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
`

const headerEditor = css`
  border: 1px solid #aaa; 
  margin-top: 50px;
`

const buttonStyle = css`
  font-size: x-large;
  margin-top: 50px;
`

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.updateContent = this.updateContent.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onChangeHeader = this.onChangeHeader.bind(this)
    this.onButtonClick = this.onButtonClick.bind(this)
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this)
    this.onCreateEditor = this.onCreateEditor.bind(this)
    this.editor = undefined
    this.state = {
      content: 'Document content',
      header: ''
    }
  }

  updateContent (newContent) {
    this.setState({
      content: newContent
    })
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      file: nextProps.file,
      content: nextProps.file.content
    })
    this.editor.setData(nextProps.file.content)
    // this.forceUpdate()
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

  onCreateEditor (evt) {
    this.editor = evt.editor
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
      <Grid className={editorBlock}>
        <Row>
          <Col mdOffset={2} md={8} sm={12}>
            <CKeditorInline
              activeClass={headerEditor}
              // content={'Edit header here'}
              events={{
                'change': this.onChangeHeader
              }}
              scriptUrl={'ckeditor/ckeditor.js'}
              config={{
                docType: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">',
                defaultLanguage: 'ru',
                height: 150
              }}
            >
              <p style={{'textAlign': 'right'}} >
                <span style={{'color': '#999999'}}>
                  Edit header here
                </span>
              </p>
            </CKeditorInline>
          </Col>
        </Row>
        <Row>
          <Col mdOffset={2} md={8} sm={12}>
            <CKEditor
              scriptUrl={'ckeditor/ckeditor.js'}
              // activeClass={editorSection}
              content={this.state.content}
              events={{
                'change': this.onChange,
                'configLoaded': this.onCreateEditor
              }}
              config={{
                height: 350,
                autoGrow_minHeight: 350,
                // autoGrow_maxHeight: 600,
                autoGrow_bottomSpace: 50
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Button
              onClick={this.onButtonClick}
              className={buttonStyle}
            >
              Dowload DOCX
            </Button>
          </Col>
        </Row>
      </Grid>
    )
  }
}
