import React, {Component} from 'react'
// import PropTypes from 'prop-types'
// import ReactDOM from 'react-dom'
import { css } from 'emotion'
import { Button } from 'react-bootstrap'

const menuClass = css`
  display:flex;
  flex-direction: column;
  justify-content:space-around;
  align-items: stretch;
  width: 120px;
`

const buttonStyle = css`
  width: 100%;
  margin: 5px; /* or whatever */
`

class SideMenu extends Component {
  constructor (props) {
    super(props)
    this.actions = props.actions
    this.selectExample = this.props.selectExample
    this.handleButton = this.handleButton.bind(this)
  }

  handleButton (event) {
    const number = parseInt(event.currentTarget.value)
    this.selectExample(number)
  }

  render () {
    const className = this.props.className

    return (
      <div className={className} >
        <div className={menuClass} >
          <div>Select example:</div>
          <br />
          <Button onClick={this.handleButton} value='0' className={buttonStyle}> Appolo </Button>
          <br />
          <Button value='1' onClick={this.handleButton} className={buttonStyle}> MDN docs </Button>
          <br />
          <Button value='2' onClick={this.handleButton} className={buttonStyle}> 2.docx </Button>
          <br />
          <Button value='3' onClick={this.handleButton} className={buttonStyle}> Clear content </Button>
        </div>
      </div>
    )
  }
}

export default SideMenu
