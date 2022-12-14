const core = require('@actions/core');
const axios = require('axios');

const main = async() => {
   let status = "NOT-STARTED";
   try{
    console.log('Custom Action - GET => START');    
    const instanceUrl = core.getInput('instance-url', { required: true });
    const username = core.getInput('devops-integration-user-name', { required: true });
    const passwd = core.getInput('devops-integration-user-password', { required: true });
    const jobName = core.getInput('job-name');
    const toolId = core.getInput('tool-id', { required: true });
    let changeDetailsStr = core.getInput('change-details', { required: true });
    let githubContextStr = core.getInput('context-github', { required: true });
    core.setOutput("status",status);
    try{

        console.log(JSON.stringify($(githubContext)));
        console.log('Calling Get Change Info API to get changeRequestNumber'); 
    
        let changeRequestDetails;
    
        try {
          changeRequestDetails = JSON.parse(changeDetailsStr);
        } catch (e) {
            console.log(`Unable to parse Error occured with message ${e}`);
            console.error("Failed parsing changeRequestDetails, please provide a valid JSON");
            return;
        }

        let buildNumber = changeRequestDetails.build_number;
        let pipelineName = changeRequestDetails.pipeline_name;
        let stageName = changeRequestDetails.stage_name;        
        if(buildNumber == null || buildNumber == '')
            buildNumber = `${githubContext.run_id}`;
        if(pipelineName == null || pipelineName == '')
            pipelineName = `${githubContext.repository}` + '/' + `${githubContext.workflow}`;
        if(stageName == null || stageName == '')
            stageName = jobName;

    
        let githubContext;
    
        try {
            githubContext = JSON.parse(githubContextStr);
        } catch (e) {
            console.log(`Error occured with message ${e}`);
            console.error("Exception parsing github context");
            return;
        }        
        const restendpoint = `${instanceUrl}/api/sn_devops/v1/devops/orchestration/changeInfo?buildNumber=${buildNumber}&stageName=${stageName}&pipelineName=${pipelineName}&toolId=${toolId}`;
        let response;
    
        console.log("REST endpoint Url -> "+restendpoint);
    
        try {
            const token = `${username}:${passwd}`;
            const encodedToken = Buffer.from(token).toString('base64');
    
            const defaultHeaders = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Basic ' + `${encodedToken}`
            };
            let httpHeaders = { headers: defaultHeaders };
            response = await axios.get(restendpoint, httpHeaders);
           /* response = axios.get(restendpoint, httpHeaders).then(
                (response) => {
                    console.log(response);
                  }, (error) => {
                    console.log(error);
                  }
            );*/
            //console.log("response => "+response+", Stringified response => "+JSON.stringify(response));
            console.log(JSON.stringify(response.data));
            console.log("response => "+response+",  Stringified response => "+JSON.stringify(response));
        } catch (err) {
            if (!err.response) {
                console.log("Entered if , Success block ");
                status = "SUCCESS";
                console.log('Update Successful.');            
            }else{
                console.log("Entered else Error block ");
                if (err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
                    console.error('Invalid ServiceNow Instance URL. Please correct the URL and try again.');
                }
                
                if (err.message.includes('401')) {
                    console.error('Invalid Credentials. Please correct the credentials and try again.');
                }
                    
                if (err.message.includes('405')) {
                    console.error('Response Code from ServiceNow is 405. Please check ServiceNow logs for more details.');
                }
            
                if (err.response.status == 500) {
                    console.error('Response Code from ServiceNow is 500. Please check ServiceNow logs for more details.')
                }
                
                if (err.response.status == 400) {
                    let errMsg = 'ServiceNow DevOps Update Change is not Succesful.';
                    let errMsgSuffix = ' Please provide valid inputs.';
                    let responseData = err.response.data;
                    if (responseData && responseData.error && responseData.error.message) {
                        errMsg = errMsg + responseData.error.message + errMsgSuffix;
                        console.error("Inside, if, errMsg => "+errMsg);
                    } else if (responseData && responseData.result && responseData.result.details && responseData.result.details.errors) {
                        let errors = err.response.data.result.details.errors;
                        for (var index in errors) {
                            errMsg = errMsg + errors[index].message + errMsgSuffix;
                        }
                        console.error("Inside, else-if, errMsg => "+errMsg);
                    }
                }
            }
        }

    }catch(err){
        core.setOutput("status",status);
        core.setFailed(err.message);
    }

   }catch(error){
        core.setOutput("status",status);
       core.setFailed(error.message)
   }
    
}

main();
