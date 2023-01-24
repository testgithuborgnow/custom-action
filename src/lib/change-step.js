const core = require('@actions/core');
const axios = require('axios');
const { createChange } = require('./create-change');

async function changeStep({
    instanceUrl,
    toolId,
    username,
    passwd,
    jobname,
    githubContextStr,
    changeRequestDetailsStr,
    changeCreationTimeOut,
    abortOnChangeCreationFailure
}) {

    //    let timeoutId = setTimeout(() => {
    //         if(result && result.message)
    //              console.log('im printing result'+ result.message);
    //         else if (false){ 
    //             throw new Error(`Change creation timeout after ${timeout} seconds.`);;
    //         }
    //         else{
    //             console.log('timeoutOccur');
    //             clearTimeout(timeoutId);
    //            return ;
    //         }
    //        }, changeCreationTimeOut * 1);

    try {
        await createChange({
            instanceUrl,
            toolId,
            username,
            passwd,
            jobname,
            githubContextStr,
            changeRequestDetailsStr,
            changeCreationTimeOut,
            abortOnChangeCreationFailure
        })
    } catch (err) {
        console.log(err);
    }

}

module.exports = { changeStep };