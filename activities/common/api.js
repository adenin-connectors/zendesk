'use strict';
const got = require('got');
const HttpAgent = require('agentkeepalive');
const HttpsAgent = HttpAgent.HttpsAgent;

let userId = null;
let _activity = null;

function api(path, opts) {
  if (typeof path !== 'string') {
    return Promise.reject(new TypeError(`Expected \`path\` to be a string, got ${typeof path}`));
  }

  const zendeskDomain = api.getDomain();

  opts = Object.assign({
    json: true,
    token: _activity.Context.connector.token,
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

  if (opts.token) opts.headers.Authorization = `Bearer ${opts.token}`;

  const url = /^http(s)\:\/\/?/.test(path) && opts.endpoint ? path : opts.endpoint + path;

  if (opts.stream) return got.stream(url, opts);

  return got(url, opts).catch((err) => {
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

api.initialize = (activity) => {
  _activity = activity;
};

api.stream = (url, opts) => api(url, Object.assign({}, opts, {
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
  let domain = _activity.Context.connector.custom1;

  domain = domain.replace('https://', '');
  domain = domain.replace('/', '');

  if (!domain.includes('.zendesk.com')) {
    domain += '.zendesk.com';
  }

  return domain;
};

/**maps response data to items */
api.convertResponse = function (tickets) {
  let items = [];
  let zendeskDomain = api.getDomain();
  // iterate through each issue and extract id, title, etc. into a new array
  for (let i = 0; i < tickets.length; i++) {
    let raw = tickets[i];
    let item = {
      id: raw.id,
      title: raw.subject,
      description: raw.description,
      date: new Date(raw.created_at).toISOString(),
      link: `https://${zendeskDomain}/agent/tickets/${raw.id}`,
      raw: raw
    };
    items.push(item);
  }

  return items;
};

module.exports = api;