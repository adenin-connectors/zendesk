'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    var dateRange = $.dateRange(activity, "today");
    let start = new Date(dateRange.startDate).toISOString();
    let end = new Date(dateRange.endDate).toISOString();

    api.initialize(activity);
    const response = await api(`/search.json?query=type:ticket+status:open+created>${start}+created<${end}`);
    if ($.isErrorResponse(activity, response)) return;

    let zendeskDomain = api.getDomain();
    let ticketStatus = {
      title: T(activity, 'New Tickets'),
      link: `https://${zendeskDomain}/agent/filters/360003786638`,
      linkLabel: T(activity, 'All Tickets')
    };

    let ticketNo = response.body.count;

    if (ticketNo != 0) {
      ticketStatus = {
        ...ticketStatus,
        description: ticketNo > 1 ? T(activity, "You have {0} new tickets.", ticketNo) : T(activity, "You have 1 new ticket."),
        color: 'blue',
        value: ticketNo,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: T(activity, `You have no new tickets.`),
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;
  } catch (error) {
    $.handleError(activity, error);
  }
};
