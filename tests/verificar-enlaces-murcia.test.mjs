import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { checkYear, evaluateText } from '../scripts/verificar-enlaces-murcia.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'scripts', 'verificar-enlaces-murcia.mjs');

test('año: "PAU2026" en la cabecera es válido aunque el cuerpo cite otros años', () => {
  assert.equal(checkYear('PRUEBAS DE ACCESO A LA UNIVERSIDAD 301- LENGUA CASTELLANA PAU2026 – JUNIO IMPORTANTE').result, 'ok');
  assert.equal(checkYear('PAU2026 - JULIO ' + 'texto '.repeat(80) + 'según el decreto de 2025 y la edición 2024').result, 'ok');
  assert.equal(checkYear('PRUEBA DE ACCESO 315 – EMPRESA PAU 2026 - JUNIO').result, 'ok');
  assert.equal(checkYear('Curso 2025-2026 convocatoria de junio').result, 'ok');
});

test('año: usa límites de dígito, no de palabra', () => {
  assert.equal(checkYear('PAU20260 - JUNIO').result, 'warn');
  assert.equal(checkYear('Código 120261 sin año').result, 'warn');
});

test('año: falla solo si la cabecera indica otro año', () => {
  assert.equal(checkYear('PAU2025 – JULIO ' + 'x '.repeat(200)).result, 'fail');
  assert.equal(checkYear('Examen de junio de 2024').result, 'fail');
  // otro año solo en el cuerpo y ninguno en la cabecera: se pide revisión, no falla
  assert.equal(checkYear('INSTRUCCIONES ' + 'palabra '.repeat(60) + 'convocatoria 2025').result, 'warn');
  assert.equal(checkYear('Sin ningún año en la página').result, 'warn');
});

test('evaluateText: cabecera real de la UMU con código y nombre abreviado pasa', () => {
  const target = { key: '307-ordinaria', url: 'https://www.um.es/documents/d/estudios/pau2026-307-x-pdf', convocatoria: 'ordinaria', tipoEnlace: 'examen', materia: 'Matemáticas Aplicadas a las CCSS', materiaRef: { codigo: 307, materia: 'Matemáticas Aplicadas a las CCSS', slug: 'matematicas-aplicadas-a-las-ciencias-sociales-ii' } };
  const result = evaluateText(target, 'PRUEBA DE ACCESO A LA UNIVERSIDAD 307 - MATEMÁTICAS CCSS PAU2026 - JUNIO NOTA IMPORTANTE: Las dos primeras preguntas son obligatorias.');
  assert.equal(result.status, 'pass');
});

test('evaluateText: convocatoria equivocada o materia distinta no pasan', () => {
  const base = { key: '316-ordinaria', url: 'https://www.um.es/x', convocatoria: 'ordinaria', tipoEnlace: 'examen', materia: 'Física', materiaRef: { codigo: 316, materia: 'Física', slug: 'fisica' } };
  assert.equal(evaluateText(base, 'PRUEBA DE ACCESO A LA UNIVERSIDAD 316 - FÍSICA PAU2026 - JULIO Todas las preguntas').status, 'fail');
  assert.equal(evaluateText(base, 'PRUEBA DE ACCESO A LA UNIVERSIDAD 322 - QUÍMICA PAU2026 - JUNIO Cuestiones').status, 'fail');
});

test('--revalidar reevalúa los textos guardados sin descargar nada y regenera el informe', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'revalidar-'));
  try {
    const json = {
      materias: [{ codigo: 301, materia: 'Lengua Castellana y Literatura II', slug: 'lengua-castellana-y-literatura-ii', estado: 'completo', avisos: [],
        ordinaria_junio_2026: { examen: 'https://www.um.es/documents/d/estudios/a-pdf', criterios: null },
        extraordinaria_julio_2026: { examen: 'https://www.um.es/documents/d/estudios/b-pdf', criterios: null } }],
    };
    writeFileSync(path.join(dir, 'murcia.json'), JSON.stringify(json));
    mkdirSync(path.join(dir, 'out', 'textos'), { recursive: true });
    writeFileSync(path.join(dir, 'out', 'textos', '301-ordinaria.txt'), 'PRUEBAS DE ACCESO A LA UNIVERSIDAD 301- LENGUA CASTELLANA Y LITERATURA II PAU2026 – JUNIO IMPORTANTE\n\f página dos 2025\n');
    writeFileSync(path.join(dir, 'out', 'textos', '301-extraordinaria.txt'), 'PRUEBAS DE ACCESO A LA UNIVERSIDAD 301- LENGUA CASTELLANA Y LITERATURA II PAU2026 – JULIO IMPORTANTE\n\f2024\n');
    writeFileSync(path.join(dir, 'out', 'textos', 'estructura-pruebas.txt'), 'PAU2026 ESTRUCTURA DE LAS PRUEBAS DE ACCESO (PAU2026) Las Pruebas de Acceso a la Universidad\n\f');
    const run = spawnSync('node', [SCRIPT, '--revalidar', '--json', path.join(dir, 'murcia.json'), '--out-dir', path.join(dir, 'out'), '--report', path.join(dir, 'v.md')], { encoding: 'utf8', env: { ...process.env, https_proxy: '', HTTPS_PROXY: '' } });
    assert.equal(run.status, 0, run.stderr);
    const state = JSON.parse(readFileSync(path.join(dir, 'out', 'verificacion.json'), 'utf8'));
    assert.equal(state.resultados['301-ordinaria'].status, 'pass');
    assert.equal(state.resultados['301-extraordinaria'].status, 'pass');
    assert.equal(state.resultados['estructura-pruebas'].status, 'pass');
    assert(readFileSync(path.join(dir, 'v.md'), 'utf8').includes('✅ pasa'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
