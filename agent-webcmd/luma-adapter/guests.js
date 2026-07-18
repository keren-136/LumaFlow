import { cli } from '@agentrhq/webcmd/registry';

cli({
  site: 'luma',
  name: 'guests',
  description: 'List or approve pending registrations for a hosted Luma event',
  access: 'write',
  domain: 'luma.com',
  args: [
    { name: 'action', positional: true, required: true, choices: ['list', 'approve'], help: 'Action: list or approve' },
    { name: 'event_id', positional: true, required: true, help: 'Luma event API ID (evt-...)' },
    { name: 'guest_id', positional: true, required: false, help: 'Guest API ID (required for approve)' },
  ],
  columns: ['guest_id', 'name', 'email', 'answers', 'status'],
  pipeline: [
    { navigate: 'https://luma.com/home' },
    { evaluate: `(async () => {
  const action = \${{ args.action | json }};
  const eventId = \${{ args.event_id | json }};
  const guestId = \${{ args.guest_id | json }};
  const request = async (url, options = {}) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (res.status === 401 || res.status === 403) throw new Error('Luma authentication or manage access failed (HTTP ' + res.status + ')');
    if (!res.ok) throw new Error('Luma API request failed: HTTP ' + res.status + ' - ' + (await res.text()).slice(0, 300));
    return res.json();
  };
  if (action === 'list') {
    const url = 'https://api.luma.com/event/admin/get-guests?event_api_id=' + encodeURIComponent(eventId) + '&pagination_limit=100&query=&sort_column=registered_or_created_at&sort_direction=desc';
    const data = await request(url);
    return (data.entries || []).filter(g => g.approval_status === 'pending_approval').map(g => ({
      guest_id: g.api_id || '',
      name: g.name || [g.first_name, g.last_name].filter(Boolean).join(' '),
      email: g.email || '',
      answers: g.registration_answers || [],
      status: g.approval_status || '',
    }));
  }
  if (!guestId) throw new Error('guest_id is required for guests approve');
  const body = { event_api_id: eventId, rsvp_api_id: guestId, approval_status: 'approved', should_refund: false, event_ticket_type_api_id: null };
  const data = await request('https://api.luma.com/event/admin/update-guest-status', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  const guest = data.event_guest || data.guest || data;
  return [{ guest_id: guest.api_id || guestId, status: guest.approval_status || 'approved' }];
})()` },
  ],
});
