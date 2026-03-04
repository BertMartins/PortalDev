/* ============================================================
   STATE
   ============================================================ */
let fields = [];
let generatedPayloads = [];
let savedTemplates = [];
let loadTestAbort = null;

/* ============================================================
   DARK / LIGHT MODE
   ============================================================ */
(function initTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.classList.add('light');
  }
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(e) {
    if (e.matches) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  });
})();

/* ============================================================
   TABS
   ============================================================ */
document.querySelectorAll('.tab-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
    btn.classList.add('active');
    var panel = document.getElementById('panel-' + btn.dataset.tab);
    if (panel) panel.classList.add('active');
  });
});

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  var panel = document.getElementById('panel-' + tabName);
  if (panel) panel.classList.add('active');
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg, type) {
  type = type || 'info';
  var icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  var el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i> ' + msg;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(function() { el.style.opacity = '0'; el.style.transform = 'translateX(40px)'; setTimeout(function() { el.remove(); }, 300); }, 3000);
}

/* ============================================================
   MODAL (replaces confirm/prompt)
   ============================================================ */
function showModal(title, message, onConfirm, opts) {
  opts = opts || {};
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  var hasInput = !!opts.input;
  overlay.innerHTML =
    '<div class="modal">' +
    '<h3>' + title + '</h3>' +
    '<p>' + message + '</p>' +
    (hasInput ? '<input type="text" id="modalInput" value="' + (opts.inputValue || '') + '" placeholder="' + (opts.inputPlaceholder || '') + '" style="margin-bottom:16px">' : '') +
    '<div class="modal-actions">' +
    '<button class="btn btn-secondary btn-sm" id="modalCancel">Cancelar</button>' +
    '<button class="btn btn-primary btn-sm" id="modalConfirm">' + (opts.confirmText || 'Confirmar') + '</button>' +
    '</div></div>';
  document.body.appendChild(overlay);
  overlay.querySelector('#modalCancel').onclick = function() { overlay.remove(); };
  overlay.querySelector('#modalConfirm').onclick = function() {
    var val = hasInput ? overlay.querySelector('#modalInput').value : true;
    overlay.remove();
    if (onConfirm) onConfirm(val);
  };
  if (hasInput) {
    setTimeout(function() { overlay.querySelector('#modalInput').focus(); }, 100);
  }
}

/* ============================================================
   DATA TYPES
   ============================================================ */
var DATA_TYPES = [
  { value: 'string', label: 'String Aleatória', icon: 'fa-font' },
  { value: 'int', label: 'Inteiro', icon: 'fa-hashtag' },
  { value: 'decimal', label: 'Decimal', icon: 'fa-percentage' },
  { value: 'boolean', label: 'Booleano', icon: 'fa-toggle-on' },
  { value: 'cpf', label: 'CPF Válido', icon: 'fa-id-card' },
  { value: 'cnpj', label: 'CNPJ Válido', icon: 'fa-building' },
  { value: 'email', label: 'Email', icon: 'fa-envelope' },
  { value: 'telefone', label: 'Telefone', icon: 'fa-phone' },
  { value: 'cep', label: 'CEP', icon: 'fa-map-pin' },
  { value: 'date', label: 'Data (DD/MM/YYYY)', icon: 'fa-calendar' },
  { value: 'timestamp', label: 'Timestamp ISO', icon: 'fa-clock' },
  { value: 'uuid', label: 'UUID', icon: 'fa-fingerprint' },
  { value: 'enum', label: 'Enum (valores fixos)', icon: 'fa-list' },
  { value: 'null', label: 'Nulo', icon: 'fa-ban' }
];

/* ============================================================
   DATA GENERATORS
   ============================================================ */
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randChar() { var c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; return c[randInt(0, c.length - 1)]; }
function randString(min, max) { var len = randInt(min, max); var s = ''; for (var i = 0; i < len; i++) s += randChar(); return s; }

function generateCPF(valid) {
  var d = [];
  var i, sum, r;
  for (i = 0; i < 9; i++) d.push(randInt(0, 9));
  sum = 0;
  for (i = 0; i < 9; i++) sum += d[i] * (10 - i);
  r = sum % 11;
  d.push(r < 2 ? 0 : 11 - r);
  sum = 0;
  for (i = 0; i < 10; i++) sum += d[i] * (11 - i);
  r = sum % 11;
  d.push(r < 2 ? 0 : 11 - r);
  if (!valid) { d[9] = (d[9] + randInt(1, 9)) % 10; }
  return d.join('');
}

function generateCNPJ(valid) {
  var d = [];
  var i, sum, r;
  for (i = 0; i < 8; i++) d.push(randInt(0, 9));
  d.push(0, 0, 0, 1);
  var w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (i = 0; i < 12; i++) sum += d[i] * w1[i];
  r = sum % 11;
  d.push(r < 2 ? 0 : 11 - r);
  var w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (i = 0; i < 13; i++) sum += d[i] * w2[i];
  r = sum % 11;
  d.push(r < 2 ? 0 : 11 - r);
  if (!valid) { d[12] = (d[12] + randInt(1, 9)) % 10; }
  return d.join('');
}

