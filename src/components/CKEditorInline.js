import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
const loadScript = require('load-script')

var defaultScriptUrl = 'ckeditor/ckeditor.js'

class CKEditorInline extends React.Component {
  constructor (props) {
    super(props)

    // Bindings
    this.onLoad = this.onLoad.bind(this)

    // State initialization
    this.state = {
      isScriptLoaded: this.props.isScriptLoaded,
      config: this.props.config
    }
  }

  // load ckeditor script as soon as component mounts if not already loaded
  componentDidMount () {
    if (!this.props.isScriptLoaded) {
      loadScript(this.props.scriptUrl, this.onLoad)
    } else {
      this.onLoad()
    }
  }

  componentWillUnmount () {
    this.unmounting = true
  }

  onLoad () {
    if (this.unmounting) return

    this.setState({
      isScriptLoaded: true
    })

    if (!window.CKEDITOR) {
      console.error('CKEditor not found')
      return
    }

    this.editorInstance = window.CKEDITOR.inline(
      ReactDOM.findDOMNode(this),
      this.state.config
    )
    // ReactDOM.findDOMNode(this).innerHTML = this.props.children

    // Register listener for custom events if any
    for (var event in this.props.events) {
      var eventHandler = this.props.events[event]

      this.editorInstance.on(event, eventHandler)
    }
  }

  render () {
    return (<div contentEditable='true' className={this.props.activeClass} >
      { this.props.children }
    </div>)
  }
}

CKEditorInline.defaultProps = {
  content: '',
  config: {},
  isScriptLoaded: false,
  scriptUrl: defaultScriptUrl,
  activeClass: '',
  events: {}
}

CKEditorInline.propTypes = {
  content: PropTypes.any,
  config: PropTypes.object,
  isScriptLoaded: PropTypes.bool,
  scriptUrl: PropTypes.string,
  activeClass: PropTypes.string,
  events: PropTypes.object,
  children: PropTypes.any
}

export default CKEditorInline
