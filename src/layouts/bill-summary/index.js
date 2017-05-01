import events,{ subscribe, publish } from '../../events'
import React, { Component } from 'react'
import { render } from 'react-dom'
import D3BarChart from './../../charts/d3BarChart'
import './style.css'
import Table from 'rc-table'
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
    this.columns = [
      { title: 'Type', dataIndex: 'type', key:'type', width: 100,},
      { title: 'Cost', dataIndex: 'cost', key:'cost', width: 50,},
      { title: 'Count', dataIndex: 'count', key:'count', width: 100,},
      { title: 'Duration', dataIndex: 'duration', key:'duration', width: 200, render: duration => {
        let result = ''
        if(duration.hours() != 0) result += `${duration.hours()} hours, `
        if(duration.minutes() != 0) result += `${duration.minutes()} minutes, `
        if(duration.seconds() != 0) result += `${duration.seconds()} seconds`
        if(result.length == 0) result = 'none'
        return result
      }}
    ]
    this.columnsData = [{ title: 'Data', dataIndex: 'Data', key:'Data', width: 100,},
                        { title: 'Cost', dataIndex: 'cost', key:'cost', width: 50,}]
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
  }
  componentWillMount() {
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
    // cost chart
    let costEl = this.costChartEl
    this.d3Chart.create(costEl, {
      width: costEl.offsetWidth,
      height: this.height,
      margin: this.margin,
      labels: {
        title: 'Cost',
        x: 'Month',
        y: '$'
      }
    }, [
      {
        key: this.prevBill.Month,
        val: this.totalCost[this.currentIndex - 1],
        unit: '$'
      },
      {
        key: this.currentBill.Month,
        val: this.totalCost[this.currentIndex],
        unit: '$'
      }
    ])
    // count chart
    let countEl = this.countChartEl
    this.d3Chart.create(countEl, {
      width: countEl.offsetWidth,
      height: this.height,
      margin: this.margin,
      labels: {
        title: 'Count',
        x: 'Month',
        y: '#'
      }
    }, [
      {
        key: this.prevBill.Month,
        val: this.totalCount[this.currentIndex - 1],
        unit: 'calls'
      },
      {
        key: this.currentBill.Month,
        val: this.totalCount[this.currentIndex],
        unit: 'calls'
      }
    ])
    // duration chart
    let durationEl = this.durationChartEl
    this.d3Chart.create(durationEl, {
      width: durationEl.offsetWidth,
      height: this.height,
      margin: this.margin,
      labels: {
        title: 'Duration',
        x: 'Month',
        y: '◴'
      }
    }, [
      {
        key: this.prevBill.Month,
        val: this.totalDuration[this.currentIndex - 1].asMinutes().toFixed(2),
        unit: 'minutes'
      },
      {
        key: this.currentBill.Month,
        val: this.totalDuration[this.currentIndex].asMinutes().toFixed(2),
        unit: 'minutes'
      }
    ])
    publish('send', {silent: true, text: 'bill summary done'})
  }
  render() {
    let dataPlan = [{'cost': this.currentBill.plan.Data.Cost, 'Data': this.currentBill.plan.Data.Name}]

    return <div className='IBMChat-watson-message IBMChat-watson-message-theme' style={{display:'flex',flexFlow:'column'}}>
      <div>Here is a summary of your bill for the month of {this.currentBill.Month}:</div>
      <Table columns={this.columns} data={this.currentBill.summaries} />
      
      <div style={{marginTop: '15px'}}></div>
      <Table columns={this.columnsData} data={dataPlan} />
      <div style={{marginTop: '5px'}}>Here are some comparisons with your previous bill:</div>
      <div style={{display:'flex',marginTop: '5px'}}>
        <div style={{flex: 1, display: 'flex', flexFlow: 'column'}}>
          <div style={{textAlign: 'center'}}>Cost</div>
          <div style={{flex: 'auto'}} ref={el => this.costChartEl = el}/>
        </div>
        <div style={{flex: 1, display: 'flex', flexFlow: 'column'}}>
          <div style={{textAlign: 'center'}}>Count</div>
          <div style={{flex: 1}} ref={el => this.countChartEl = el}/>
        </div>
        <div style={{flex: 1, display: 'flex', flexFlow: 'column'}}>
          <div style={{textAlign: 'center'}}>Duration</div>
          <div style={{flex: 1}} ref={el => this.durationChartEl = el}/>
        </div>
      </div>
      <div>Is there anything else I can help with?</div>
    </div>
  }
}

module.exports = {
  init: () => {
    subscribe('layout:bill-summary', data => {
      data.layoutElement.className = '' // remove class from mount element
      let myParent = data.layoutElement.parentNode
      //console.log('sibling elements', myParent.childNodes[0])
      // TODO pull data from current child and pass to component?
      if(myParent.childNodes[0] != undefined) myParent.removeChild(myParent.childNodes[0])
      render(<App context={data.message.context}/>, data.layoutElement)
    })
  }
}
