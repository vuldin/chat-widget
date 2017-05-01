import events,{ subscribe, publish } from '../../events'
import React, { Component } from 'react'
import { render } from 'react-dom'
import D3BarChart from './../../charts/d3BarChart'
import './style.css'
import moment from 'moment'

class App extends Component {
  constructor() {
    super()
    this.d3Chart = new D3BarChart()
    this.margin = {
      top: 20,
      right: 0,
      bottom: 30,
      left: 20
    }
    this.height = 200
    this.currentIndex = 0
  }
  componentWillMount() {
    console.log('componentWillMount', this.props.context)
    let bills = this.props.context.bills
    this.currentBill = bills.filter( (bill,i) => {
      let result = false
      if(bill.Month == this.props.context.month) {
        result = true
        this.currentIndex = i
      }
      return result
    })[0]
    this.prevBill = bills[this.currentIndex - 1]
  }
  componentDidMount = () => {
    // duration chart
    let durationEl = this.durationChartEl
    this.d3Chart.create(durationEl, {
      width: durationEl.offsetWidth,
      height: this.height,
      margin: this.margin,
      labels: {
        title: 'TEST',
        x: 'Month',
        y: 'GB'
      }
    }, [
      {
        key: this.prevBill.Month,
        val: this.prevBill.plan.Data.UsedData,
        unit: 'GB'
      },
      {
        key: this.currentBill.Month,
        val: this.currentBill.plan.Data.UsedData,
        unit: 'GB'
      }
    ])
    publish('send', {silent: true, text: 'bill data done'})
  }
  render() {
    return <div className='IBMChat-watson-message IBMChat-watson-message-theme' style={{display:'flex',flexFlow:'column'}}>
      <div>Here is a summary of your data usage for the month of {this.currentBill.Month}:</div>
      <div style={{flex: 1, display: 'flex', flexFlow: 'column'}}>
        <div style={{textAlign: 'center'}}>Data usage</div>
        <div style={{flex: 1}} ref={el => this.durationChartEl = el}/>
      </div>
      <div>Is there anything else I can help with?</div>
    </div>
  }
}

module.exports = {
  init: () => {
    subscribe('layout:bill-data', data => {
      data.layoutElement.className = '' // remove class from mount element
      let myParent = data.layoutElement.parentNode
      //console.log(myParent.childNodes[0]) // TODO pull data from current child and pass to component?
      if(myParent.childNodes[0] != undefined) myParent.removeChild(myParent.childNodes[0])
      render(<App context={data.message.context}/>, data.layoutElement)
    })
  }
}
