(() => {
  const projects = window.BEHI_PROJECTS || [];
  const categories = window.BEHI_CATEGORIES || [];
  const pageSize = 2;
  const list = document.querySelector('#gallery-list');
  const filters = document.querySelector('#gallery-filters');
  const pagination = document.querySelector('#gallery-pagination');
  const status = document.querySelector('#gallery-status');
  const empty = document.querySelector('#gallery-empty');
  const dialog = document.querySelector('#project-dialog');
  const dialogImage = document.querySelector('#dialog-image');
  let activeCategory = 'todos';
  let page = 1;
  let activeProject;
  let imageIndex = 0;
  let lastOpener;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function fromURL() {
    const params = new URLSearchParams(location.search);
    activeCategory = categories.some(category => category.id === params.get('tipo')) ? params.get('tipo') : 'todos';
    const requested = Number(params.get('pagina') || 1);
    page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1;
  }
  function route(category = activeCategory, pageNumber = page, projectId) {
    const params = new URLSearchParams();
    if (category !== 'todos') params.set('tipo', category);
    if (pageNumber > 1) params.set('pagina', String(pageNumber));
    if (projectId) params.set('projeto', projectId);
    const query = params.toString();
    return './projetos.html' + (query ? '?' + query : '');
  }
  function card(project, index) {
    const item = element('li', 'gallery-item');
    item.style.setProperty('--card-delay', `${index * .08}s`);
    const button = element('a', 'gallery-card');
    button.href = route(activeCategory, page, project.id);
    button.setAttribute('aria-label', `Ver projeto ${project.title}`);
    const media = element('span', 'gallery-card-media');
    const image = element('img');
    image.src = project.cover;
    image.alt = project.images[0]?.alt || project.title;
    image.width = 808;
    image.height = 632;
    image.loading = 'lazy';
    image.decoding = 'async';
    const view = element('span', 'gallery-view', 'ver projeto ↗');
    view.setAttribute('aria-hidden', 'true');
    media.append(image, view);
    const meta = element('span', 'gallery-card-meta');
    const text = element('span');
    text.append(element('span', 'project-kind', project.type));
    const title = element('span', 'gallery-card-title', project.title);
    title.append(element('span', 'accent', '.'));
    text.append(title);
    const arrow = element('span', 'gallery-card-arrow', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    meta.append(text, arrow);
    button.append(media, meta);
    button.dataset.projectId = project.id;
    item.append(button);
    return item;
  }
  function pageButton(label, target, { disabled = false, current = false, ariaLabel } = {}) {
    const button = element('a', 'page-button', label);
    if (disabled) { button.setAttribute('aria-disabled', 'true'); button.tabIndex = -1; button.setAttribute('role', 'link'); }
    else button.href = route(activeCategory, target);
    if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
    if (current) button.setAttribute('aria-current', 'page');
    button.dataset.page = String(target);
    return button;
  }
  function render() {
    const filtered = activeCategory === 'todos' ? projects : projects.filter(project => project.category === activeCategory);
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.min(page, pages);
    filters.querySelectorAll('a').forEach(button => button.setAttribute('aria-current', button.dataset.category === activeCategory ? 'true' : 'false'));
    list.replaceChildren(...filtered.slice((page - 1) * pageSize, page * pageSize).map(card));
    empty.hidden = filtered.length !== 0;
    status.textContent = `${filtered.length} ${filtered.length === 1 ? 'projeto' : 'projetos'} · página ${page} de ${pages}`;
    document.querySelector('#gallery-total').textContent = String(projects.length).padStart(2, '0');
    pagination.replaceChildren();
    pagination.hidden = filtered.length === 0;
    pagination.append(pageButton('←', page - 1, { disabled: page === 1, ariaLabel: 'Página anterior' }));
    // A compact page window keeps the controls usable as the catalog grows.
    const visible = new Set([1, pages, page - 1, page, page + 1].filter(number => number > 0 && number <= pages));
    let previous = 0;
    [...visible].sort((a, b) => a - b).forEach(number => {
      if (number - previous > 1) pagination.append(element('span', 'page-ellipsis', '…'));
      pagination.append(pageButton(String(number).padStart(2, '0'), number, { current: number === page, ariaLabel: `Página ${number}` }));
      previous = number;
    });
    pagination.append(pageButton('→', page + 1, { disabled: page === pages, ariaLabel: 'Próxima página' }));
  }
  categories.forEach(category => {
    const count = category.id === 'todos' ? projects.length : projects.filter(project => project.category === category.id).length;
    const button = element('a', 'filter-button');
    button.href = route(category.id, 1);
    button.dataset.category = category.id;
    button.append(document.createTextNode(category.label + ' '), element('span', 'filter-count', String(count).padStart(2, '0')));
    filters.append(button);
  });

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
    activeProject = project;
    imageIndex = 0;
    lastOpener = opener;
    document.querySelector('#dialog-title').textContent = project.title;
    document.querySelector('#dialog-type').textContent = project.type;
    document.querySelector('#dialog-description').textContent = project.description;
    const link = document.querySelector('#dialog-source');
    link.hidden = !project.url;
    if (project.url) { link.href = project.url; link.textContent = (project.linkLabel || 'conhecer o projeto') + ' ↗'; }
    renderImage();
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
  function closeProject() { dialog.close(); }
  document.querySelector('#dialog-prev').addEventListener('click', () => { if (imageIndex > 0) { imageIndex--; renderImage(); } });
  document.querySelector('#dialog-next').addEventListener('click', () => { if (imageIndex < activeProject.images.length - 1) { imageIndex++; renderImage(); } });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && imageIndex > 0) { imageIndex--; renderImage(); event.preventDefault(); }
    if (event.key === 'ArrowRight' && imageIndex < activeProject.images.length - 1) { imageIndex++; renderImage(); event.preventDefault(); }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProject();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    lastOpener?.focus({ preventScroll: true });
    try { history.replaceState(null, '', route()); } catch { /* Native navigation remains available. */ }
  });
  addEventListener('popstate', () => { fromURL(); render(); });
  fromURL();
  render();
  const selectedId = new URLSearchParams(location.search).get('projeto');
  const selected = projects.find(project => project.id === selectedId);
  if (selected) openProject(selected, Array.from(list.querySelectorAll('[data-project-id]')).find(card => card.dataset.projectId === selectedId));
})();
