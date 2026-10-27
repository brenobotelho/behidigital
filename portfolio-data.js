/* Add approved projects here. Images are files inside assets/portfolio/. */
window.BEHI_CATEGORIES = [
  { id: 'todos', label: 'Todos os projetos', title: 'Cada ideia, um novo ponto de vista.', description: 'Escolha o que você quer criar. Explore os projetos e as coleções de cada cliente para encontrar a sua próxima referência.', children: ['sites', 'design', 'conteudo', 'camisetas'] },
  { id: 'sites', label: 'Sites & landing pages', shortLabel: 'Sites', title: 'Sites que abrem novas possibilidades.', description: 'Conheça os sites e landing pages criados pela Behi. Cada projeto tem seu próprio espaço para você explorar.', emptyTitle: 'Seu próximo site começa aqui.', children: null },
  { id: 'design', label: 'Design & materiais gráficos', shortLabel: 'Design', title: 'Design para marcar presença.', description: 'Da identidade ao material de divulgação. Escolha o tipo de peça e conheça os trabalhos de cada cliente.', children: ['identidades', 'flyers', 'cartoes', 'cartoes-digitais', 'cardapios'] },
  { id: 'conteudo', label: 'Social & audiovisual', shortLabel: 'Social & vídeo', title: 'Conteúdo com a cara de cada marca.', description: 'Explore as coleções de social media e produção audiovisual, organizadas por cliente.', children: ['social', 'audiovisual'] },
  { id: 'camisetas', label: 'Camisetas & estampas', shortLabel: 'Estampas', title: 'Ideias que vestem a sua história.', description: 'Times, turmas e eventos. Veja as estampas reunidas por cliente e encontre uma referência para a sua.', groupByClient: true },
  { id: 'identidades', label: 'Identidades visuais', title: 'Uma identidade. Muitas possibilidades.', description: 'Conheça as identidades criadas pela Behi e explore a coleção de cada marca.', groupByClient: true },
  { id: 'flyers', label: 'Flyers', title: 'Cada cliente, uma coleção de ideias.', description: 'Artes para divulgar, convidar e movimentar. Abra a coleção de um cliente para ver todos os flyers criados para ele.', groupByClient: true },
  { id: 'cartoes', label: 'Cartões físicos', title: 'Uma boa impressão começa no detalhe.', description: 'Explore os cartões de visita criados pela Behi. Cada trabalho aparece individualmente para você conhecer.', groupByClient: false },
  { id: 'cartoes-digitais', label: 'Cartões digitais', title: 'Sua apresentação a um toque.', description: 'Conheça os projetos de cartões digitais e encontre uma referência para apresentar seu negócio.', groupByClient: false },
  { id: 'cardapios', label: 'Cardápios', title: 'Seu cardápio também abre o apetite.', description: 'Conheça os cardápios criados para apresentar produtos e facilitar a escolha dos clientes.', groupByClient: false },
  { id: 'social', label: 'Social media', title: 'A presença de cada marca, reunida aqui.', description: 'Escolha um cliente e explore as peças de social media criadas para a comunicação dele.', groupByClient: true },
  { id: 'audiovisual', label: 'Audiovisual', title: 'Histórias que ganham movimento.', description: 'Conheça os projetos audiovisuais organizados por cliente e veja cada ideia ganhar forma.', groupByClient: true }
];
window.BEHI_PROJECTS = [
  {
    id: 'bendita-ka', title: 'Bendita Ka', client: 'Bendita Ka', clientId: 'bendita-ka', category: 'identidades', type: 'Identidade visual',
    description: 'Projeto de identidade visual apresentado no portfólio de Breno Botelho.',
    cover: './assets/projeto-bendita-ka.webp',
    images: [{ src: './assets/projeto-bendita-ka.webp', alt: 'Identidade visual Bendita Ka, com assinatura branca sobre fundo azul esverdeado.' }],
    url: 'https://www.behance.net/gallery/223162437/Identidade-Visual-Bendita-Ka', linkLabel: 'ver apresentação no Behance'
  },
  {
    id: 'danilo-meireles', title: 'Danilo Meireles', client: 'Danilo Meireles', clientId: 'danilo-meireles', category: 'identidades', type: 'Identidade visual · advocacia',
    description: 'Identidade visual de Danilo Meireles Advogado, criada por Breno Botelho.',
    cover: './assets/projeto-danilo-meireles.webp',
    images: [{ src: './assets/projeto-danilo-meireles.webp', alt: 'Monograma DM e assinatura Danilo Meireles Advogado sobre composição escura.' }],
    url: 'https://www.behance.net/gallery/222918263/Identidade-Visual-Danilo-Meireles-Advogado', linkLabel: 'ver apresentação no Behance'
  },
  {
    id: 'alquimia-drinks', title: 'Alquimia dos Drinks', client: 'Alquimia dos Drinks', clientId: 'alquimia-drinks', category: 'identidades', type: 'Identidade visual',
    description: 'Projeto de identidade visual Alquimia dos Drinks, do portfólio de Breno Botelho.',
    cover: './assets/projeto-alquimia-drinks.webp',
    images: [{ src: './assets/projeto-alquimia-drinks.webp', alt: 'Apresentação da identidade visual Alquimia dos Drinks.' }],
    url: 'https://www.behance.net/gallery/218591045/Identidade-Visual-Alquimia-dos-Drinks', linkLabel: 'ver apresentação no Behance'
  }
];
