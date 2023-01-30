const core = require('@actions/core');
const axios = require('axios');
const { createChange } = require('./lib/create-change');
//const { createChange1 } = require('./lib/change-step');
const { tryFetch } = require('./lib/try-fetch');

const main = async () => {
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
    changeCreationTimeOut = changeCreationTimeOut >= 3600 ? changeCreationTimeOut : 3600;
    let status = true;
    let response;
    changeCreationTimeOut = 1000;
    abortOnChangeCreationFailure = false;
    try {
     await createChange({
        instanceUrl,
        toolId,
        username,
        passwd,
        jobname,
        githubContextStr,
        changeRequestDetailsStr,
        changeCreationTimeOut
      });
    } catch (err) {

      if (abortOnChangeCreationFailure) {
        status = false;
        core.setFailed(err.message);
      }
      else { 
        console.error("creation failed with error message " + err.message);
        console.log('\n  \x1b[38;5;214m Workflow will continue executing the next step as abortOnChangeCreationFailure is ' + abortOnChangeCreationFailure + '\x1b[38;5;214m');
        return;
      }
    }

    if (status) {
      let timeout = parseInt(core.getInput('timeout') || 3600);
      let interval = parseInt(core.getInput('interval') || 100);

      let changeFlag = core.getInput('changeFlag');
      changeFlag = changeFlag === undefined || changeFlag === "" ? true : (changeFlag == "true");


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