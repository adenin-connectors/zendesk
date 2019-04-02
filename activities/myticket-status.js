'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const response = await api.getTickets();

    if (Activity.isErrorResponse(response)) return;
    let zendeskDomain = api.getDomain();
    let ticketStatus = {
      title: T('Open Tickets'),
      link: `https://${zendeskDomain}/agent/filters/360003786638`,
      linkLabel: T('All Tickets')
    };

    let ticketNo = response.body.tickets.length;

    if (ticketNo != 0) {
      ticketStatus = {
        ...ticketStatus,
        description: ticketNo > 1 ? T("You have {0} tickets.", ticketNo) : T("You have 1 ticket."),
        color: 'blue',
        value: ticketNo,
        actionable: true
      }
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: T(`You have no tickets.`),
        actionable: false
      }
    }

    activity.Response.Data = ticketStatus;

  } catch (error) {
    Activity.handleError(error);
  }
};
