const core = require('@actions/core');
const axios = require('axios');

async function doFetch({
  instanceUrl,
  toolId,
  username,
  passwd,
  jobname,
  githubContextStr,
  noOfTimesChangeLinkPrint
}) {
  console.log(`\nPolling for change status..........`);

  let githubContext = JSON.parse(githubContextStr);

  const codesAllowedArr = '200,201,400,401,403,404,500'.split(',').map(Number);
  const pipelineName = `${githubContext.repository}` + '/' + `${githubContext.workflow}`;
  const buildNumber = `${githubContext.run_id}`;
  const attemptNumber = `${githubContext.run_attempt}`;

  const endpoint = `${instanceUrl}/api/sn_devops/devops/orchestration/changeStatus?toolId=${toolId}&stageName=${jobname}&pipelineName=${pipelineName}&buildNumber=${buildNumber}&attemptNumber=${attemptNumber}`;

  let response = {};
  let status = false;
  let changeStatus = {};
  let responseCode = 500;

  try {
    const token = `${username}:${passwd}`;
    const encodedToken = Buffer.from(token).toString('base64');

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic ' + `${encodedToken}`
    };

    let httpHeaders = { headers: defaultHeaders };
    response = await axios.get(endpoint, httpHeaders);
    status = true;
  } catch (err) {
    if (!err.response) {
      throw new Error("500");
    }

    if (!codesAllowedArr.includes(err.response.status)) {
      throw new Error("500");
    }

    if (err.response.status == 500) {
      throw new Error("500");
    }

    if (err.response.status == 400) {
      throw new Error("400");
    }

    if (err.response.status == 401) {
      throw new Error("401");
    }

    if (err.response.status == 403) {
      throw new Error("403");
    }

    if (err.response.status == 404) {
      throw new Error("404");
    }
  }

  if (status) {
    try {
      responseCode = response.status;
    } catch (error) {
      core.setFailed('\nCould not read response code from API response: ' + error);
      throw new Error("500");
    }

    try {
      changeStatus = response.data.result;
    } catch (error) {
      core.setFailed('\nCould not read change status details from API response: ' + error);
      throw new Error("500");
    }

    let details = changeStatus.details;
    if (noOfTimesChangeLinkPrint) {

      // Define the URL for the hyperlink
      // const url = "https://example.com";

      // // Create the hyperlink element and set its href attribute
      // const link = document.createElement("a");
      // link.href = url;

      // // Set the text content of the hyperlink
      // link.textContent = "Click here to visit example.com";

      // // Add the hyperlink to the document
      // document.body.appendChild(link);

      let url = "https://empmganji12.service-now.com/change_request.do?sys_id=a4471d8e977865102a1778971153afd3";
      console.info(`Click here to go to ${url}`);
      console.log(`<${url}>`);
      console.log(`Open the following URL in a web browser: ${url}`);


      console.log(`URL: [${url}]`);

      const decodedUrl = decodeURI(url);
      console.log(decodedUrl);

      console.debug(url)
      console.log(`URL: <a href="${url}" target="_blank">${url}</a>`);
      // Set output variable
      core.setOutput('myOutputVar', url);
      
      // Log output variable
      console.log(`My output variable: ${core.getInput('myOutputVar')}`);
      
      console.log("[Click here](" + 'https://empmganji12.service-now.com/change_request.do?sys_id=a4471d8e977865102a1778971153afd3' + ") to view the full URL");
      console.log(`The URL is: %chttps://empmganji12.service-now.com/change_request.do?sys_id=a4471d8e977865102a1778971153afd3`, 'color: blue; font-weight: bold; text-decoration: underline;');
      console.log(`${endpoint}`);
      console.log(`<a href="https://empmganji12.service-now.com/change_request.do?sys_id=a4471d8e977865102a1778971153afd3">Click here</a> to visit the website.`);
      console.log('This is a message with a hyperlink: %cClick here', 'color:blue; text-decoration:underline', 'https://www.example.com');
      console.log("https://empmganji12.service-now.com/change_request.do?sys_id=a4471d8e977865102a1778971153afd3");
      console.log(`${instanceUrl}` + " ");
      console.log('testing');
       url = 'https://empmganji12.service-now.com/change_request.do?sys_id=a4471d8e977865102a1778971153afd3';
       console.log(`%c${url}`, 'color: blue; text-decoration: underline;');



      console.log(`This is a message with a hyperlink: \x1b]8;;https://www.example.com\x1b\\Click here\x1b]8;;\x1b\\`);
      console.log(`${instanceUrl}` + +"change_request.do?sys_id=" + 'a4471d8e977865102a1778971153afd3');
      console.log('This is a message with a hyperlink: %cClick here', 'color:blue; text-decoration:underline', 'https://empmganji12.service-now.com/change_request.do?sys_id=a4471d8e977865102a1778971153afd3');
      noOfTimesChangeLinkPrint--;
    }

    console.log('\n     \x1b[1m\x1b[32m' + JSON.stringify(details) + '\x1b[0m\x1b[0m');

    let changeState = details.status;

    if (responseCode == 201) {
      if (changeState == "pending_decision") {
        throw new Error("201");
      } else
        throw new Error("202");
    }

    if (responseCode == 200) {
      console.log('\n****Change is Approved.');
    }
  } else
    throw new Error("500");

  return true;
}

module.exports = { doFetch };