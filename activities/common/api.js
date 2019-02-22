'use strict';
const got = require('got');
const isPlainObj = require('is-plain-obj');
const HttpAgent = require('agentkeepalive');
const HttpsAgent = HttpAgent.HttpsAgent;

let _activity = null;
let userId = null;

function api(path, opts) {

  opts = Object.assign({
    json: true,
    token: _activity.Context.connector.token,
    endpoint: 'https://devhomehelp.zendesk.com/api/v2',
    agent: {
      http: new HttpAgent(),
      https: new HttpsAgent()
    }
  }, opts);

  opts.headers = Object.assign({
    accept: 'application/json',
    'user-agent': 'adenin Now Assistant Connector, https://www.adenin.com/now-assistant'
  }, opts.headers);

  if (opts.token) {
    opts.headers.Authorization = `Bearer ${opts.token}`;
  }

  const url = /^http(s)\:\/\/?/.test(path) && opts.endpoint ? path : opts.endpoint + path;

  if (opts.stream) {
    return got.stream(url, opts);
  }

  return got(url, opts).catch(err => {

    throw err;
  });
}
// convert response from /issues endpoint to 
api.convertIssues = function (response) {
  let items = [];
  let tickets = response.body.tickets;

  // iterate through each issue and extract id, title, etc. into a new array
  for (let i = 0; i < tickets.length; i++) {
    let raw = tickets[i];
    let item = { id: raw.id, title: raw.subject, description: raw.description, link: `https://devhomehelp.zendesk.com/agent/tickets/${raw.id}`, raw: raw };
    items.push(item);
  }

  return { items: items };
}

function getUserId(userData) {
  return userData.body.user.id;
}
const helpers = [
  'get',
  'post',
  'put',
  'patch',
  'head',
  'delete'
];

api.stream = (url, opts) => apigot(url, Object.assign({}, opts, {
  json: false,
  stream: true
}));

api.initialize = function (activity) {
  _activity = activity;
}

for (const x of helpers) {
  const method = x.toUpperCase();
  api[x] = (url, opts) => api(url, Object.assign({}, opts, { method }));
  api.stream[x] = (url, opts) => api.stream(url, Object.assign({}, opts, { method }));
}

api.getTickets = async function () {
  let userProfile = await api('/users/me.json');
  userId = getUserId(userProfile);

  return api(`/users/${userId}/tickets/assigned.json`);
}

module.exports = api;