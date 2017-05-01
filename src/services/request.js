export default function(url, data) {
  return new Promise(function(resolve,reject){
    let xhr = new XMLHttpRequest()
    let params = ''
    for(let key in data) params += '&'+key+'='+data[key]
    xhr.open('POST',url)
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded')
    xhr.setRequestHeader('Accept','application/json')
    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4 && xhr.status === 200) resolve(xhr.response)
    }
    xhr.send(params)
  })
}
