import { cli } from '@agentrhq/webcmd/registry';

cli({
  site: 'luma',
  name: 'events',
  description: 'List events hosted by the signed-in Luma account',
  access: 'read',
  domain: 'luma.com',
  args: [
    { name: 'action', positional: true, required: true, choices: ['list'], help: 'Action: list' },
  ],
  columns: ['id', 'title', 'status', 'url'],
  pipeline: [
    { navigate: 'https://luma.com/home' },
    { evaluate: `(async () => {
  const authError = (status) => new Error('Luma authentication failed (HTTP ' + status + '). Log in with: webcmd --profile luma-host browser luma-auth open https://luma.com/home --window foreground');
  const calendarsRes = await fetch('https://api.luma.com/calendar/admin/list', { credentials: 'include' });
  if (calendarsRes.status === 401 || calendarsRes.status === 403) throw authError(calendarsRes.status);
  if (!calendarsRes.ok) throw new Error('Failed to list Luma calendars: HTTP ' + calendarsRes.status);
  const calendars = (await calendarsRes.json()).infos || [];
  const rows = [];
  for (const info of calendars) {
    const id = info?.calendar?.api_id;
    if (!id) continue;
    const res = await fetch('https://api.luma.com/calendar/admin/get-events?calendar_api_id=' + encodeURIComponent(id) + '&pagination_limit=100', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to list events for calendar ' + id + ': HTTP ' + res.status);
    const data = await res.json();
    for (const entry of data.entries || []) {
      const event = entry.event || {};
      rows.push({
        id: event.api_id || '',
        title: event.name || '',
        status: event.visibility === 'public' ? 'published' : 'draft',
        url: event.url ? 'https://luma.com/' + event.url : '',
      });
    }
  }
  return rows;
})()` },
  ],
});
