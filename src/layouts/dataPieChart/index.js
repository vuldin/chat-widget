import events,{ subscribe, publish } from '../../events'
import React, { Component } from 'react'
import { findDOMNode, render } from 'react-dom'
import D3PieChart from './d3PieChart'
import marked from 'marked'
import './style.css'

class App extends Component {
  constructor() {
    super()
    this.d3Chart = new D3PieChart()
    this.margin = {
      top: 0,
      right: 20,
      bottom: 0,
      left: 20
    }
    this.height = 375
    this.data = [
	  {label:'Facebook',value:19.2},//HTTP Browsing
      {label:'YouTube',value:60.6},
      
      //{label: 'NTP', value: 0.00011188},
      //{label:'Yahoo Webmail',value:0.000344473},
      //{label:'Gmail',value:0.000359194},
      //{label:'Facebook',value:0.000974534},
      //{label:'Youtube Video',value:0.001229209},
      //{label:'flurry analytics',value:0.005202424},
      //{label:'googleanalytics',value:0.008399839},
      {label:'WhatsApp',value:15.6},//GoogleTalk
      {label:'Twitter',value:4.7}//Google
      //{label:'D',value:0.21},//DNS
      //{label:'',value:0.75},//HTTPS
      //{label:'Twitter',value:2.9}
      
      
         
      //{label:'Others',value:0}
    ]
    this.deviceText = `
| Application | MB                    |    %                     |
|-------------|-----------------------|--------------------------|
|YouTube      | 1,125                 |60.6%                     |
|Facebook     | 356                   |19.2%                     |
|WhatsApp     | 289 			      |15.6%			         |
|Twitter      |87                     |4.7%						 |

`
  }
  componentDidMount() {
    let el = this.chartEl
    let chartState = this.getChartState()
    this.d3Chart.create(el, {
      width: el.offsetWidth,
      height: this.height,
      margin: this.margin
    }, chartState)
    publish('send', {silent: true, text: 'piechart done'})
  }
  getChartState() {
    return this.data
  }
  rawMarkup(content) {
    return {__html: marked(content,{ sanitize:true })}
  }
  render() {
    return <div className='IBMChat-watson-message IBMChat-watson-message-theme' style={{display:'flex',flexFlow:'column'}}>
      <div>Here is your data usage information.</div>
      <div style={{display:'flex'}}>
        ​​<div style={{flex: 1,alignItems:'center'}}>
        <div style={{flex: 1,display:'flex',alignItems:'center'}}>Mobile Application Usage  - Top Apps - 1 Jan 2017 - 31 Jan 2017</div>
        <div style={{flex: 1, display:'flex',alignItems:'center'}} dangerouslySetInnerHTML={this.rawMarkup(this.deviceText)}/>
        ​​</div>
        <div style={{flex: 1,alignItems:'center'}}>
        <div style={{flex: 1,display:'flex',alignItems:'center',textAlign:'center'}}> Mobile Data Usage - Top Apps (MB)</div>
        <div style={{flex: 1,display:'flex'}} ref={el => this.chartEl = el}/></div>
      </div>
      <div>I see large amount of YouTube which consumes a lot of data and resulted in you exceeding your data cap by approx. 0.9GB.Do you want my recommendations?</div>
    </div>
  }
}

module.exports = {
  init: () => {
    subscribe('layout:dataPieChart', data => {
      data.layoutElement.className = '' // remove class from mount element
      let myParent = data.layoutElement.parentNode
      //console.log(myParent.childNodes[0]) // TODO pull data from current child and pass to component?
      if(myParent.childNodes[0] != undefined) myParent.removeChild(myParent.childNodes[0])
      render(<App message={data.message}/>, data.layoutElement)
    })
  }
}
