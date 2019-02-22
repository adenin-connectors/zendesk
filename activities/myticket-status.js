'use strict';

const logger = require('@adenin/cf-logger');
const handleError = require('@adenin/cf-activity').handleError;
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api.getTickets();

    let ticketStatus = {
      title: 'Open Tickets',
      url: 'https://devhomehelp.zendesk.com/agent/filters/360003786638',
      urlLabel: 'All tickets',
    };

    let ticketNo = response.body.tickets.length;

    if (ticketNo != 0) {
      ticketStatus = {
        ...ticketStatus,
        description: `You have ${ticketNo} tickets assigned`,
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
    handleError(error, activity);
  }
};
