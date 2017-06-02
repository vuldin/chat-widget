import events,{ subscribe, publish } from '../../events'
import React, { Component } from 'react'
import { findDOMNode, render } from 'react-dom'
import marked from 'marked'
import './style.css'
import request from 'superagent'

class App extends Component {
	state = {
		    apps: [],
		    profile: {},
		    totalData: 0,
		  }

	setStateAsync(state) {
		    return new Promise( resolve => {
		      this.setState(state, resolve)
		    })
		  }
	
	async componentDidMount() {
		let totalData = 0
	    let cciData = await Promise.all([
	      request.get('http://172.27.12.35:6001/history'),
	      request.get('http://172.27.12.35:6001/profile')
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
	            totalData += counter.value[0]
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
	    await this.setStateAsync({profile: cciData[1].body})
	    await this.setStateAsync({totalData:totalData})
	    publish('send', {silent: true, text: 'piechart done'})
	  }
	
  
  render() {
	let profile = this.state.profile[0]
	let result = <div/>
    console.log("profile", this.state.profile)
    if(profile != undefined) result = <div className='IBMChat-watson-message IBMChat-watson-message-theme' style={{display:'flex',flexFlow:'column'}}>
	      <div>Here is your data usage information:</div>
	      <ul>
	      	<li>Data used this month is {this.state.totalData} </li> 
	      	<li>Your monthly allowance: {profile.data_offering} gb/month.</li>
	      	<li>Your data plan is {profile.plan_name}</li>
	      </ul>
	    </div>
	return result
  }
}

module.exports = {
  init: () => {
    subscribe('layout:dataUsage', data => {
      data.layoutElement.className = '' // remove class from mount element
      let myParent = data.layoutElement.parentNode
      //console.log(myParent.childNodes[0]) // TODO pull data from current child and pass to component?
      if(myParent.childNodes[0] != undefined) myParent.removeChild(myParent.childNodes[0])
      render(<App message={data.message}/>, data.layoutElement)
    })
  }
}
