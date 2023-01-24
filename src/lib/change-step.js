const core = require('@actions/core');
const axios = require('axios');
async function changeStep(postendpoint, httpHeaders, payload) {
    let retryCount = 0;
    let overallTimerId;

    console.log("I'm postend point"+ postendpoint);
    console.log("I'm httpheaders point"+ httpHeaders);
    console.log("im pay laod "+payload);

    return new Promise((resolve, reject) => {
        // make the API call
        axios.post(postendpoint, payload, httpHeaders)
            .then(response => {
                // process the response
                console.log(JSON.stringify(response));
                clearTimeout(overallTimerId);
                resolve(response);
            })
            .catch(error => {
                console.log(error);
                if (retryCount < 1) {
                    retryCount++;
                    console.log("Retrying API call: ", retryCount);
                    setTimeout(() => changeStep(), 3000);
                } else {
                    console.log("Retry limit reached, stopping API call");
                    clearTimeout(overallTimerId);
                    reject(error);
                }
            });

        // start the overall timer
        overallTimerId = setTimeout(() => {
            console.log("Overall time limit reached, stopping API call");
            reject(new Error("Overall time limit reached, no response received"));
        }, 15000);
    });
}
module.exports = { changeStep };