async function createStep({
    postendpoint,
    payload,
    httpHeaders
  }){

    let options = {
        method: "POST",
        headers: httpHeaders,
        body: payload
      };


    let retryCount = 0;
    let overallTimerId;
    
      // make the API call
      fetch(postendpoint, options)
        .then(response => {
          // process the response
          console.log(response);
          console.log(JSON.stringify(response));
          clearTimeout(overallTimerId);
        }).catch(error => {
            console.log(error);
            if (retryCount < 3) {
              retryCount++;
              console.log("Retrying API call: ", retryCount);
              setTimeout(() => makeApiCall(), 3000);
            } else {
              console.log("Retry limit reached, stopping API call");
              clearTimeout(overallTimerId);
            }
          });
          
          overallTimerId = setTimeout(() => {
            console.log("Overall time limit reached, stopping API call");
          }, 15000);




  }
  module.exports = {createStep};