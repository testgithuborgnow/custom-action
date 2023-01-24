const core = require('@actions/core');
const axios = require('axios');
 async function changeStep( 
    toolId,
    username,
    passwd,
    jobname,
    githubContextStr,
    changeRequestDetailsStr,
    changeCreationTimeOut,
    abortOnChangeCreationFailure
    ){
    let retryCount = 0;
    let overallTimerId;

    console.log('im working');

    console.log('Calling Change Control API to create change....');

    let changeRequestDetails;




    try {
        console.log(changeRequestDetailsStr);
        changeRequestDetails = JSON.parse(changeRequestDetailsStr);
        
    } catch (e) {
        console.log(`Error occured with message changeRequestDetails ${e}`);
        throw new Error("Failed parsing changeRequestDetails");
    }

    let githubContext;

    try {
        console.log(changeRequestDetailsStr);
        githubContext = JSON.parse(githubContextStr);
    } catch (e) {
        console.log(`Error occured with message github context ${e}`);
        throw new Error("Exception parsing github context");
    }

    let payload;

    try {
        payload = {
            'toolId': toolId,
            'stageName': jobname,
            'buildNumber': `${githubContext.run_id}`,
            'attemptNumber': `${githubContext.run_attempt}`,
            'sha': `${githubContext.sha}`,
            'action': 'customChange',
            'workflow': `${githubContext.workflow}`,
            'repository': `${githubContext.repository}`,
            'branchName': `${githubContext.ref_name}`,
            'changeRequestDetails': changeRequestDetails
        };
    } catch (err) {
        console.log(`Error occured with message payload ${err}`);
        throw new Error("Exception preparing payload");
    }

    let postendpoint = `${instanceUrl}/api/sn_devops/devops/orchestration/changeControl?toolId=${toolId}&toolType=github_server`;
    let response;
    let status = false;
    const token = `${username}:${passwd}`;
    const encodedToken = Buffer.from(token).toString('base64');

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + `${encodedToken}`
    };
    let httpHeaders = { headers: defaultHeaders };

    
    console.log("we postend point"+ postendpoint);
    console.log("we httpheaders point"+ httpHeaders);
    console.log("we pay laod "+payload);


    // console.log("I'm postend point"+ postendpoint);
    // console.log("I'm httpheaders point"+ httpHeaders);
    // console.log("im pay laod "+payload);

    return new Promise((resolve, reject) => {

           axios.post(postendpoint, payload, httpHeaders)
            .then(response => {
                // process the response
                console.log(response);
                clearTimeout(overallTimerId);
                resolve(response);
            })
            .catch(error => {
                console.log(error);
                if (retryCount < 1) {
                    retryCount++;
                    console.log("Retrying API call: ", retryCount);
                    setTimeout(() => changeStep(toolId,
                        username,
                        passwd,
                        jobname,
                        githubContextStr,
                        changeRequestDetailsStr,
                        changeCreationTimeOut,
                        abortOnChangeCreationFailure
                        ), 3000);
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