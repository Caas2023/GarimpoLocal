const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const rawHtml = fs.readFileSync('index.html', 'utf8');

/**
 * Normaliza o HTML para que as asserções dependam da marcação e não da
 * formatação. O Prettier quebra tags longas em várias linhas (`</label\n>`,
 * `<input\n  id="hero"`), o que fazia o teste falhar por reasons de layout e
 * nao de acessibilidade.
 */
const html = rawHtml.replace(/\s+/g, ' ').replace(/\s+>/g, '>').replace(/<\s+/g, '<');

test('controles da homepage têm nomes acessíveis e busca usa tipo search', () => {
  assert.match(html, /<label class="sr-only" for="hero">Buscar empresa ou serviço<\/label>/);
  assert.match(html, /<input id="hero" name="q" type="search"/);
  assert.match(
    html,
    /<label class="sr-only" for="search">Buscar por nome, bairro ou categoria<\/label>/,
  );
  assert.match(html, /<label class="sr-only" for="filter">Filtrar por categoria<\/label>/);
  assert.match(html, /<select id="qcat" aria-label="Qual serviço\?">/);
  assert.match(html, /<label class="sr-only" for="qcontact">Seu e-mail ou WhatsApp<\/label>/);
});

test('JSON-LD da homepage usa contexto Schema.org válido', () => {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'JSON-LD ausente');
  const schema = JSON.parse(match[1]);
  assert.equal(schema['@context'], 'https://schema.org');
  assert.equal(schema['@type'], 'WebSite');
});