function generateEmail(valid) {
  var names = ['joao', 'maria', 'pedro', 'ana', 'lucas', 'julia', 'carlos', 'fernanda', 'rafael', 'camila'];
  var domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'empresa.com.br', 'teste.io'];
  var name = names[randInt(0, names.length - 1)] + randInt(1, 999);
  if (!valid) {
    var badOpts = ['missing-at.com', 'user@', '@domain.com', 'user@@domain.com', 'user@.com'];
    return badOpts[randInt(0, badOpts.length - 1)];
  }
  return name + '@' + domains[randInt(0, domains.length - 1)];
}

function generatePhone() {
  return '(' + randInt(11, 99) + ') 9' + randInt(1000, 9999) + '-' + randInt(1000, 9999);
}

function generateCEP() {
  return String(randInt(10000, 99999)) + '-' + String(randInt(100, 999));
}

function generateDate(minDate, maxDate) {
  var min = minDate ? new Date(minDate).getTime() : new Date(1950, 0, 1).getTime();
  var max = maxDate ? new Date(maxDate).getTime() : new Date(2025, 11, 31).getTime();
  var d = new Date(randInt(min, max));
  var dd = String(d.getDate()).padStart(2, '0');
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  return dd + '/' + mm + '/' + d.getFullYear();
}

