## Synopsis

Node.js API for command-line applications that need to authenticate via the Strava V3 API.

## Code Example

```javascript
  var authorize = require('strava-v3-cli-authenticator');

  const options = {
    clientId: 12345,
	clientSecret: 'x5f111xx11yyyy2222z3aa4b5555c6d777e88f9',
    scope: "write",
    httpPort: 8888
  };
  const callback = (error, accessToken) => {
    if (error) {
      console.error('Failed: ', error);
    } else {
      console.log('Access token: ', accessToken);
    }
  };
  authorize(options, callback);
```

## Motivation

Strava's API is a hassle to use in command-line apps since it depends on pointing the user's browser to Strava, authenticating, then redirecting the brower back to the developer's application with the authentication code.  This package gets around that by running a local HTTP server, starting up a browser, and pointing the Strava redirect to the local HTTP server.

## Installation

`npm install --save strava-v3-cli-authenticator`

## API Reference

### authorize(options, handleAccessToken)
Authorize against the Strava V3 API and return the Strava access token via a callback.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.clientId | <code>string</code> | Strava client ID. |
| options.clientSecret | <code>string</code> | Strava client secret. |
| options.scope | <code>string</code> | "write", "view_private", or the empty string. |
| options.httpPort | <code>number</code> | Local port used for the Strava redirect with the Strava auth code. |
| handleAccessToken | <code>function</code> | Callback that is passed (error, accessToken). |

## License

ISC
