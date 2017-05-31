import events,{ subscribe, publish } from '../../events'
import React, { Component } from 'react'
import { findDOMNode, render } from 'react-dom'
import D3PieChart from './d3PieChart'
import marked from 'marked'
import './style.css'
import request from 'superagent'
import { VictoryPie } from 'victory'

class App extends Component {
  state = {
    apps: [],
  }
  setStateAsync(state) {
    return new Promise( resolve => {
      this.setState(state, resolve)
    })
  }
  async componentDidMount() {
    let cciData = await Promise.all([
      request.get('http://172.27.12.35:6001/history'),
      //request.get('http://172.27.12.35:6001/profile')
    ])
    let apps = []
    cciData[0].body.forEach( day => {
      let counters = day.metrics.filter( metric => metric.metricId == 'ibmaaf_bytestotal_by_application')[0].counters
      //let counters = day.metrics.filter( metric => metric.metricId == 'ibmaaf_bytestotal_by_cell_sitename')[0].counters
      counters.forEach( counter => {
        let done = false
        apps.forEach( app => {
          if(app.x == counter.breakdown) {
            app.y += counter.value[0]
            done = true
          }
        })
        if(!done) apps.push({
          x: counter.breakdown,
          y: counter.value[0],
        })
      })
    })
    apps.forEach( app => app.y = Math.round( app.y * 100 + Number.EPSILON ) / 100) // https://stackoverflow.com/a/41716722/2316606
    await this.setStateAsync({apps: apps})
    publish('send', {silent: true, text: 'piechart done'})
  }
  render() {
    return <div className='IBMChat-watson-message IBMChat-watson-message-theme' style={{display:'flex',flexFlow:'column'}}>
      <div style={{display:'flex'}}>
        {/*
          animate={{duration: 3000}}
          events={[
            {
              target: 'data',
              eventHandlers: {
                onClick: (evt, obj) => {
                  console.log(obj)
                }
              }
            }
          ]}
        */}
        {/*
          width={250}
          height={250}
          innerRadius={250 / 5}
        */}
        <VictoryPie
          data={this.state.apps}
          padding={{left: 80, right: 80}}
          labelRadius={ 400 / 3}
          colorScale={'qualitative'}
          style={{labels: {fill: 'white'}}}
        />
        {/*
        <div style={{
          justifyContent: 'center',
          color: 'white',
        }}>
          <span>{`test`}</span>
        </div>
        */}
      </div>
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
