'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);

    const userProfile = await api('/users/me.json');
    if ($.isErrorResponse(activity, userProfile)) return;

    var dateRange = $.dateRange(activity, "today");
    let start = new Date(dateRange.startDate).toISOString();
    let end = new Date(dateRange.endDate).toISOString();
    var pagination = $.pagination(activity);
    let url = `/search.json?page=${pagination.page}&per_page=${pagination.pageSize}&query=type:ticket+status:open` +
      `+status:new+status:pending+created>${start}+created<${end}&sort_by=created_at&sort_order=desc`;
    const response = await api(url);
    if ($.isErrorResponse(activity, response)) return;

    let value = response.body.count;

    activity.Response.Data.items = api.convertResponse(response.body.results);
    if (parseInt(pagination.page) == 1) {
    let zendeskDomain = api.getDomain();
    activity.Response.Data.title = T(activity, "Open Tickets");
    activity.Response.Data.link = `https://${zendeskDomain}/agent/filters/360003786638`;
    activity.Response.Data.linkLabel = T(activity, 'All Tickets');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.date = activity.Response.Data.items[0].date;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} tickets.", value) :
        T(activity, "You have 1 ticket.");
    } else {
      activity.Response.Data.description = T(activity, `You have no tickets.`);
    }
  }
  } catch (error) {
    $.handleError(activity, error);
  }
};