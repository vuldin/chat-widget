import events,{ subscribe, publish } from '../../events'
import React, { Component } from 'react'
import { render } from 'react-dom'
import './style.css'
import Table from 'rc-table'
import moment from 'moment'

class App extends Component {
  constructor() {
    super()
    this.margin = {
      top: 20,
      right: 0,
      bottom: 30,
      left: 20
    }
    this.height = 200
    this.columns = [
      { title: 'Date', dataIndex: 'Date', key:'date', width: 50,},
      { title: 'Destination', dataIndex: 'PhoneNumber', key:'destination', width: 50,},
      { title: 'Cost', dataIndex: 'Cost', key:'cost', width: 50,},
      { title: 'Duration', dataIndex: 'Duration', key:'duration', width: 200, render: duration => {
        /*
        let result = ''
        if(duration.hours() != 0) result += `${duration.hours()} hours, `
        if(duration.minutes() != 0) result += `${duration.minutes()} minutes, `
        if(duration.seconds() != 0) result += `${duration.seconds()} seconds`
        if(result.length == 0) result = 'none'
        */
        let result = duration
        return result
      }}
    ]
    this.calls = [ [], [], [] ]
    this.totalCost = [0, 0, 0]
    this.totalCount = [0, 0, 0]
    this.totalDuration = [moment.duration(0), moment.duration(0), moment.duration(0)]
    this.currentIndex = 0
  }
  setTotals(bill, time) {
    bill.summaries.forEach( summary => {
      summary.cost = summary.cost.toFixed(2)
      summary.duration = moment.duration(summary.duration, 'HH:mm:ss')
      this.totalCost[time] += +summary.cost
      this.totalCount[time] += summary.count
      this.totalDuration[time].add(summary.duration)
    })
    bill.Calls.forEach( call => {
      this.calls[time].push(call)
    })
  }
  componentWillMount() {
    console.log('componentWillMount', this.props.context)
    this.callType = this.props.context.call_type
    let bills = this.props.context.bills
    bills.forEach( (bill, i) => this.setTotals(bill, i))
    this.currentBill = bills.filter( (bill,i) => {
      let result = false
      if(bill.Month == this.props.context.month) {
        result = true
        this.currentIndex = i
      }
      return result
    })[0]
    this.prevBill = bills[this.currentIndex-1]
  }
  componentDidMount = () => {
    publish('send', {silent: true, text: 'bill detail done'})
  }
  render() {
    return <div className='IBMChat-watson-message IBMChat-watson-message-theme' style={{display:'flex',flexFlow:'column'}}>
      <div>Here are details of {this.callType} calls from your {this.currentBill.Month} bill:</div>
      <Table columns={this.columns} data={this.calls[this.currentIndex].filter(call => call.type == this.callType)} />
      <div>Is there anything else I can help with?</div>
    </div>
  }
}

module.exports = {
  init: () => {
    subscribe('layout:bill-detail', data => {
      data.layoutElement.className = '' // remove class from mount element
      let myParent = data.layoutElement.parentNode
      //console.log(myParent.childNodes[0]) // TODO pull data from current child and pass to component?
      if(myParent.childNodes[0] != undefined) myParent.removeChild(myParent.childNodes[0])
      render(<App context={data.message.context}/>, data.layoutElement)
    })
  }
}
