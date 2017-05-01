import events,{ subscribe, publish } from '../../events'
import React, { Component } from 'react'
import request from '../../services/request'
import { render } from 'react-dom'
import ReactStars from 'react-stars'
import FontAwesome from 'react-fontawesome'
import '../../../node_modules/font-awesome/css/font-awesome.css'

class App extends Component {
  constructor() {
    super()
    this.state = {
      loading:true
    }
  }
  componentWillMount() {
  }
  componentDidMount() {
	  this.setState({loading:false})
	  publish('send', { silent: true, text: 'Loading Done' });
  }
  render() {
    return <div className="IBMChat-watson-message IBMChat-watson-message-theme">
      <span>Please give me a moment to process your request...</span>
    </div>
  }
}

module.exports = {
  init: () => {
    subscribe('layout:LoadTime', (data) => {
      data.layoutElement.className = '' // remove class from mount element
      let myParent = data.layoutElement.parentNode
      //console.log(myParent.childNodes[0]) // TODO pull data from current child and pass to component?
      if(myParent.childNodes[0] != undefined) myParent.removeChild(myParent.childNodes[0])
      var delayMillis = 2000; //2 seconds

	  setTimeout(function() {
	    //your code to be executed after 2 second
		  console.log("Should be printed after 2 seconds")
		  render(<App message={data.message}/>, data.layoutElement)
	  }, delayMillis);
      //render(<App message={data.message}/>, data.layoutElement)
    })
  }
}
