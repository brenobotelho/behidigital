(() => {
  const projects = window.BEHI_PROJECTS || [];
  const catalog = window.BEHI_CATALOG;
  const familyIds = ['todos', 'sites', 'design', 'conteudo', 'camisetas'];
  const params = new URLSearchParams(location.search);
  const activeCategory = catalog.category(params.get('tipo'))?.id || 'todos';
  const activeClient = params.get('cliente') || '';
  const category = catalog.category(activeCategory);
  const selectedProjects = catalog.select(projects, activeCategory, activeClient);
  const entries = catalog.entries(projects, activeCategory, activeClient);
  const { page, pages, items } = catalog.paginate(entries, Number(params.get('pagina') || 1));
  const list = document.querySelector('#gallery-list');
  const filters = document.querySelector('#gallery-filters');
  const pagination = document.querySelector('#gallery-pagination');
  const dialog = document.querySelector('#project-dialog');
  const dialogImage = document.querySelector('#dialog-image');
  let activeProject, lastOpener;
  let imageIndex = 0;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function route({ type = activeCategory, client = activeClient, number = 1, project } = {}) {
    const query = new URLSearchParams();
    if (type !== 'todos') query.set('tipo', type);
    if (client) query.set('cliente', client);
    if (number > 1) query.set('pagina', String(number));
    if (project) query.set('projeto', project);
    return './projetos.html' + (query.size ? '?' + query : '');
  }
  function quoteURL(project) {
    const service = project ? catalog.category(project.category).label : category.label;
    const reference = project ? ` Gostei do projeto ${project.title}${project.client && project.client !== project.title ? ' para ' + project.client : ''}.` : activeClient && selectedProjects[0] ? ` Vi a coleção de ${selectedProjects[0].client}.` : '';
    const message = activeCategory === 'todos' && !project
      ? 'Olá! Vi o portfólio da Behi e gostaria de conversar sobre um projeto.'
      : `Olá! Vim pelo portfólio da Behi e gostaria de um orçamento para ${service}.${reference}`;
    return 'https://wa.me/5511982517271?text=' + encodeURIComponent(message);
  }
  function countLabel(number, singular, plural) { return `${number} ${number === 1 ? singular : plural}`; }
  function setTitle(node, title) {
    node.textContent = title.replace(/\.$/, '');
    node.append(element('span', 'accent', '.'));
  }
  function filterLink(id, className, label, isCurrent) {
    const count = catalog.select(projects, id).length;
    const link = element('a', className);
    link.href = route({ type: id, client: '' });
    link.dataset.category = id;
    if (isCurrent) link.setAttribute('aria-current', 'true');
    link.append(element('span', '', label), element('span', 'filter-count', String(count).padStart(2, '0')));
    return link;
  }
  // Native links retain the selection on reload and support file:// without a router.
  const activeFamily = familyIds.find(id => id !== 'todos' && catalog.leafIds(id).includes(activeCategory)) || activeCategory;
  const familyNav = document.querySelector('#gallery-services');
  familyIds.forEach((id, index) => {
    const definition = catalog.category(id);
    const link = filterLink(id, 'catalog-service', definition.shortLabel || 'Visão geral', activeFamily === id);
    link.prepend(element('span', 'catalog-service-index', index === 0 ? '•' : `0${index}`));
    link.append(element('span', 'catalog-service-arrow', '↗'));
    familyNav.append(link);
  });
  const relevantIds = activeCategory === 'todos' ? catalog.leafIds('todos') : catalog.leafIds(activeFamily);
  if (relevantIds.length > 1) {
    filters.append(filterLink(activeFamily, 'filter-button', 'Todos', activeCategory === activeFamily));
    relevantIds.forEach(id => filters.append(filterLink(id, 'filter-button', catalog.category(id).label, activeCategory === id)));
  } else filters.append(filterLink(activeCategory, 'filter-button', category.label, true));

  const breadcrumbs = document.querySelector('#gallery-breadcrumbs');
  if (activeCategory !== 'todos' || activeClient) {
    breadcrumbs.lastElementChild.replaceWith(Object.assign(element('a', '', 'Projetos'), { href: './projetos.html' }));
    breadcrumbs.append(element('span', '', '/'));
    breadcrumbs.append(activeClient ? Object.assign(element('a', '', category.label), { href: route({ client: '' }) }) : element('span', '', category.label));
    if (activeClient) breadcrumbs.append(element('span', '', '/'), element('span', '', selectedProjects[0]?.client || 'Cliente não encontrado'));
    breadcrumbs.lastElementChild.setAttribute('aria-current', 'page');
  }
  const title = document.querySelector('#gallery-title');
  title.tabIndex = -1;
  setTitle(title, activeClient ? selectedProjects[0]?.client || 'Coleção não encontrada.' : category.title);
  document.querySelector('#gallery-description').textContent = activeClient
    ? `Explore ${category.label.toLocaleLowerCase('pt-BR')} para este cliente. Abra cada trabalho para ver os detalhes e use como referência para o seu projeto.`
    : category.description;
  const total = document.querySelector('#gallery-total');
  total.textContent = String(selectedProjects.length).padStart(2, '0');
  total.parentElement.replaceChildren(total, document.createTextNode(selectedProjects.length === 1 ? ' trabalho publicado' : ' trabalhos publicados'));
  document.title = (activeClient ? selectedProjects[0]?.client || 'Coleção' : category.label) + ' — Behi Digital';
  const collectionCount = entries.filter(entry => entry.kind === 'collection').length;
  document.querySelector('#gallery-context-label').textContent = activeClient ? category.label : 'Referências para o seu projeto';
  setTitle(document.querySelector('#gallery-context-title'), activeClient ? 'Todos os trabalhos deste cliente.' : collectionCount === entries.length && entries.length ? 'Explore por cliente.' : category.label + '.');
  document.querySelector('#gallery-context-description').textContent = activeClient
    ? 'Cada peça faz parte desta coleção. Escolha um trabalho para ampliar.'
    : collectionCount ? 'Abra a coleção de um cliente para conhecer todos os trabalhos daquele serviço.' : 'Escolha um projeto para conhecer os detalhes.';
  const back = document.querySelector('#gallery-back');
  back.hidden = !activeClient;
  back.href = route({ client: '' });
  document.querySelector('#gallery-status').textContent = entries.length
    ? `${countLabel(entries.length, activeClient ? 'trabalho' : 'item', activeClient ? 'trabalhos' : 'itens')}${collectionCount ? ' · ' + countLabel(collectionCount, 'coleção', 'coleções') : ''} · Página ${page} de ${pages}`
    : 'Nenhum trabalho publicado nesta seleção';

  function card(entry, index) {
    const project = entry.projects[0];
    const collection = entry.kind === 'collection';
    const item = element('li', 'gallery-item');
    item.style.setProperty('--card-delay', `${index * .07}s`);
    const link = element('a', 'gallery-card' + (collection ? ' gallery-collection' : ''));
    link.href = collection ? route({ type: entry.category, client: entry.client }) : route({ number: page, project: project.id });
    link.setAttribute('aria-label', collection ? `Ver coleção de ${entry.title}: ${countLabel(entry.projects.length, 'trabalho', 'trabalhos')}` : `Ver projeto ${entry.title}`);
    const media = element('span', 'gallery-card-media');
    const image = element('img');
    image.src = project.cover;
    image.alt = project.images[0]?.alt || project.title;
    image.width = 808; image.height = 632; image.loading = 'lazy'; image.decoding = 'async';
    media.append(image, element('span', 'gallery-view', collection ? 'Explorar coleção ↗' : 'Ver projeto ↗'));
    if (collection) media.append(element('span', 'collection-count', countLabel(entry.projects.length, 'trabalho', 'trabalhos')));
    const meta = element('span', 'gallery-card-meta');
    const text = element('span');
    text.append(element('span', 'project-kind', collection ? catalog.category(entry.category).label : project.type));
    const heading = element('h3', 'gallery-card-title', entry.title);
    heading.append(element('span', 'accent', '.'));
    text.append(heading, element('span', 'catalog-card-caption', collection ? 'Coleção do cliente' : project.client || 'Projeto Behi'));
    const arrow = element('span', 'gallery-card-arrow', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    meta.append(text, arrow); link.append(media, meta);
    if (!collection) link.dataset.projectId = project.id;
    item.append(link);
    return item;
  }
  list.replaceChildren(...items.map(card));
  document.querySelector('#gallery-empty').hidden = entries.length !== 0;
  if (!entries.length) setTitle(document.querySelector('#gallery-empty-title'), activeClient ? 'Esta coleção ainda não está disponível.' : category.emptyTitle || 'Novos projetos chegam por aqui.');
  document.querySelector('#gallery-empty-quote').href = quoteURL();
  document.querySelector('#gallery-quote').href = quoteURL();

  function pageLink(label, target, { disabled = false, current = false, ariaLabel } = {}) {
    const link = element('a', 'page-button', label);
    if (disabled) { link.setAttribute('aria-disabled', 'true'); link.tabIndex = -1; link.setAttribute('role', 'link'); }
    else link.href = route({ number: target }) + '#gallery-results';
    if (ariaLabel) link.setAttribute('aria-label', ariaLabel);
    if (current) link.setAttribute('aria-current', 'page');
    return link;
  }
  pagination.hidden = pages < 2;
  if (pages > 1) {
    pagination.append(pageLink('←', page - 1, { disabled: page === 1, ariaLabel: 'Página anterior' }));
    const visible = new Set([1, pages, page - 1, page, page + 1].filter(number => number > 0 && number <= pages));
    let previous = 0;
    [...visible].sort((a, b) => a - b).forEach(number => {
      if (number - previous > 1) pagination.append(element('span', 'page-ellipsis', '…'));
      pagination.append(pageLink(String(number).padStart(2, '0'), number, { current: number === page, ariaLabel: `Página ${number}` }));
      previous = number;
    });
    pagination.append(pageLink('→', page + 1, { disabled: page === pages, ariaLabel: 'Próxima página' }));
  }
  function renderImage() {
    const image = activeProject.images[imageIndex];
    dialogImage.src = image.src;
    dialogImage.alt = image.alt || activeProject.title;
    document.querySelector('#dialog-image-count').textContent = `${imageIndex + 1} / ${activeProject.images.length}`;
    document.querySelector('#dialog-image-nav').hidden = activeProject.images.length < 2;
    document.querySelector('#dialog-prev').disabled = imageIndex === 0;
    document.querySelector('#dialog-next').disabled = imageIndex === activeProject.images.length - 1;
  }
  function openProject(project, opener) {
    activeProject = project; imageIndex = 0; lastOpener = opener;
    document.querySelector('#dialog-title').textContent = project.title;
    document.querySelector('#dialog-type').textContent = project.type;
    document.querySelector('#dialog-description').textContent = project.description;
    document.querySelector('#dialog-quote').href = quoteURL(project);
    const link = document.querySelector('#dialog-source');
    link.hidden = !project.url;
    if (project.url) { link.href = project.url; link.textContent = (project.linkLabel || 'Conhecer o projeto') + ' ↗'; }
    renderImage(); dialog.showModal(); document.body.classList.add('dialog-open');
  }
  document.querySelector('#dialog-prev').addEventListener('click', () => { if (imageIndex > 0) { imageIndex--; renderImage(); } });
  document.querySelector('#dialog-next').addEventListener('click', () => { if (imageIndex < activeProject.images.length - 1) { imageIndex++; renderImage(); } });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && imageIndex > 0) { imageIndex--; renderImage(); event.preventDefault(); }
    if (event.key === 'ArrowRight' && imageIndex < activeProject.images.length - 1) { imageIndex++; renderImage(); event.preventDefault(); }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    (lastOpener || title).focus({ preventScroll: true });
    try { history.replaceState(null, '', route({ number: page })); } catch { /* Native links remain available. */ }
  });
  const selectedId = params.get('projeto');
  const selected = selectedProjects.find(project => project.id === selectedId);
  if (selected) openProject(selected, [...list.querySelectorAll('[data-project-id]')].find(link => link.dataset.projectId === selectedId));
})();
