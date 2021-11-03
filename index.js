const http = require('http');
const constants = require('./constants/');
const axios = require('axios');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer();

const handleFailedReq = () => {
  return {
    status: 400
  };
}

const findServer = () => {
  return new Promise(async (resolve, reject) => {
    let activeServers = [];

    let serverDetails = constants.SERVER_DETAILS;

    var serverURLs = serverDetails.map(serverDetail => serverDetail.url ? axios.get(serverDetail.url).catch(handleFailedReq) : null);

    //Simultaneously Sending All Get Requests
    await axios.all(serverURLs, { timeout: 1000 * 25 }).then(axios.spread(async (...responses) => {
      //Getting list of active servers between status code 200 and 299
      activeServers = await serverDetails.filter((res, index) => {
        if (responses[index] && (responses[index].status >= 200 && responses[index].status <= 299)) {
          return true
        }
        return false
      });
    }));

    if (activeServers && activeServers.length) {
      //Getting low priority active server
      const lowPriorityServer = activeServers.reduce(function (prev, curr) {
        return prev.priority < curr.priority ? prev : curr;
      });

      if (lowPriorityServer) {
        resolve(lowPriorityServer);
      } else {
        reject("No Servers Online");
      }
    } else {
      reject("No Servers Online");
    }
  });
}

server.listen(port, hostname, () => {
  findServer().then(function (server) {
    console.log(JSON.stringify(server))
    return server;
  }).catch(function (e) {
    return e;
  });
});

module.exports.findServer = findServer;