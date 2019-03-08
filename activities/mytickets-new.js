'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    var dateRange = cfActivity.dateRange(activity, "today");
    let start = new Date(dateRange.startDate).toISOString();
    let end = new Date(dateRange.endDate).toISOString();

    const response = await api(`/search.json?query=type:ticket+status:open+created>${start}+created<${end}`);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    let ticketStatus = {
      title: 'New Open Tickets',
      url: 'https://devhomehelp.zendesk.com/agent/filters/360003786638',
      urlLabel: 'All tickets',
    };

    let ticketNo = response.body.count;

    if (ticketNo != 0) {
      ticketStatus = {
        ...ticketStatus,
        description: `You have ${ticketNo > 1 ? ticketNo + " new tickets" : ticketNo + " new ticket"} assigned`,
        color: 'blue',
        value: ticketNo,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: `You have no new tickets assigned`,
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};