function generateTimestamp(minDate, maxDate) {
  var min = minDate ? new Date(minDate).getTime() : new Date(2020, 0, 1).getTime();
  var max = maxDate ? new Date(maxDate).getTime() : Date.now();
  return new Date(randInt(min, max)).toISOString();
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function generateValue(field) {
  var t = field.type;
  var inv = field.invalid;
  var opts = field.options || {};

  if (inv && Math.random() < 0.3) return null;

  switch (t) {
    case 'string':
      if (inv) { return Math.random() < 0.5 ? '' : randString(500, 1000); }
      return randString(opts.minLen || 5, opts.maxLen || 15);
    case 'int':
      if (inv) { return 'NaN_' + randString(3, 5); }
      return randInt(opts.min != null ? Number(opts.min) : 0, opts.max != null ? Number(opts.max) : 10000);
    case 'decimal':
      if (inv) { return 'invalid_decimal'; }
      var lo = opts.min != null ? Number(opts.min) : 0;
      var hi = opts.max != null ? Number(opts.max) : 10000;
      var prec = opts.precision != null ? Number(opts.precision) : 2;
      return parseFloat((Math.random() * (hi - lo) + lo).toFixed(prec));
    case 'boolean':
      if (inv) { return 'maybe'; }
      return Math.random() < 0.5;
    case 'cpf':
      return generateCPF(!inv);
    case 'cnpj':
      return generateCNPJ(!inv);
    case 'email':
      return generateEmail(!inv);
    case 'telefone':
      if (inv) { return '123'; }
      return generatePhone();
    case 'cep':
      if (inv) { return 'ABCDE-FGH'; }
      return generateCEP();
    case 'date':
      if (inv) { return '32/13/2025'; }
      return generateDate(opts.minDate, opts.maxDate);
    case 'timestamp':
      if (inv) { return 'not-a-timestamp'; }
      return generateTimestamp(opts.minDate, opts.maxDate);
    case 'uuid':
      if (inv) { return 'not-a-uuid'; }
      return generateUUID();
    case 'enum':
      var vals = (opts.enumValues || 'A,B,C').split(',').map(function(v) { return v.trim(); }).filter(Boolean);
      if (inv) { return 'INVALID_ENUM_' + randString(3, 5); }
      return vals[randInt(0, vals.length - 1)];
    case 'null':
      return null;
    default:
      return randString(5, 10);
  }
}

/* ============================================================
   FIELD MANAGEMENT
   ============================================================ */
function generateFields() {
  var n = parseInt(document.getElementById('numFields').value, 10);
  if (!n || n < 1 || n > 50) {
    document.getElementById('numFields').classList.add('error');
    showToast('Informe entre 1 e 50 campos.', 'error');
    return;
  }
  document.getElementById('numFields').classList.remove('error');
  fields = [];
  for (var i = 0; i < n; i++) {
    fields.push({ name: '', type: 'string', invalid: false, options: {}, showOptions: false });
  }
  renderFields();
  document.getElementById('fieldsCard').style.display = 'block';
  document.getElementById('actionsCard').style.display = 'block';
}

function addSingleField() {
  fields.push({ name: '', type: 'string', invalid: false, options: {}, showOptions: false });
  renderFields();
}

function removeField(idx) {
  fields.splice(idx, 1);
  renderFields();
}

function renderFields() {
  var container = document.getElementById('fieldsContainer');
  container.innerHTML = '';
  fields.forEach(function(f, idx) {
    var typeOptions = DATA_TYPES.map(function(dt) {
      return '<option value="' + dt.value + '"' + (f.type === dt.value ? ' selected' : '') + '>' + dt.label + '</option>';
    }).join('');

    var optsHtml = getOptionsHTML(f, idx);

    var row = document.createElement('div');
    row.className = 'field-row';
    row.innerHTML =
      '<div class="field-num">' + (idx + 1) + '</div>' +
      '<div class="form-group"><label>Nome do Campo</label><input type="text" value="' + escHtml(f.name) + '" placeholder="ex: nome" onchange="updateFieldName(' + idx + ', this.value)" id="fname-' + idx + '"></div>' +
      '<div class="form-group"><label>Tipo</label><select onchange="updateFieldType(' + idx + ', this.value)">' + typeOptions + '</select></div>' +
      '<div class="field-actions">' +
        '<div class="toggle-wrap"><div class="toggle' + (f.invalid ? ' on' : '') + '" onclick="toggleInvalid(' + idx + ')" title="Gerar dados inválidos"></div><span class="toggle-label">Inválido</span></div>' +
        '<button class="btn-icon" onclick="toggleOptions(' + idx + ')" title="Opções"><i class="fas fa-sliders-h"></i></button>' +
        '<button class="btn-icon delete" onclick="removeField(' + idx + ')" title="Remover"><i class="fas fa-trash"></i></button>' +
      '</div>' +
      '<div class="field-options' + (f.showOptions ? ' visible' : '') + '" id="fopts-' + idx + '">' + optsHtml + '</div>';
    container.appendChild(row);
  });
}

function getOptionsHTML(f, idx) {
  var o = f.options || {};
  switch (f.type) {
    case 'string':
      return '<div class="opts-grid">' +
        '<div class="form-group"><label>Tamanho Mín.</label><input type="number" value="' + (o.minLen || 5) + '" onchange="updateOpt(' + idx + ',\'minLen\',this.value)" placeholder="5"></div>' +
        '<div class="form-group"><label>Tamanho Máx.</label><input type="number" value="' + (o.maxLen || 15) + '" onchange="updateOpt(' + idx + ',\'maxLen\',this.value)" placeholder="15"></div>' +
        '</div>';
    case 'int':
      return '<div class="opts-grid">' +
        '<div class="form-group"><label>Valor Mín.</label><input type="number" value="' + (o.min != null ? o.min : 0) + '" onchange="updateOpt(' + idx + ',\'min\',this.value)" placeholder="0"></div>' +
        '<div class="form-group"><label>Valor Máx.</label><input type="number" value="' + (o.max != null ? o.max : 10000) + '" onchange="updateOpt(' + idx + ',\'max\',this.value)" placeholder="10000"></div>' +
        '</div>';
    case 'decimal':
      return '<div class="opts-grid">' +
        '<div class="form-group"><label>Valor Mín.</label><input type="number" value="' + (o.min != null ? o.min : 0) + '" onchange="updateOpt(' + idx + ',\'min\',this.value)"></div>' +
        '<div class="form-group"><label>Valor Máx.</label><input type="number" value="' + (o.max != null ? o.max : 10000) + '" onchange="updateOpt(' + idx + ',\'max\',this.value)"></div>' +
        '<div class="form-group"><label>Casas Decimais</label><input type="number" value="' + (o.precision != null ? o.precision : 2) + '" onchange="updateOpt(' + idx + ',\'precision\',this.value)" min="0" max="10"></div>' +
        '</div>';
    case 'date':
    case 'timestamp':
      return '<div class="opts-grid">' +
        '<div class="form-group"><label>Data Mín.</label><input type="date" value="' + (o.minDate || '') + '" onchange="updateOpt(' + idx + ',\'minDate\',this.value)"></div>' +
        '<div class="form-group"><label>Data Máx.</label><input type="date" value="' + (o.maxDate || '') + '" onchange="updateOpt(' + idx + ',\'maxDate\',this.value)"></div>' +
        '</div>';
    case 'enum':
      return '<div class="form-group"><label>Valores (separados por vírgula)</label><input type="text" value="' + escHtml(o.enumValues || 'ativo,inativo,pendente') + '" onchange="updateOpt(' + idx + ',\'enumValues\',this.value)" placeholder="valor1,valor2,valor3"></div>';
    default:
      return '<p class="text-xs text-muted">Sem opções adicionais para este tipo.</p>';
  }
}

function updateFieldName(idx, val) { fields[idx].name = val; }
function updateFieldType(idx, val) {
  fields[idx].type = val;
  fields[idx].options = {};
  renderFields();
}
function updateOpt(idx, key, val) { fields[idx].options[key] = val; }
function toggleInvalid(idx) {
  fields[idx].invalid = !fields[idx].invalid;
  renderFields();
}
function toggleOptions(idx) {
  fields[idx].showOptions = !fields[idx].showOptions;
  var el = document.getElementById('fopts-' + idx);
  if (el) el.classList.toggle('visible');
}

function escHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ============================================================
   VALIDATION
   ============================================================ */
function validateFields() {
  var valid = true;
  var numReq = parseInt(document.getElementById('numRequests').value, 10);
  if (!numReq || numReq < 1) {
    document.getElementById('numRequests').classList.add('error');
    valid = false;
  } else {
    document.getElementById('numRequests').classList.remove('error');
  }
  if (fields.length === 0) {
    showToast('Configure os campos primeiro.', 'error');
    return false;
  }
  fields.forEach(function(f, i) {
    var inp = document.getElementById('fname-' + i);
    if (!f.name || !f.name.trim()) {
      if (inp) inp.classList.add('error');
      valid = false;
    } else {
      if (inp) inp.classList.remove('error');
    }
  });
  if (!valid) showToast('Preencha todos os campos obrigatórios.', 'error');
  return valid;
}

/* ============================================================
   GENERATE PAYLOADS
   ============================================================ */
function buildPayloads(count) {
  var payloads = [];
  for (var i = 0; i < count; i++) {
    var obj = {};
    fields.forEach(function(f) {
      if (f.name && f.name.trim()) {
        obj[f.name.trim()] = generateValue(f);
      }
    });
    payloads.push(obj);
  }
  return payloads;
}

function generatePayloads() {
  if (!validateFields()) return;
  var count = parseInt(document.getElementById('numRequests').value, 10);
  generatedPayloads = buildPayloads(count);
  var format = document.getElementById('exportFormat').value;
  var content = formatPayloads(generatedPayloads, format);
  var ext = { json: '.json', ndjson: '.ndjson', csv: '.csv', sql: '.sql', postman: '.postman_collection.json' };
  var mime = { json: 'application/json', ndjson: 'application/x-ndjson', csv: 'text/csv', sql: 'text/plain', postman: 'application/json' };
  downloadFile(content, 'payloads' + (ext[format] || '.json'), mime[format] || 'application/json');
  showToast(count + ' payloads gerados e baixados com sucesso!', 'success');
}

/* ============================================================
   FORMAT / EXPORT
   ============================================================ */
function formatPayloads(payloads, format) {
  switch (format) {
    case 'json':
      return JSON.stringify(payloads, null, 2);
    case 'ndjson':
      return payloads.map(function(p) { return JSON.stringify(p); }).join('\n');
    case 'csv': {
      if (payloads.length === 0) return '';
      var keys = Object.keys(payloads[0]);
      var lines = [keys.join(',')];
      payloads.forEach(function(p) {
        lines.push(keys.map(function(k) {
          var v = p[k];
          if (v === null || v === undefined) return '';
          if (typeof v === 'string') return '"' + v.replace(/"/g, '""') + '"';
          return String(v);
        }).join(','));
      });
      return lines.join('\n');
    }
    case 'sql': {
      var table = document.getElementById('sqlTableName').value || 'api_test_data';
      if (payloads.length === 0) return '';
      var cols = Object.keys(payloads[0]);
      return payloads.map(function(p) {
        var vals = cols.map(function(k) {
          var v = p[k];
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
          if (typeof v === 'number') return String(v);
          return "'" + String(v).replace(/'/g, "''") + "'";
        }).join(', ');
        return 'INSERT INTO ' + table + ' (' + cols.join(', ') + ') VALUES (' + vals + ');';
      }).join('\n');
    }
    case 'postman': {
      var collection = {
        info: {
          name: 'Generated API Tests',
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: payloads.map(function(p, i) {
          return {
            name: 'Request ' + (i + 1),
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: { mode: 'raw', raw: JSON.stringify(p, null, 2), options: { raw: { language: 'json' } } },
              url: { raw: '{{base_url}}/endpoint', host: ['{{base_url}}'], path: ['endpoint'] }
            }
          };
        })
      };
      return JSON.stringify(collection, null, 2);
    }
    default:
      return JSON.stringify(payloads, null, 2);
  }
}

function downloadFile(content, filename, mimeType) {
  var blob = new Blob([content], { type: mimeType });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ============================================================
   PREVIEW
   ============================================================ */
function previewPayloads() {
  if (!validateFields()) return;
  var sample = buildPayloads(Math.min(3, parseInt(document.getElementById('numRequests').value, 10) || 3));
  var json = JSON.stringify(sample, null, 2);
  document.getElementById('previewContent').innerHTML = syntaxHighlight(json);
  document.getElementById('previewInfo').textContent = 'Mostrando ' + sample.length + ' de ' + (document.getElementById('numRequests').value || 0) + ' payloads.';
  switchTab('preview');
  showToast('Preview gerado!', 'info');
}

function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function(match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      cls = /:$/.test(match) ? 'key' : 'string';
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

function copyPreview() {
  var text = document.getElementById('previewContent').textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('JSON copiado!', 'success');
    });
  }
}

/* ============================================================
   IMPORT TEMPLATE
   ============================================================ */
function importTemplate() {
  var raw = document.getElementById('importJson').value.trim();
  if (!raw) { showToast('Cole um JSON para importar.', 'error'); return; }
  var parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    showToast('JSON inválido: ' + e.message, 'error');
    return;
  }
  if (Array.isArray(parsed)) parsed = parsed[0];
  if (!parsed || typeof parsed !== 'object') {
    showToast('O JSON deve ser um objeto.', 'error');
    return;
  }
  fields = [];
  Object.keys(parsed).forEach(function(key) {
    var val = parsed[key];
    var type = inferType(key, val);
    fields.push({ name: key, type: type, invalid: false, options: {}, showOptions: false });
  });
  document.getElementById('numFields').value = fields.length;
  renderFields();
  document.getElementById('fieldsCard').style.display = 'block';
  document.getElementById('actionsCard').style.display = 'block';
  switchTab('generator');
  showToast(fields.length + ' campos importados!', 'success');
}

function inferType(key, val) {
  var k = key.toLowerCase();
  if (val === null) return 'null';
  if (typeof val === 'boolean') return 'boolean';
  if (typeof val === 'number') {
    return Number.isInteger(val) ? 'int' : 'decimal';
  }
  if (typeof val === 'string') {
    if (/^\d{11}$/.test(val) && (k.includes('cpf'))) return 'cpf';
    if (/^\d{14}$/.test(val) && (k.includes('cnpj'))) return 'cnpj';
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) return 'email';
    if (/^\(\d{2}\)\s?9?\d{4}-?\d{4}$/.test(val)) return 'telefone';
    if (/^\d{5}-?\d{3}$/.test(val)) return 'cep';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return 'date';
    if (/^\d{4}-\d{2}-\d{2}T/.test(val)) return 'timestamp';
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val)) return 'uuid';
    return 'string';
  }
  return 'string';
}

