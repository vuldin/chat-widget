import events,{ subscribe, publish } from '../../events'
import React, { Component } from 'react'
import { findDOMNode, render } from 'react-dom'
import marked from 'marked'
import './style.css'


class App extends Component {
  constructor() {
    super()
    this.planText = `
|                        |                                                     |
|------------------------|-----------------------------------------------------|
|Mobility Profile        | Home User                                           |
|Service Usage Profile   | Big Data                                            |
|Data Usage              | 700MB 							                   |
|price/MB                | $0.25											   |
`
this.planText2 = `
|               Fixed and Mobile Dual 500GB                        |
|---------------------|--------------------------------------------|
|                     |											   |
|Wireline Service     | 100Mbps 							       |
|Traffic Cap          | 500GB                                      |
|Mobile voice mins    | 100										   |
`
  }
  componentDidMount() {
    publish('send', {silent: true, text: 'planSuggest done'})
  }
  
  rawMarkup(content) {
    return {__html: marked(content,{ sanitize:true })}
  }
  render() {
	    return <div className='IBMChat-watson-message IBMChat-watson-message-theme' style={{display:'flex',flexFlow:'column'}}>
	        <div><p></p><p></p></div>
	        <div>The following Tariff may suit your needs better:  </div>
	        <div style={{flex: 2,display:'flex',alignItems:'center'}} className="newTable" dangerouslySetInnerHTML={this.rawMarkup(this.planText2)}/>  
	        
	    </div>
	  }
  /*render() {
    return <div className='IBMChat-watson-message IBMChat-watson-message-theme'>
      <div>Analyzing your current usage history you fall under the user category :</div>
        <div style={{flex: 1,alignItems:'center'}} dangerouslySetInnerHTML={this.rawMarkup(this.planText)}/>    
    </div>
    </div>
    <div className='IBMChat-watson-message IBMChat-watson-message-theme'>  
      <div>We notice that you are enjoying a high amount of data and using your service regularly at home. The following Tariff may suit your needs better:  </div>
      <div style={{flex: 2,alignItems:'center'}} dangerouslySetInnerHTML={this.rawMarkup(this.planText2)}/>    
  </div>
      </div>
  }*/
}

module.exports = {
  init: () => {
    subscribe('layout:planSuggest', data => {
      data.layoutElement.className = '' // remove class from mount element
      let myParent = data.layoutElement.parentNode
      //console.log(myParent.childNodes[0]) // TODO pull data from current child and pass to component?
      if(myParent.childNodes[0] != undefined) myParent.removeChild(myParent.childNodes[0])
      render(<App message={data.message}/>, data.layoutElement)
    })
  }
}
