import events,{ subscribe, publish } from '../../events'
import React, { Component } from 'react'
import { findDOMNode, render } from 'react-dom'
import D3PieChart from './d3PieChart'
import marked from 'marked'
import './style.css'
import request from 'superagent'
import { VictoryPie } from 'victory'
//import 'regenerator-runtime/runtime'
import pieData from './data.json'

class App extends Component {
  /*
  getData = async () => {
    let cciData = await Promise.all([
      request.get('http://172.27.12.35:6001/history'),
      request.get('http://172.27.12.35:6001/profile')
    ])
    let apps = []
    let result = []
    cciData[0].body.forEach( day => {
      let counters = day.metrics.filter( metric => metric.metricId == 'ibmaaf_bytestotal_by_application')[0].counters
      counters.forEach( counter => {
        let done = false
        apps.forEach( app => {
          if(app.x == counter.breakdown) {
            //console.log('match', app.x, counter.breakdown)
            app.y += counter.value[0]
            done = true
          }
        })
        //console.log(done)
        if(!done) {
          //console.log('creating', counter.breakdown)
          apps.push({
            x: counter.breakdown,
            y: counter.value[0],
          })
        }
      })
    })
    apps.forEach( app => app.y = Math.round( app.y * 100 + Number.EPSILON ) / 100) // https://stackoverflow.com/a/41716722/2316606
    return apps
  }
  */
  getData = () => {
    Promise.all([
      request.get('http://172.27.12.35:6001/history'),
      request.get('http://172.27.12.35:6001/profile'),
    ]).then(([history, profile]) => {
      let apps = []
      let result = []
      history.body.forEach( day => {
        let counters = day.metrics.filter( metric => metric.metricId == 'ibmaaf_bytestotal_by_application')[0].counters
        //let counters = day.metrics.filter( metric => metric.metricId == 'ibmaaf_bytestotal_by_cell_sitename')[0].counters
        counters.forEach( counter => {
          let done = false
          apps.forEach( app => {
            if(app.x == counter.breakdown) {
              //console.log('match', app.x, counter.breakdown)
              app.y += counter.value[0]
              done = true
            }
          })
          //console.log(done)
          if(!done) {
            //console.log('creating', counter.breakdown)
            apps.push({
              x: counter.breakdown,
              y: counter.value[0],
            })
          }
        })
      })
      apps.forEach( app => app.y = Math.round( app.y * 100 + Number.EPSILON ) / 100) // https://stackoverflow.com/a/41716722/2316606
      this.setState({
        //history: history.body,
        //profile: history.body,
        apps: apps,
      })
    })
  }
  constructor() {
    super()
    //let apps = this.getData()
    this.state = {
      //history: [],
      //profile: [],
      apps: [
        {x: '', y: 0},
        {x: '', y: 0},
        {x: '', y: 0},
        {x: '', y: 0},
        {x: '', y: 0},
        {x: '', y: 0},
        {x: '', y: 0},
        {x: '', y: 0},
        {x: '', y: 0},
        {x: '', y: 0},
      ],
      //apps: apps,
    }
    this.getData()
    /*
    this.deviceText = `
| Application | MB                    | %                        |
|-------------|-----------------------|--------------------------|
| YouTube     | 1,125                 | 60.6%                    |
| Facebook    | 356                   | 19.2%                    |
| WhatsApp    | 289                   | 15.6%                    |
| Twitter     | 87                    | 4.7%                     |
`
    */
  }
  componentDidMount() {
    publish('send', {silent: true, text: 'piechart done'})
  }
  rawMarkup(content) {
    return {__html: marked(content,{ sanitize:true })}
  }
  render() {
    console.log(this.state.apps)
    return <div className='IBMChat-watson-message IBMChat-watson-message-theme' style={{display:'flex',flexFlow:'column'}}>
      <div>Here is your data usage information.</div>
      <div style={{display:'flex'}}>
        {/*
        <div style={{flex: 1,alignItems:'center'}}>
          <div style={{flex: 1,display:'flex',alignItems:'center'}}>Mobile Application Usage  - Top Apps - 1 Jan 2017 - 31 Jan 2017</div>
          <div style={{flex: 1, display:'flex',alignItems:'center'}} dangerouslySetInnerHTML={this.rawMarkup(this.deviceText)}/>
        </div>
        <div style={{flex: 1,alignItems:'center'}}>
          <div style={{flex: 1,display:'flex',alignItems:'center',textAlign:'center'}}> Mobile Data Usage - Top Apps (MB)</div>
        </div>
        */}
        {/*
        <VictoryPie
          data={pieData}
        />
        */}
        <VictoryPie
          data={this.state.apps}
          animate={{duration: 3000}}
        />
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