/* ============================================================
   TEMPLATES
   ============================================================ */
function saveAsTemplate() {
  if (fields.length === 0) { showToast('Configure os campos primeiro.', 'error'); return; }
  showModal('Salvar Template', 'Dê um nome para este template:', function(name) {
    if (!name || !name.trim()) { showToast('Nome obrigatório.', 'error'); return; }
    savedTemplates.push({
      name: name.trim(),
      fields: JSON.parse(JSON.stringify(fields)),
      createdAt: new Date().toLocaleString('pt-BR')
    });
    renderTemplates();
    showToast('Template "' + name.trim() + '" salvo!', 'success');
  }, { input: true, inputPlaceholder: 'Ex: Cadastro de Usuário', confirmText: 'Salvar' });
}

function loadTemplate(idx) {
  var tpl = savedTemplates[idx];
  if (!tpl) return;
  fields = JSON.parse(JSON.stringify(tpl.fields));
  document.getElementById('numFields').value = fields.length;
  renderFields();
  document.getElementById('fieldsCard').style.display = 'block';
  document.getElementById('actionsCard').style.display = 'block';
  switchTab('generator');
  showToast('Template "' + tpl.name + '" carregado!', 'success');
}

function deleteTemplate(idx) {
  showModal('Excluir Template', 'Tem certeza que deseja excluir este template?', function() {
    savedTemplates.splice(idx, 1);
    renderTemplates();
    showToast('Template removido.', 'info');
  }, { confirmText: 'Excluir' });
}

