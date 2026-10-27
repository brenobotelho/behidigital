/* Catalog rules shared by rendering and data checks. No network or framework. */
(() => {
  const categories = window.BEHI_CATEGORIES || [];
  const category = id => categories.find(item => item.id === id);
  const leafIds = id => {
    const selected = category(id);
    return selected?.children ? selected.children.flatMap(leafIds) : selected ? [id] : [];
  };
  const clientId = project => project.clientId || project.client || project.id;
  const select = (projects, type = 'todos', client = '') => {
    const allowed = new Set(leafIds(type));
    return projects.filter(project => allowed.has(project.category) && (!client || clientId(project) === client));
  };
  function entries(projects, type = 'todos', client = '') {
    const groups = new Map();
    const result = [];
    select(projects, type, client).forEach(project => {
      if (!client && category(project.category)?.groupByClient && project.client) {
        // A client can have separate collections in Flyers, Social and other services.
        const key = project.category + ':' + clientId(project);
        if (!groups.has(key)) {
          const entry = { kind: 'collection', category: project.category, client: clientId(project), title: project.client, projects: [] };
          groups.set(key, entry);
          result.push(entry);
        }
        groups.get(key).projects.push(project);
      } else result.push({ kind: 'project', category: project.category, title: project.title, projects: [project] });
    });
    return result;
  }
  function paginate(items, requested = 1, size = 6) {
    const pages = Math.max(1, Math.ceil(items.length / size));
    const page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, pages) : 1;
    return { page, pages, items: items.slice((page - 1) * size, page * size) };
  }
  window.BEHI_CATALOG = { category, leafIds, clientId, select, entries, paginate };
})();
