const core = require('@actions/core');
const axios = require('axios');


function changeStep(postendpoint, payload, httpHeaders) {
    return new Promise((resolve, reject) => {
      axios.post(postendpoint, JSON.stringify(payload), httpHeaders)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  module.exports = { changeStep };