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
      {label: 'Google Maps', value: 47},
      {label: 'Facebook', value: 15},
      {label: 'Safari', value: 11},
      {label: 'Messages', value: 3},
      {label: 'Other', value: 24}
    ]
    this.deviceText = `
|             |                                                    |
|-------------|----------------------------------------------------|
|Model        | Apple iPhone 6                                     |
|Installed OS | iOS                                                |
|CPU          | A7 chip with 64-bit architecture                   |
|Battery      | Built-in rechargeable 1560 mAh lithium-ion battery |
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
      <div>The real-time analysis resulted in:</div>
      <div style={{display:'flex'}}>
        <div style={{flex: 1, display:'flex',alignItems:'center'}} dangerouslySetInnerHTML={this.rawMarkup(this.deviceText)}/>
        <div style={{flex: 1}} ref={el => this.chartEl = el}/>
      </div>
      <div>Google Maps is using most of your battery. Try closing the app to improve battery performance.</div>
    </div>
  }
}

module.exports = {
  init: () => {
    subscribe('layout:pie-chart', data => {
      data.layoutElement.className = '' // remove class from mount element
      let myParent = data.layoutElement.parentNode
      //console.log(myParent.childNodes[0]) // TODO pull data from current child and pass to component?
      if(myParent.childNodes[0] != undefined) myParent.removeChild(myParent.childNodes[0])
      render(<App message={data.message}/>, data.layoutElement)
    })
  }
}
