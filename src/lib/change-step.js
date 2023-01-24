const core = require('@actions/core');
const axios = require('axios');

async function createStep({
    postendpoint,
    payload,
    httpHeaders
  }){
    
    var response;
    let options = {
        method: "POST",
        headers: httpHeaders,
        body: payload
      };
     try{
      response = await axios.post(postendpoint, JSON.stringify(payload), httpHeaders);
     }
     catch(err){
       console.log(err);
     }

    return response;

  }
  module.exports = {createStep};