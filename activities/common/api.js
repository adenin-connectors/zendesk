'use strict';
const got = require('got');
const HttpAgent = require('agentkeepalive');
const HttpsAgent = HttpAgent.HttpsAgent;

let userId = null;

function api(path, opts) {
  if (typeof path !== 'string') {
    return Promise.reject(new TypeError(`Expected \`path\` to be a string, got ${typeof path}`));
  }
  let zendeskDomain = api.getDomain();
  opts = Object.assign({
    json: true,
    token: Activity.Context.connector.token,
    endpoint: `https://${zendeskDomain}/api/v2`,
    agent: {
      http: new HttpAgent(),
      https: new HttpsAgent()
    }
  }, opts);

  opts.headers = Object.assign({
    accept: 'application/json',
    'user-agent': 'adenin Digital Assistant Connector, https://www.adenin.com/digital-assistant'
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

for (const x of helpers) {
  const method = x.toUpperCase();
  api[x] = (url, opts) => api(url, Object.assign({}, opts, { method }));
  api.stream[x] = (url, opts) => api.stream(url, Object.assign({}, opts, { method }));
}

//** returns Zendesk domain in correct format */
api.getDomain = function () {
  let domain = Activity.Context.connector.custom1;
  domain = domain.replace('https://', '');
  domain = domain.replace('/', '');

  if (!domain.includes('.zendesk.com')) {
    domain += '.zendesk.com';
  }
  return domain;
};

api.getTickets = async function (pagination) {
  let userProfile = await api('/users/me.json');
  userId = getUserId(userProfile);
  let url = `/users/${userId}/tickets/assigned.json`;
  if (pagination) {
    url += `&page=${pagination.page}`;
  }
  
  return api(url);
};

function getUserId(userData) {
  return userData.body.user.id;
}

module.exports = api;