function renderTemplates() {
  var container = document.getElementById('templatesList');
  if (savedTemplates.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>Nenhum template salvo ainda.</p></div>';
    return;
  }
  container.innerHTML = savedTemplates.map(function(t, i) {
    return '<div class="template-item">' +
      '<div class="template-info">' +
        '<div class="template-name"><i class="fas fa-file-code" style="color:var(--accent);margin-right:6px"></i>' + escHtml(t.name) + '</div>' +
        '<div class="template-meta">' + t.fields.length + ' campos &bull; ' + t.createdAt + '</div>' +
      '</div>' +
      '<div class="template-actions">' +
        '<button class="btn btn-secondary btn-sm" onclick="loadTemplate(' + i + ')"><i class="fas fa-upload"></i> Carregar</button>' +
        '<button class="btn-icon delete" onclick="deleteTemplate(' + i + ')"><i class="fas fa-trash"></i></button>' +
      '</div></div>';
  }).join('');
}

function exportTemplate(idx) {
  var tpl = savedTemplates[idx];
  downloadFile(JSON.stringify(tpl, null, 2), tpl.name.replace(/\s+/g, '_') + '.json', 'application/json');
}

/* ============================================================
   LOAD TEST
   ============================================================ */
var loadTestRunning = false;

function startLoadTest() {
  if (loadTestRunning) { showToast('Um teste já está em execução.', 'error'); return; }
  var url = document.getElementById('apiUrl').value.trim();
  if (!url) { document.getElementById('apiUrl').classList.add('error'); showToast('Informe a URL da API.', 'error'); return; }
  document.getElementById('apiUrl').classList.remove('error');

  var method = document.getElementById('httpMethod').value;
  var numReq = parseInt(document.getElementById('ltRequests').value, 10) || 10;
  var concurrency = parseInt(document.getElementById('ltConcurrency').value, 10) || 5;

  var headers = { 'Content-Type': 'application/json' };
  var customH = document.getElementById('customHeaders').value.trim();
  if (customH) {
    try {
      var parsed = JSON.parse(customH);
      Object.assign(headers, parsed);
    } catch (e) {
      showToast('Headers JSON inválido.', 'error');
      return;
    }
  }

  if (fields.length === 0 || !validateFields()) {
    showToast('Configure e valide os campos do payload primeiro.', 'error');
    return;
  }

  var payloads = buildPayloads(numReq);
  loadTestRunning = true;
  loadTestAbort = new AbortController();

  document.getElementById('btnLoadTest').classList.add('hidden');
  document.getElementById('btnStopTest').classList.remove('hidden');
  document.getElementById('ltProgress').classList.remove('hidden');
  document.getElementById('ltProgressFill').style.width = '0%';
  document.getElementById('ltStatus').textContent = 'Iniciando teste...';

  var results = [];
  var completed = 0;
  var queue = payloads.slice();
  var startTime = performance.now();

  function updateUI() {
    var pct = Math.round((completed / numReq) * 100);
    document.getElementById('ltProgressFill').style.width = pct + '%';
    document.getElementById('ltStatus').textContent = completed + '/' + numReq + ' requisições concluídas (' + pct + '%)';
  }

  function processItem() {
    if (!loadTestRunning || queue.length === 0) return Promise.resolve();
    var payload = queue.shift();
    var reqStart = performance.now();
    return fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(payload),
      signal: loadTestAbort.signal
    }).then(function(response) {
      var elapsed = performance.now() - reqStart;
      results.push({ status: response.status, success: response.ok, time: elapsed });
      completed++;
      updateUI();
      return processItem();
    }).catch(function(err) {
      var elapsed = performance.now() - reqStart;
      if (err.name === 'AbortError') return;
      results.push({ status: 0, success: false, time: elapsed, error: err.message });
      completed++;
      updateUI();
      return processItem();
    });
  }

  var workers = [];
  for (var w = 0; w < concurrency; w++) {
    workers.push(processItem());
  }

  Promise.all(workers).then(function() {
    var totalTime = performance.now() - startTime;
    finishLoadTest(results, totalTime, numReq);
  });
}

