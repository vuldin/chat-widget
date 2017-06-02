import events,{ subscribe, publish } from '../../events'
import React, { Component } from 'react'
import { findDOMNode, render } from 'react-dom'
import './style.css'
import request from 'superagent'
import { VictoryPie, VictoryLabel } from 'victory'

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
  componentWillUnmount() {
    // TODO
  }
  render() {
    return <div className='IBMChat-watson-message IBMChat-watson-message-theme' style={{display:'flex',flexFlow:'column'}}>
      <div style={{display:'flex', width: '370px'}}>
        {/*
          animate={{duration: 3000}}
          width={250}
          height={250}
          style={{labels: {fill: 'white'}}}
          width={200}
          height={200}
          labelComponent={<VictoryLabel
            style={{
              fontSize: '3px',
              fill: 'white',
            }}
          />}
        */}
        <VictoryPie
          data={this.state.apps}
          padding={{left: 80, right: 80}}
          colorScale={'qualitative'}
          style={{labels: {fill: 'white'}}}
          labelRadius={ 115 }
          labelComponent={<VictoryLabel
            style={{
              fontSize: '16px',
              fill: 'white',
            }}
          />}
          innerRadius={ 50 }
          events={[
            {
              target: 'labels',
              eventHandlers: {
                onClick: (evt, obj) => {
                  console.log(obj)
                }
              }
            }
          ]}
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
