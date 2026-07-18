import { cli } from '@agentrhq/webcmd/registry';

cli({
  site: 'luma',
  name: 'event',
  description: 'Update or publish a hosted Luma event',
  access: 'write',
  domain: 'luma.com',
  args: [
    { name: 'action', positional: true, required: true, choices: ['update', 'publish'], help: 'Action: update or publish' },
    { name: 'event_id', positional: true, required: true, help: 'Luma event API ID (evt-...)' },
    { name: 'title', help: 'New event title' },
    { name: 'description', help: 'New plain-text event description' },
    { name: 'tags', help: 'Comma-separated event tags/categories' },
    { name: 'category', help: 'Event category slug or category API ID' },
  ],
  columns: ['id', 'title', 'status', 'url'],
  pipeline: [
    { navigate: 'https://luma.com/home' },
    { evaluate: `(async () => {
  const action = \${{ args.action | json }};
  const eventId = \${{ args.event_id | json }};
  const title = \${{ args.title | json }};
  const description = \${{ args.description | json }};
  const tagsArg = \${{ args.tags | json }};
  const category = \${{ args.category | json }};
  const post = async (path, body) => {
    const res = await fetch('https://api.luma.com' + path, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.status === 401 || res.status === 403) throw new Error('Luma authentication or manage access failed (HTTP ' + res.status + ')');
    if (!res.ok) throw new Error('Luma API request failed: HTTP ' + res.status + ' - ' + (await res.text()).slice(0, 300));
    return res.json();
  };
  const body = { event_api_id: eventId };
  if (action === 'publish') body.visibility = 'public';
  if (action === 'update') {
    if (!title && description === undefined && !tagsArg && !category) throw new Error('Provide at least one of --title, --description, --tags, or --category');
    if (title) body.name = title;
    if (description !== undefined) body.description_mirror = { type: 'doc', content: [{ type: 'paragraph', content: description ? [{ type: 'text', text: description }] : [] }] };
    const tags = String(tagsArg || '').split(',').map(x => x.trim()).filter(Boolean);
    if (tags.length) body.tags = tags;
    if (category) body.category = category;
  }
  const data = await post('/event/admin/update', body);
  const event = data.event || {};
  return [{ id: event.api_id || eventId, title: event.name || '', status: event.visibility === 'public' ? 'published' : 'draft', url: event.url ? 'https://luma.com/' + event.url : '' }];
})()` },
  ],
});