function stopLoadTest() {
  loadTestRunning = false;
  if (loadTestAbort) loadTestAbort.abort();
  document.getElementById('btnLoadTest').classList.remove('hidden');
  document.getElementById('btnStopTest').classList.add('hidden');
  document.getElementById('ltStatus').textContent = 'Teste interrompido.';
  showToast('Teste de carga interrompido.', 'info');
}

function finishLoadTest(results, totalTime, total) {
  loadTestRunning = false;
  document.getElementById('btnLoadTest').classList.remove('hidden');
  document.getElementById('btnStopTest').classList.add('hidden');
  document.getElementById('ltProgressFill').style.width = '100%';
  document.getElementById('ltStatus').textContent = 'Teste concluído!';
  showToast('Teste de carga concluído! Veja o relatório.', 'success');

  var successes = results.filter(function(r) { return r.success; }).length;
  var errors = results.filter(function(r) { return !r.success; }).length;
  var times = results.map(function(r) { return r.time; });
  var avgTime = times.length > 0 ? (times.reduce(function(a, b) { return a + b; }, 0) / times.length) : 0;
  var minTime = times.length > 0 ? Math.min.apply(null, times) : 0;
  var maxTime = times.length > 0 ? Math.max.apply(null, times) : 0;

  var reportHtml =
    '<div class="stats-grid">' +
      '<div class="stat-card blue"><div class="stat-val">' + results.length + '</div><div class="stat-label">Total Enviadas</div></div>' +
      '<div class="stat-card green"><div class="stat-val">' + successes + '</div><div class="stat-label">Sucessos</div></div>' +
      '<div class="stat-card red"><div class="stat-val">' + errors + '</div><div class="stat-label">Erros</div></div>' +
      '<div class="stat-card yellow"><div class="stat-val">' + avgTime.toFixed(0) + 'ms</div><div class="stat-label">Tempo Médio</div></div>' +
    '</div>' +
    '<div class="stats-grid">' +
      '<div class="stat-card"><div class="stat-val" style="color:var(--text)">' + minTime.toFixed(0) + 'ms</div><div class="stat-label">Mais Rápida</div></div>' +
      '<div class="stat-card"><div class="stat-val" style="color:var(--text)">' + maxTime.toFixed(0) + 'ms</div><div class="stat-label">Mais Lenta</div></div>' +
      '<div class="stat-card"><div class="stat-val" style="color:var(--text)">' + (totalTime / 1000).toFixed(2) + 's</div><div class="stat-label">Tempo Total</div></div>' +
      '<div class="stat-card"><div class="stat-val" style="color:var(--text)">' + (results.length / (totalTime / 1000)).toFixed(1) + '</div><div class="stat-label">Req/s</div></div>' +
    '</div>';

  if (results.length > 0) {
    var statusGroups = {};
    results.forEach(function(r) {
      var code = r.status || 'Erro';
      statusGroups[code] = (statusGroups[code] || 0) + 1;
    });
    reportHtml += '<div style="margin-top:16px"><strong class="text-sm" style="color:var(--text2)">Distribuição de Status</strong>';
    reportHtml += '<table class="results-table mt-12"><thead><tr><th>Status</th><th>Quantidade</th><th>%</th></tr></thead><tbody>';
    Object.keys(statusGroups).forEach(function(code) {
      var cnt = statusGroups[code];
      var pct = ((cnt / results.length) * 100).toFixed(1);
      var isOk = /^2/.test(String(code));
      reportHtml += '<tr><td><span class="status-badge ' + (isOk ? 'ok' : 'fail') + '">' + code + '</span></td><td>' + cnt + '</td><td>' + pct + '%</td></tr>';
    });
    reportHtml += '</tbody></table></div>';
  }

  reportHtml += '<button class="btn btn-secondary btn-sm mt-16" onclick="exportReport()"><i class="fas fa-download"></i> Exportar Relatório</button>';

  document.getElementById('reportContent').innerHTML = reportHtml;
  window._lastReport = { results: results, totalTime: totalTime, successes: successes, errors: errors, avgTime: avgTime };
  switchTab('report');
}

function exportReport() {
  var r = window._lastReport;
  if (!r) return;
  var text = 'RELATÓRIO DE TESTE DE CARGA\n' +
    '===========================\n\n' +
    'Total Enviadas: ' + r.results.length + '\n' +
    'Sucessos: ' + r.successes + '\n' +
    'Erros: ' + r.errors + '\n' +
    'Tempo Médio: ' + r.avgTime.toFixed(2) + 'ms\n' +
    'Tempo Total: ' + (r.totalTime / 1000).toFixed(2) + 's\n' +
    'Req/s: ' + (r.results.length / (r.totalTime / 1000)).toFixed(1) + '\n';
  downloadFile(text, 'relatorio_teste.txt', 'text/plain');
  showToast('Relatório exportado!', 'success');
}

