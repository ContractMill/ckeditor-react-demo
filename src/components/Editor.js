import CKEditor from 'react-ckeditor-component'
import React from 'react'
import request from 'request-promise-native'
import { css } from 'emotion'
import { Button, Grid, Row, Col } from 'react-bootstrap'
import CKeditorInline from './CKEditorInline'
import $ from 'jquery'
import examples from './exapmples'

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

const footerEditor = css`
  border: 1px solid #aaa;
`

const footer = css`
  margin-top: 0px
`

const buttonStyle = css`
  font-size: x-large;
  margin-top: 50px;
`

function htmlOptimization (html) {
  html = html.replace(/&quot;/g, '')
  let jq = $(`<div>${html}</div>`)
  jq.find('div[style="page-break-after:always"]').replaceWith('<div>[pageBreak]</div>')
  $('<br>').appendTo(jq.find('span.lineHeightSpan'))
  let result = jq[0].outerHTML
  while (/<\/span><br><\/span>/.test(result)) {
    result = result.replace('</span><br></span>', '</span></span>')
  }
  return result
}

function sendDocumentAndGetLink (document) {
  try {
    return request.post({
      url: 'https://script.google.com/macros/s/AKfycbyu0p0OFLepWOk4mULxu-AMHjAkx_HXOyqGR4JfYAUTgD9RPoA/exec',
      followAllRedirects: true,
      form: document
    })
  } catch (err) {
    console.error('->', err)
  }
}

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.updateContent = this.updateContent.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onChangeHeader = this.onChangeHeader.bind(this)
    this.onChangeFooter = this.onChangeFooter.bind(this)
    this.onButtonClick = this.onButtonClick.bind(this)
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this)
    this.onCreateEditor = this.onCreateEditor.bind(this)
    this.editor = undefined // ?
    this.state = examples.apollo // body footer header
    window.$ = $
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
  }

  async onButtonClick () {
    console.log(this.state.body)
    let result = htmlOptimization(this.state.body)
    console.log(result)
    result = await sendDocumentAndGetLink({
      document: result,
      header: this.state.header,
      footer: this.state.footer
    })
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

  onChangeFooter (evt) {
    this.setState({
      footer: evt.editor.getData()
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
          <CKeditorInline // header
              activeClass={headerEditor}
              events={{ 'change': this.onChangeFooter }}
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
              content={this.state.body}
              events={{
                'change': this.onChange,
                'configLoaded': this.onCreateEditor
              }}
              config={{
                height: 500,
                autoGrow_minHeight: 350,
                autoGrow_maxHeight: 500,
                autoGrow_bottomSpace: 50,
                extraPlugins: 'autogrow,lineheight,enterkey,tabletoolstoolbar,autocorrect,colordialog,tableresize,stylesheetparser,googledocs,toc,docprops',
                enterMode: 2, // CKEDITOR.ENTER_BR,
                shiftEnterMode: 1, // CKEDITOR.ENTER_P,
                line_height: '1.0;1.5;2.0;2.5;3.0',
                fullPage: true
              }}
            />
          </Col>
        </Row>
        <Row activeClass={footer}>
          <Col mdOffset={2} md={8} sm={12}>
            <CKeditorInline // footer
              activeClass={footerEditor}
              events={{ 'change': this.onChangeFooter }}
              scriptUrl={'ckeditor/ckeditor.js'}
              config={{
                docType: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">',
                defaultLanguage: 'ru',
                height: 300
              }}
            >
              <p style={{'textAlign': 'right'}} >
                <span style={{'color': '#999999'}}>
                  Edit footer here
                </span>
              </p>
            </CKeditorInline>
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
