'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);
    const response = await api.getTickets();

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    activity.Response.Data = convertResponse(response);
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};

/**maps response data to items */
function convertResponse(response) {
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