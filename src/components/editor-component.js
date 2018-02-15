import CKEditor from 'react-ckeditor-component'
import React from 'react'
import request from 'request-promise-native'
import { css } from 'emotion'
import { Button, Grid, Row, Col } from 'react-bootstrap'

const editorBlock = css`
  margin-right: auto;
  margin-left: auto;
  padding-left: 10px;
  padding-right: 10px;
  max-width: 1680px;
`

const editorSection = css`
  margin-bottom: 1rem;
  
  border: 1px solid rgba(0,0,0,.15);
  display: inline-block;
`

const buttonStyle = css`
  font-size: x-large;
`

const sectionTitle = css`
  position: absolute;
`

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.updateContent = this.updateContent.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onChangeHeader = this.onChangeHeader.bind(this)
    this.onButtonClick = this.onButtonClick.bind(this)
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
      <Grid className={editorBlock}>
        <Row>
          <Col md={2} sm={12}>
            <h3>Header</h3>
          </Col>
          <Col md={8} sm={12}>
            <CKEditor
              activeClass={editorSection}
              content={'Edit header here'}
              events={{
                'change': this.onChangeHeader
              }}
              config={{
                docType: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">',
                defaultLanguage: 'ru',
                // extraPlugins: 'autogrow',
                autoGrow_minHeight: 200,
                autoGrow_maxHeight: 600,
                autoGrow_bottomSpace: 50
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col md={2} sm={12}>
            <h3>Main section</h3>
          </Col>
          <Col md={8} sm={12}>
            <CKEditor
              activeClass={editorSection}
              content={this.state.content}
              events={{
                'change': this.onChange
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
