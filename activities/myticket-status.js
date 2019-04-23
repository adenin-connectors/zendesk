'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api.getTickets();

    if ($.isErrorResponse(activity, response)) return;
    let zendeskDomain = api.getDomain();
    let ticketStatus = {
      title: T(activity, 'Open Tickets'),
      link: `https://${zendeskDomain}/agent/filters/360003786638`,
      linkLabel: T(activity, 'All Tickets')
    };

    let ticketNo = response.body.tickets.length;

    if (ticketNo != 0) {
      ticketStatus = {
        ...ticketStatus,
        description: ticketNo > 1 ? T(activity, "You have {0} tickets.", ticketNo) : T(activity, "You have 1 ticket."),
        color: 'blue',
        value: ticketNo,
        actionable: true
      }
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: T(activity, `You have no tickets.`),
        actionable: false
      }
    }

    activity.Response.Data = ticketStatus;

  } catch (error) {
    $.handleError(activity, error);
  }
};
