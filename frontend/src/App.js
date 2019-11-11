import React, { useState } from 'react'
import axios from 'axios'

const App = ({ ...props }) => {

  const [s3Object, setS3Object] = useState('')

  const [data, setData] = useState('')

  const handleFileSelect = e => {
    let file = e.target.files[0]
    let formData = new FormData()
    formData.append('file', file)
    axios.post('http://localhost:3000/upload', formData, { headers: { 'Content-type': 'multipart/form-data' } })
         .then(data => {
           console.log(data.data)
         })

  }

  const handleInputS3Change = e => {
    setS3Object(e.target.value)
  }

  const handleS3Click = e => {
    axios.get(`http://localhost:3000/retrieve/${s3Object}`, { filename: s3Object })
         .then(data => {
           setData(data.data)
         })
  }

  return (
    <>
      <div>Static React App - S3 Test</div>
      <br/>
      <form>
        <input type='file'
               name='file'
               onChange={handleFileSelect}/>
      </form>
      <br/>
      <input onChange={handleInputS3Change}/>
      <button onClick={handleS3Click}>View {s3Object}</button>
      <br/>
      <br/>
      <div>
        <br/>
        <div>S3 Bucket item</div>
        {
          data && data.url && data.url.indexOf('txt') > -1
          ? <div>{data.value}</div>
          : <img src={data.url} style={{width:'100%'}}/>
        }
      </div>
    </>
  )

}

export default App
