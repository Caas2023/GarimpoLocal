#!/usr/bin/env node
/**
 * scripts/fetch-ibge-municipalities.js
 *
 * Busca o catálogo completo de municípios brasileiros via API pública do IBGE
 * e grava em src/lib/data/municipalities.json.
 *
 * Uso:
 *   node scripts/fetch-ibge-municipalities.js
 *
 * Fonte: https://servicodados.ibge.gov.br/api/v1/localidades/municipios
 * Licença: dados públicos IBGE (sem restrição de uso comercial declarada).
 * Rodar periodicamente para atualizar o catálogo quando o IBGE publicar novos IDs.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

const IBGE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome';
const OUT_PATH = path.join(__dirname, '..', 'src', 'lib', 'data', 'municipalities.json');

function toSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractUF(m) {
  if (m.microrregiao && m.microrregiao.mesorregiao) {
    return m.microrregiao.mesorregiao.UF;
  }
  if (m['regiao-imediata'] && m['regiao-imediata']['regiao-intermediaria']) {
    return m['regiao-imediata']['regiao-intermediaria'].UF;
  }
  return null;
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 60000 }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
      res.on('error', reject);
    }).on('error', reject).on('timeout', () => reject(new Error('Request timeout')));
  });
}

async function main() {
  console.log('Buscando municípios do IBGE…');
  const raw = await fetchJSON(IBGE_URL);
  console.log(`Recebidos: ${raw.length} registros`);

  const municipios = [];
  const errors = [];

  for (const m of raw) {
    const uf = extractUF(m);
    if (!uf) {
      errors.push({ id: m.id, nome: m.nome });
      continue;
    }
    municipios.push({
      id:          m.id,
      nome:        toSlug(m.nome),
      nomeExibicao: m.nome,
      estado_id:   uf.id,
      estado_sigla: uf.sigla,
    });
  }

  if (errors.length) {
    console.warn(`Municípios sem UF detectável (${errors.length}):`, errors.map(e => `${e.id}/${e.nome}`).join(', '));
  }

  const output = {
    _meta: {
      fonte:      'IBGE API: https://servicodados.ibge.gov.br/api/v1/localidades/municipios',
      data_carga: new Date().toISOString().slice(0, 10),
      total:      municipios.length,
      licenca:    'dados públicos IBGE',
    },
    municipios,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 0), 'utf8');
  const sizeKB = (fs.statSync(OUT_PATH).size / 1024).toFixed(0);
  console.log(`Gravado: ${OUT_PATH} (${sizeKB} KB, ${municipios.length} municípios)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