/* ============================================================
   HELP CENTER
   ============================================================ */
var helpOpen = false;
var helpContent = {
  generator: {
    icon: 'fa-cogs',
    title: 'Gerador de Payloads',
    sections: [
      {
        title: 'Como usar',
        icon: 'fa-route',
        steps: [
          'Defina quantos <strong>campos</strong> o JSON terá e quantas <strong>requisições</strong> (payloads) deseja gerar.',
          'Clique em <strong>"Gerar Campos"</strong> para criar as linhas de configuração.',
          'Para cada campo, preencha o <strong>nome</strong> (ex: "nome", "cpf") e escolha o <strong>tipo de dado</strong>.',
          'Use o botão <strong><i class="fas fa-sliders-h"></i></strong> para configurar limites (tamanho de string, intervalo numérico, etc.).',
          'Ative o toggle <strong>"Inválido"</strong> em campos que deseja gerar com dados propositalmente errados (testes negativos).',
          'Escolha o <strong>formato de exportação</strong> e clique em <strong>"Gerar Payloads"</strong> para baixar o arquivo.'
        ]
      },
      {
        title: 'Tipos de dados disponíveis',
        icon: 'fa-database',
        steps: [
          '<strong>String</strong> &mdash; texto aleatório (tamanho configurável)',
          '<strong>Inteiro / Decimal</strong> &mdash; números com intervalo e precisão',
          '<strong>CPF / CNPJ</strong> &mdash; documentos brasileiros com dígitos verificadores válidos',
          '<strong>Email / Telefone / CEP</strong> &mdash; formatos brasileiros realistas',
          '<strong>Data / Timestamp</strong> &mdash; datas com intervalo configurável',
          '<strong>UUID</strong> &mdash; identificadores únicos v4',
          '<strong>Enum</strong> &mdash; valores fixos definidos por você',
          '<strong>Booleano / Nulo</strong> &mdash; true/false ou null'
        ]
      }
    ],
    tip: 'Use o botão "Preview" para verificar a estrutura antes de gerar o arquivo completo.'
  },
  preview: {
    icon: 'fa-eye',
    title: 'Preview do Payload',
    sections: [
      {
        title: 'O que faz',
        icon: 'fa-info-circle',
        steps: [
          'Mostra uma <strong>pré-visualização</strong> de até 3 payloads gerados com a configuração atual.',
          'O JSON é exibido com <strong>syntax highlighting</strong> (cores para chaves, strings, números, etc.).',
          'Use o botão <strong>"Copiar"</strong> para copiar o JSON para a área de transferência.'
        ]
      },
      {
        title: 'Como chegar aqui',
        icon: 'fa-route',
        steps: [
          'Configure os campos na aba <strong>Gerador</strong>.',
          'Clique no botão <strong>"Preview"</strong> na seção de ações.',
          'Você será redirecionado automaticamente para esta aba.'
        ]
      }
    ],
    tip: 'Cada vez que clica em Preview, novos dados aleatórios são gerados. Use para verificar a variedade.'
  },
  import: {
    icon: 'fa-file-import',
    title: 'Importar Template JSON',
    sections: [
      {
        title: 'Como usar',
        icon: 'fa-route',
        steps: [
          'Cole um <strong>JSON modelo</strong> na caixa de texto. Pode ser um objeto ou um array (usa o primeiro item).',
          'Clique em <strong>"Interpretar e Importar"</strong>.',
          'O sistema analisa cada campo e <strong>infere o tipo automaticamente</strong> (CPF, email, data, UUID, etc.).',
          'Você é redirecionado ao <strong>Gerador</strong> com os campos já preenchidos para ajustar.'
        ]
      },
      {
        title: 'Tipos detectados automaticamente',
        icon: 'fa-magic',
        steps: [
          '<strong>CPF</strong> &mdash; 11 dígitos + nome do campo contém "cpf"',
          '<strong>CNPJ</strong> &mdash; 14 dígitos + nome do campo contém "cnpj"',
          '<strong>Email</strong> &mdash; formato usuario@dominio.com',
          '<strong>Data</strong> &mdash; formato DD/MM/YYYY',
          '<strong>Timestamp</strong> &mdash; formato ISO 8601 (YYYY-MM-DDT...)',
          '<strong>UUID</strong> &mdash; formato padrão com hífens',
          '<strong>Booleano, Inteiro, Decimal</strong> &mdash; pelo tipo do valor'
        ]
      }
    ],
    tip: 'Dica: copie um payload real da sua API e cole aqui para gerar dados de teste com a mesma estrutura.'
  },
  templates: {
    icon: 'fa-bookmark',
    title: 'Templates Salvos',
    sections: [
      {
        title: 'Como usar',
        icon: 'fa-route',
        steps: [
          'Na aba <strong>Gerador</strong>, após configurar seus campos, clique em <strong>"Salvar Template"</strong>.',
          'Dê um <strong>nome descritivo</strong> ao template (ex: "Cadastro Usuário", "Pedido de Compra").',
          'Seus templates aparecem aqui listados com nome, nº de campos e data de criação.',
          'Use <strong>"Carregar"</strong> para restaurar a configuração no Gerador a qualquer momento.',
          'Use o <strong><i class="fas fa-trash"></i></strong> para remover templates que não precisa mais.'
        ]
      }
    ],
    tip: 'Templates ficam salvos apenas durante a sessão atual. Ao recarregar a página, eles são perdidos.'
  },
  loadtest: {
    icon: 'fa-bolt',
    title: 'Teste de Carga em API',
    sections: [
      {
        title: 'Como usar',
        icon: 'fa-route',
        steps: [
          'Primeiro, configure os <strong>campos do payload</strong> na aba Gerador.',
          'Informe a <strong>URL da API</strong> destino (deve suportar CORS).',
          'Escolha o <strong>método HTTP</strong> (POST, PUT ou PATCH).',
          'Defina o número de <strong>requisições</strong> e a <strong>concorrência</strong> (quantas simultâneas).',
          'Opcionalmente, adicione <strong>headers customizados</strong> em formato JSON (ex: Authorization).',
          'Clique em <strong>"Iniciar Teste"</strong> e acompanhe a barra de progresso.',
          'Use <strong>"Parar"</strong> para interromper a qualquer momento.'
        ]
      },
      {
        title: 'Configurações',
        icon: 'fa-cog',
        steps: [
          '<strong>Requisições</strong> &mdash; total de payloads a enviar (1 a 1000)',
          '<strong>Concorrência</strong> &mdash; quantas requisições simultâneas (1 a 50)',
          '<strong>Headers</strong> &mdash; JSON com headers adicionais (Authorization, API keys, etc.)'
        ]
      }
    ],
    tip: 'A API destino precisa ter CORS habilitado. Se os requests falharem, verifique as configurações de CORS do servidor.'
  },
  report: {
    icon: 'fa-chart-bar',
    title: 'Relatório de Execução',
    sections: [
      {
        title: 'O que mostra',
        icon: 'fa-info-circle',
        steps: [
          '<strong>Total de requisições</strong> enviadas ao endpoint.',
          '<strong>Sucessos</strong> (status 2xx) e <strong>Erros</strong> (outros status ou falhas de rede).',
          '<strong>Tempo médio</strong>, <strong>mais rápida</strong> e <strong>mais lenta</strong> das respostas.',
          '<strong>Tempo total</strong> de execução do teste.',
          '<strong>Req/s</strong> &mdash; throughput médio (requisições por segundo).',
          '<strong>Distribuição de status</strong> &mdash; tabela com cada código HTTP e sua porcentagem.'
        ]
      },
      {
        title: 'Exportar',
        icon: 'fa-download',
        steps: [
          'Clique em <strong>"Exportar Relatório"</strong> para baixar um arquivo .txt com o resumo dos resultados.'
        ]
      }
    ],
    tip: 'Execute o teste na aba "Teste de Carga" e os resultados aparecerão aqui automaticamente.'
  }
};

