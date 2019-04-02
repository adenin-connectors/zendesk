'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    let pagination = Activity.pagination();
    const response = await api.getTickets(pagination);

    if (Activity.isErrorResponse(response)) return;

    activity.Response.Data = convertResponse(response);
  } catch (error) {
    Activity.handleError(error);
  }
};

/**maps response data to items */
function convertResponse(response) {
  let items = [];
  let tickets = response.body.tickets;
  let zendeskDomain = api.getDomain();
  // iterate through each issue and extract id, title, etc. into a new array
  for (let i = 0; i < tickets.length; i++) {
    let raw = tickets[i];
    let item = {
      id: raw.id,
      title: raw.subject,
      description: raw.description,
      link: `https://${zendeskDomain}/agent/tickets/${raw.id}`,
      raw: raw
    };
    items.push(item);
  }

  return { items: items };
}