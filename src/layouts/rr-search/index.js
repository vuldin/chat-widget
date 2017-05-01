import events,{ subscribe, publish } from '../../events'
import React, { Component } from 'react'
import request from '../../services/request'
import { render } from 'react-dom'
import ReactStars from 'react-stars'
import FontAwesome from 'react-fontawesome'
import '../../../node_modules/font-awesome/css/font-awesome.css'

class App extends Component {
  constructor() {
    super()
    this.state = {
      response: '', // TODO remove?
      docs: [],
      index: 0,
    }
  }
  componentWillMount() {
    //console.log('data from conversation', this.props.message)
    /*
    request('https://devicedocapi.mybluemix.net/rr',{input: this.props.message.text[0]})
      .then( res => {
        res = JSON.parse(res)
        this.setState({response: res, docs: res.response.docs, index: 0})
        this.state.ready = true
      })
    */
    // TODO remove deprecated XMLHttpRequest code below
    let url ='https://devicedocapi.mybluemix.net/rr'
    let data = {input: this.props.message.text[0]}
    let xhr = new XMLHttpRequest()
    let params = ''
    for(let key in data) params += '&'+key+'='+data[key]
    xhr.open('POST', url, false)
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded')
    xhr.setRequestHeader('Accept','application/json')
    xhr.send(params)
    let response = JSON.parse(xhr.response)
    this.setState({response: response, docs: response.response.docs})
  }
  componentDidMount() {
    publish('send', { silent: true, text: 'rr done' })
  }
  render() {
    let doc = this.state.docs[this.state.index]
    console.log('docs length on render',this.state.docs.length)
    let result = <div/>
    let inactiveColor = 'grey'
    let activeColor = '#ae72e5'
    if(doc != undefined) result = <div className='IBMChat-watson-message IBMChat-watson-message-theme'>
      <div>{doc.answer[0]}</div>
      <div style={{display: 'flex', marginTop: '5px'}}>
        <div style={{flex: 'auto', color: inactiveColor}}>{`${(doc['ranker.confidence']*100).toFixed(2)}% confidence`}</div>
        <div style={{flex: 'auto', display: 'flex'}}>
          <div style={{textDecoration: 'underline', color: inactiveColor, cursor: 'pointer'}} onClick={() => window.open(doc.url[0])}>full document</div>
          <FontAwesome name='external-link-square' style={{flex: 'auto', marginLeft: '5px'}}/>
        </div>
        <ReactStars style={{flex: 'auto'}} count={5} color1={inactiveColor} color2={activeColor}/>
      </div>
    </div>
    return result
  }
}

module.exports = {
  init: () => {
    subscribe('layout:rr-search', (data) => {
      data.layoutElement.className = '' // remove class from mount element
      let myParent = data.layoutElement.parentNode
      //console.log(myParent.childNodes[0]) // TODO pull data from current child and pass to component?
      if(myParent.childNodes[0] != undefined) myParent.removeChild(myParent.childNodes[0])
      render(<App message={data.message}/>, data.layoutElement)
    })
  }
}
