const quoteForm = document.querySelector('#quote-form');
if (quoteForm) {
  quoteForm.hidden = false;
  quoteForm.querySelectorAll('input:not([type="hidden"]), textarea').forEach(field => {
    field.addEventListener('input', () => field.setCustomValidity(''));
  });
  quoteForm.addEventListener('submit', event => {
    const name = document.querySelector('#quote-name').value.trim();
    const business = document.querySelector('#quote-business').value.trim();
    const service = document.querySelector('#quote-service').value;
    const idea = document.querySelector('#quote-idea').value.trim();
    if (!name || idea.length < 10) {
      event.preventDefault();
      const field = document.querySelector(!name ? '#quote-name' : '#quote-idea');
      field.setCustomValidity(!name ? 'Conte seu nome para continuarmos.' : 'Conte um pouco mais da sua ideia, com pelo menos 10 caracteres.');
      field.reportValidity();
      return;
    }
    const lines = ['Olá! Vim pelo site da Behi e gostaria de um orçamento.', '', `Nome: ${name}`];
    if (business) lines.push(`Negócio: ${business}`);
    lines.push(`Projeto: ${service}`, '', idea);
    // Only this hidden field is named: native GET submits one encoded message.
    document.querySelector('#quote-message').value = lines.join('\n');
    document.querySelector('#quote-status').hidden = false;
  });
}
