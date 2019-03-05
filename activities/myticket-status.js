'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api.getTickets();

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    let ticketStatus = {
      title: 'Open Tickets',
      url: 'https://devhomehelp.zendesk.com/agent/filters/360003786638',
      urlLabel: 'All tickets',
    };

    let ticketNo = response.body.tickets.length;

    if (ticketNo != 0) {
      ticketStatus = {
        ...ticketStatus,
        description: `You have ${ticketNo > 1 ? ticketNo + " tickets" : ticketNo + " ticket"} assigned`,
        color: 'blue',
        value: ticketNo,
        actionable: true
      }
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: `You have no tickets assigned`,
        actionable: false
      }
    }

    activity.Response.Data = ticketStatus;

  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};