var helpTabMap = ['generator', 'preview', 'import', 'templates', 'loadtest', 'report'];
var helpTabLabels = {
  generator: 'Gerador', preview: 'Preview', import: 'Importar',
  templates: 'Templates', loadtest: 'Teste de Carga', report: 'Relatório'
};

function toggleHelp() {
  helpOpen = !helpOpen;
  document.getElementById('helpPanel').classList.toggle('open', helpOpen);
  document.getElementById('helpFab').classList.toggle('active', helpOpen);
  document.getElementById('helpFab').innerHTML = helpOpen ? '<i class="fas fa-times"></i>' : '?';
  if (helpOpen) {
    renderHelpNav();
    renderHelpForActiveTab();
  }
}

function getActiveTab() {
  var active = document.querySelector('.tab-btn.active');
  return active ? active.dataset.tab : 'generator';
}

function renderHelpNav() {
  var activeTab = getActiveTab();
  var nav = document.getElementById('helpNav');
  nav.innerHTML = helpTabMap.map(function(tab) {
    return '<button class="help-nav-btn' + (tab === activeTab ? ' active' : '') + '" onclick="showHelpFor(\'' + tab + '\')">' + helpTabLabels[tab] + '</button>';
  }).join('');
}

function showHelpFor(tab) {
  document.querySelectorAll('.help-nav-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.textContent === helpTabLabels[tab]);
  });
  renderHelpContent(tab);
}

function renderHelpForActiveTab() {
  renderHelpContent(getActiveTab());
}

function renderHelpContent(tab) {
  var data = helpContent[tab];
  if (!data) { document.getElementById('helpBody').innerHTML = '<p class="text-sm text-muted">Sem ajuda disponível.</p>'; return; }

  var html = '';

  data.sections.forEach(function(section) {
    html += '<div class="help-section">';
    html += '<div class="help-section-title"><i class="fas ' + section.icon + '"></i> ' + section.title + '</div>';
    section.steps.forEach(function(step, i) {
      html += '<div class="help-step"><div class="help-step-num">' + (i + 1) + '</div><p>' + step + '</p></div>';
    });
    html += '</div>';
  });

  if (data.tip) {
    html += '<div class="help-tip"><i class="fas fa-lightbulb"></i><span>' + data.tip + '</span></div>';
  }

  document.getElementById('helpBody').innerHTML = html;
}

/* Auto-update help when tab changes */
document.querySelectorAll('.tab-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    if (helpOpen) {
      setTimeout(function() {
        renderHelpNav();
        renderHelpForActiveTab();
      }, 50);
    }
  });
});
