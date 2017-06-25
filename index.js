'use strict';

var HTTP = require('http');
var QueryString = require('querystring');
var opn = require('opn');
var request = require('request');
var { URL } = require('url');

function handleAuthorizeRedirectRequest({ handleAuthorizeCode, request, response, serverContainer }) {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname !== '/code') {
    console.info(`Ignoring request to ${request.url}`);
    return;
  }

  const query = QueryString.parse(request.url);
  handleAuthorizeCode(query.code);
  response.end('Strava authentication is done. You can close this browser tab.');
  serverContainer.server.close();
}

function makeTokenExchangeRequest({ clientId, clientSecret, code, handleAccessToken }) {
  const url = 'https://www.strava.com/oauth/token';
  const form = {
    client_id: clientId,
    client_secret: clientSecret,
    code: code
  };

  const handleTokenExchangeResponse = (error, response, bodyJson) => {
    const body = JSON.parse(bodyJson);
    handleAccessToken(undefined, body.access_token);
  };

  request.post({ url, form }, handleTokenExchangeResponse);
}

function startWebserver(handleAuthorizeCode, port) {
  const serverContainer = {};
  const culledHandleRequest = (request, response) =>
        handleAuthorizeRedirectRequest({ handleAuthorizeCode, request, response, serverContainer });
  const server = HTTP.createServer(culledHandleRequest);
  server.listen(port, (err) => {
    if (err) {
      throw Error(err);
    }
  })
  serverContainer.server = server;
}

/**
 * Authorize against the Strava V3 API and return the Strava access token via a callback.
 * @param {Object} options
 * @param {string} options.clientId - Strava client ID.
 * @param {string} options.clientSecret - Strava client secret.
 * @param {string} options.scope - "write", "view_private", or the empty string.
 * @param {number} options.httpPort - Local port used for the Strava redirect with the Strava auth code.
 * @param {function} handleAccessToken - Callback that is passed (error, accessToken).
 */
function authorize({ scope, clientId, clientSecret, httpPort }, handleAccessToken) {
  const handleAuthorizeCode = (code) =>
        makeTokenExchangeRequest({ clientId, clientSecret, code, handleAccessToken });
  startWebserver(handleAuthorizeCode, httpPort)

  const redirectUrl = `http://localhost:${httpPort}/code`;

  const authUrl = new URL('https://www.strava.com/oauth/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', redirectUrl);
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('approval_prompt', 'auto');
  // There is also an optional 'state' param.

  opn(authUrl.href);
}


module.exports = authorize;
