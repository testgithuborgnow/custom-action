const core = require('@actions/core');
const axios = require('axios');
const { createChange } = require('./lib/create-change');
const { createChange1 } = require('./lib/create-change1');
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
    changeCreationTimeOut = 100;
    try {

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
      if (err.message == 'timeout') {
        console.error('timeout occurred');
        return;
      }
      core.setFailed(err.message);
    }

    if (status) {
      let timeout = parseInt(core.getInput('timeout') || 3600);
      let interval = parseInt(core.getInput('interval') || 10);
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