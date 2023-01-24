const core = require('@actions/core');
const axios = require('axios');
const { createChange } = require('./lib/create-change');
const { tryFetch } = require('./lib/try-fetch');

const main = async() => {
  try {
    const instanceUrl = core.getInput('instance-url', { required: true });
    const toolId = core.getInput('tool-id', { required: true });
    const username = core.getInput('devops-integration-user-name', { required: true });
    const passwd = core.getInput('devops-integration-user-password', { required: true });
    const jobname = core.getInput('job-name', { required: true });

    let changeRequestDetailsStr = core.getInput('change-request', { required: true });
    let githubContextStr = core.getInput('context-github', { required: true });
    let abortOnChangeCreationFailure = core.getInput('abortOnChangeCreationFailure');
    abortOnChangeCreationFailure = abortOnChangeCreationFailure === undefined || abortOnChangeCreationFailure === "" ? true : (abortOnChangeCreationFailure == "true");
    let changeCreationTimeOut = parseInt(core.getInput('changeCreationTimeOut') || 3600);
    changeCreationTimeOut = changeCreationTimeOut>= 10 ?changeCreationTimeOut: 10;
    let status = true;
    let response;

    try {


      let result ='';
      let timeoutId = setTimeout(() => {
        if(result && result.message)
             console.log('im printing result'+ result.message);
        else if (false){ 
            throw new Error(`Change creation timeout after ${timeout} seconds.`);;
        }
        else{
            console.log('timeoutOccur');
            clearTimeout(timeoutId);
            status = false;
           return ;
        }
       }, changeCreationTimeOut * 1);

       
      response = await createChange({
        instanceUrl,
        toolId,
        username,
        passwd,
        jobname,
        githubContextStr,
        changeRequestDetailsStr,
        changeCreationTimeOut,
        abortOnChangeCreationFailure
      });
    } catch (err) { 
     status = false;
     core.setFailed(err.message);
    }





    //  await doFetch({
    //   instanceUrl,
    //   toolId,
    //   username,
    //   passwd,
    //   jobname,
    //   githubContextStr
    // });




    // if(true){
    //   console.error("i'm executing with you");
    //   return;
    // }
    
    if (status) {
      let timeout = parseInt(core.getInput('timeout') || 3600);
      let interval = parseInt(core.getInput('interval') || 100);
      let changeFlag = core.getInput('changeFlag');
      changeFlag = changeFlag === undefined || changeFlag === "" ? true : (changeFlag == "true");
      
     
      interval = 2;
      timeout = 10;

      let start = +new Date();
      
      response = await tryFetch({
        start,
        interval,
        timeout,
        instanceUrl,
        toolId,
        username,
        passwd,
        jobname,
        githubContextStr,
        changeFlag
      });

      console.log('Get change status was successfull.');  
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();