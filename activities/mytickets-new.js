'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    var dateRange = Activity.dateRange("today");
    let start = new Date(dateRange.startDate).toISOString();
    let end = new Date(dateRange.endDate).toISOString();

    const response = await api(`/search.json?query=type:ticket+status:open+created>${start}+created<${end}`);

    if (Activity.isErrorResponse(response)) return;

    let ticketStatus = {
      title: T('New Tickets'),
      url: 'https://devhomehelp.zendesk.com/agent/filters/360003786638',
      urlLabel: T('All Tickets')
    };

    let ticketNo = response.body.count;

    if (ticketNo != 0) {
      ticketStatus = {
        ...ticketStatus,
        description: ticketNo > 1 ? T("You have {0} new tickets.", ticketNo) : T("You have 1 new ticket."),
        color: 'blue',
        value: ticketNo,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: T(`You have no new tickets.`),
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;
  } catch (error) {
    Activity.handleError(error);
  }
};
