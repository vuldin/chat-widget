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
    topLocation:''
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
      //let counters = day.metrics.filter( metric => metric.metricId == 'ibmaaf_bytestotal_by_application')[0].counters
      let counters = day.metrics.filter( metric => metric.metricId == 'ibmaaf_bytestotal_by_cell_sitename')[0].counters
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
    
    
     apps.sort(function(a, b) {
        //return parseFloat(a.y) - parseFloat(b.y);
    	 //let temp = a.y - b.y;
    	//return temp;
    	 if (a.y<b.y ) {
    		 console.log("comparing <",a.y,b.y)
    		    return 1;
    		  }
    		  if (a.y>b.y) {
    			  console.log("comparing >",a.y,b.y)
    		    return -1;
    		  }
    		  // a must be equal to b
    		  return 0;
    });
  
    //let topLocation ='Here'
    let topLocation =apps[0].x
    console.log("topLocation",topLocation)
    
    await this.setStateAsync({apps: apps,topLocation: topLocation})
    publish('send', {silent: true, text: 'piechart done'})
  }
  render() {
    return <div className='IBMChat-watson-message IBMChat-watson-message-theme' style={{display:'flex',flexFlow:'row'}}>
      <div style={{display:'flex'}}>
      <div>According to where you use your device the most, a majority of data usage occurred near {this.state.topLocation}. Does this location sound familiar to you?</div>
        
        {/*
        <VictoryPie
          data={this.state.apps}
          padding={{left: 80, right: 80}}
          labelRadius={ 400 / 3}
          colorScale={'qualitative'}
          style={{labels: {fill: 'white'}}}
        />*/}
      </div>
    </div>
  }
}

module.exports = {
  init: () => {
    subscribe('layout:topLocation', data => {
      data.layoutElement.className = '' // remove class from mount element
      let myParent = data.layoutElement.parentNode
      //console.log(myParent.childNodes[0]) // TODO pull data from current child and pass to component?
      if(myParent.childNodes[0] != undefined) myParent.removeChild(myParent.childNodes[0])
      render(<App message={data.message}/>, data.layoutElement)
    })
  }
}
