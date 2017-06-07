import events,{ subscribe, publish } from '../../events'
import React, { Component } from 'react'
import { findDOMNode, render } from 'react-dom'
import marked from 'marked'
import Table from 'rc-table'
import './style.css'


class App extends Component {
  constructor() {
    super()
    this.t1Columns = [
      { title: 'Feature', dataIndex: 'feature', key: 'feature', width: 300 },
      { title: 'Value', dataIndex: 'value', key: 'value', width: 200 },
    ]
    this.t1Data = [
      { key: 1, feature: 'Mobility Profile', value: 'Home User' },
      { key: 2, feature: 'Service Usage Profile', value: 'Big Data' },
      { key: 3, feature: 'Data Usage', value: '20GB' },
    ]
  }
  componentDidMount() {
    let div = findDOMNode(this.refs.psTable)
    let tbody = div.querySelector('tbody')
    tbody.style.background = 'darkslategrey'
    publish('send', {silent: true, text: 'planSuggest done'})
  }
  
  rawMarkup(content) {
    return {__html: marked(content,{ sanitize:true })}
  }
  render() {
	    return <div className='IBMChat-watson-message IBMChat-watson-message-theme' style={{display:'flex',flexFlow:'column'}}>
	        <div style={{fontWeight: 'bold', margin: '5px'}}>20gb LTE Data Plan</div>
          <Table
            ref='psTable'
            columns={this.t1Columns}
            data={this.t1Data}
            showHeader={false}
          />
	    </div>
	  }
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
