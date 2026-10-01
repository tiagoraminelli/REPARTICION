// ============================================
// LISTAS BASE
// ============================================
const LIBRERIA_BASE = [
  "BOLIGOMA", "BROCHES N°", "CARTULINA COLOR", "CINTA EMBALAR",
  "CINTA PAPEL", "CLIPS", "CORRECTOR", "CUADERNO", "FIBRÓN NEGRO",
  "FIBRÓN ROJO", "FICHA N°", "FOLIOS", "GOMA", "HOJAS A4",
  "HOJAS OFICIO", "LAPICERA AZUL", "LAPICERA NEGRA", "LAPICERA ROJA",
  "LÁPIZ", "PAPEL MADERA", "PILA", "PLANILLAS DIARIAS", "RECETARIOS",
  "REGLA", "RESALTADOR FLÚO"
];

const LIMPIEZA_BASE = [
  "BOLSA CONSORCIO (NEGRA)", "BOLSA CONSORCIO (ROJO)", "BOLSA DE RESIDUOS",
  "DESINFECTANTE", "DETERGENTE", "ESCOBA", "ESCOBILLÓN", "ESPONJA",
  "GOMA DE PISO", "JABÓN BLANCO", "LAVANDINA", "PAPEL HIGIÉNICO",
  "REJILLA", "ROCIADOR P/ALCOHOL", "ROLLO DE SERVILLETAS", "SERVILLETAS",
  "TRAPO DE PISO", "VIRULANA", "TOCADOR (A GABINETE)", "P/ RODEO ESCOBA",
  "P/ RODEO CEPILLO", "FOT. PAP Y COLG.", "FOT. RODEO DESAGÜE",
  "FOT. TROMPA DE GOMA", "ALCOHOL", "JABÓN LÍQUIDO", "GUANTES",
  "BARBIJO", "PAPEL HIGIÉNICO INSTITUCIONAL", "TOALLAS DE PAPEL"
];

// ============================================
// ESTADO GLOBAL
// ============================================
let estadoLibreria = [];
let estadoLimpieza = [];

function inicializarEstado() {
  estadoLibreria = LIBRERIA_BASE.map(nombre => ({
    nombre: nombre,
    solicitada: '',
    entregada: '',
    personalizado: false
  }));
  estadoLimpieza = LIMPIEZA_BASE.map(nombre => ({
    nombre: nombre,
    solicitada: '',
    entregada: '',
    personalizado: false
  }));
}

// ============================================
// TAB
// ============================================
function cambiarTab(tab) {
  ['libreria', 'limpieza', 'detalles', 'resumen'].forEach(t => {
    const el = document.getElementById('tab' + capitalizar(t));
    const btn = document.getElementById('btnTab' + capitalizar(t));
    if (el) el.classList.toggle('hidden', t !== tab);
    if (btn) btn.classList.toggle('active', t === tab);
  });
  if (tab === 'resumen') renderResumen();
}

// ============================================
// SINCRONIZAR DOM → ESTADO
// ============================================
function sincronizarEstado(tipo) {
  const estado = tipo === 'libreria' ? estadoLibreria : estadoLimpieza;
  
  estado.forEach((item, i) => {
    const solInput = document.querySelector(`input[data-tipo="${tipo}"][data-index="${i}"][data-campo="solicitada"]`);
    const entInput = document.querySelector(`input[data-tipo="${tipo}"][data-index="${i}"][data-campo="entregada"]`);
    if (solInput) item.solicitada = solInput.value;
    if (entInput) item.entregada = entInput.value;
  });
}

// ============================================
// RENDER TABLAS
// ============================================
function renderTabla(tipo) {
  const estado = tipo === 'libreria' ? estadoLibreria : estadoLimpieza;
  const tbody = document.getElementById('tbody' + capitalizar(tipo));
  
  tbody.innerHTML = estado.map((item, i) => {
    const btnEliminar = item.personalizado
      ? `<button class="btn-eliminar-item" onclick="eliminarItem('${tipo}', ${i})" title="Eliminar ítem">×</button>`
      : '';
    
    return `
      <tr>
        <td class="item-nombre">
          ${escapeHtml(item.nombre)}
          ${btnEliminar}
        </td>
        <td><input type="number" min="0" value="${item.solicitada}" data-tipo="${tipo}" data-index="${i}" data-campo="solicitada" placeholder="0"></td>
        <td><input type="number" min="0" value="${item.entregada}" data-tipo="${tipo}" data-index="${i}" data-campo="entregada" placeholder="0"></td>
      </tr>
    `;
  }).join('');
  
  tbody.querySelectorAll('input[type="number"]').forEach(inp => {
    inp.addEventListener('input', () => verificarDiferencia(inp));
  });
  
  actualizarContadores();
}

function verificarDiferencia(inp) {
  const tipo = inp.dataset.tipo;
  const index = inp.dataset.index;
  const sol = document.querySelector(`input[data-tipo="${tipo}"][data-index="${index}"][data-campo="solicitada"]`);
  const ent = document.querySelector(`input[data-tipo="${tipo}"][data-index="${index}"][data-campo="entregada"]`);
  
  const vSol = parseInt(sol.value) || 0;
  const vEnt = parseInt(ent.value) || 0;
  
  if (vSol > 0 && vEnt > 0 && vSol !== vEnt) {
    ent.classList.add('diferencia');
  } else {
    ent.classList.remove('diferencia');
  }
}

function actualizarContadores() {
  ['libreria', 'limpieza'].forEach(tipo => {
    const estado = tipo === 'libreria' ? estadoLibreria : estadoLimpieza;
    let cant = 0;
    estado.forEach(item => {
      if (parseInt(item.solicitada) > 0) cant++;
    });
    const cont = document.getElementById('contador' + capitalizar(tipo));
    if (cont) cont.textContent = cant + (cant === 1 ? ' ítem' : ' ítems');
  });
}

// ============================================
// AGREGAR / ELIMINAR
// ============================================
let categoriaNuevo = 'libreria';

function abrirModalNuevo(cat) {
  categoriaNuevo = cat;
  document.getElementById('modalNuevoTitulo').textContent = 'Nuevo artículo de ' + (cat === 'libreria' ? 'Librería' : 'Limpieza');
  document.querySelectorAll('.rol-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  document.getElementById('inputNuevoArticulo').value = '';
  document.getElementById('inputNuevoSolicitada').value = '';
  document.getElementById('msgNuevoError').classList.add('hidden');
  document.getElementById('modalNuevo').classList.remove('hidden');
  setTimeout(() => document.getElementById('inputNuevoArticulo').focus(), 50);
}

function cerrarModalNuevo() {
  document.getElementById('modalNuevo').classList.add('hidden');
}

function seleccionarCategoriaNuevo(cat) {
  categoriaNuevo = cat;
  document.querySelectorAll('.rol-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
}

function guardarNuevoArticulo() {
  const inputNombre = document.getElementById('inputNuevoArticulo');
  const inputSol = document.getElementById('inputNuevoSolicitada');
  const nombre = inputNombre.value.trim().replace(/\s+/g, ' ').toUpperCase();
  const solicitada = parseInt(inputSol.value) || 0;
  const msg = document.getElementById('msgNuevoError');
  
  if (!nombre) {
    msg.textContent = 'Ingresá un nombre.';
    msg.classList.remove('hidden');
    inputNombre.focus();
    return;
  }
  
  const estado = categoriaNuevo === 'libreria' ? estadoLibreria : estadoLimpieza;
  const normalizado = normalizar(nombre);
  
  if (estado.some(e => normalizar(e.nombre) === normalizado)) {
    msg.textContent = 'Ese artículo ya está en la lista.';
    msg.classList.remove('hidden');
    return;
  }
  
  sincronizarEstado(categoriaNuevo);
  
  estado.push({
    nombre: nombre,
    solicitada: solicitada,
    entregada: '',
    personalizado: true
  });
  
  cerrarModalNuevo();
  renderTabla(categoriaNuevo);
  cambiarTab(categoriaNuevo);
}

function eliminarItem(tipo, index) {
  const estado = tipo === 'libreria' ? estadoLibreria : estadoLimpieza;
  if (confirm(`¿Eliminar el ítem "${estado[index].nombre}"?`)) {
    sincronizarEstado(tipo);
    estado.splice(index, 1);
    renderTabla(tipo);
  }
}

// ============================================
// DETALLES
// ============================================
function agregarDetalle() {
  const lista = document.getElementById('listaDetalles');
  const div = document.createElement('div');
  div.className = 'detalle-item';
  div.innerHTML = `
    <input type="text" placeholder="Escriba un detalle...">
    <button type="button" onclick="this.parentElement.remove()" title="Eliminar">×</button>
  `;
  lista.appendChild(div);
  div.querySelector('input').focus();
}

// ============================================
// FECHA
// ============================================
function onFechaInput(e) {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length >= 5) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
  else if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
  e.target.value = v;
  validarFecha();
}
function onFechaBlur(e) {
  const v = e.target.value;
  if (/^\d{2}\/\d{2}$/.test(v)) {
    e.target.value = v + '/' + new Date().getFullYear();
  }
  validarFecha();
}
function onFechaKeydown(e) {
  if (e.key === 'Enter') e.target.blur();
}
function validarFecha() {
  const input = document.getElementById('cfgFecha');
  const help = document.getElementById('fechaHelp');
  const v = input.value;
  const match = v.match(/^(\d{2})\/(\d{2})(?:\/(\d{4}))?$/);
  if (!match) {
    help.className = 'help error';
    help.textContent = 'Formato inválido. Usá DD/MM o DD/MM/AAAA';
    return false;
  }
  const d = parseInt(match[1]), m = parseInt(match[2]);
  if (d < 1 || d > 31 || m < 1 || m > 12) {
    help.className = 'help error';
    help.textContent = 'Fecha inválida';
    return false;
  }
  help.className = 'help ok';
  help.textContent = '✓ Fecha válida';
  return true;
}
function setFechaHoy() {
  const hoy = new Date();
  const dd = String(hoy.getDate()).padStart(2, '0');
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const yyyy = hoy.getFullYear();
  document.getElementById('cfgFecha').value = `${dd}/${mm}/${yyyy}`;
}

// ============================================
// CONFIG
// ============================================
function actualizarConfig() {}

function getConfig() {
  return {
    servicio: document.getElementById('cfgServicio').value.trim().toUpperCase(),
    referente: document.getElementById('cfgReferente').value.trim().toUpperCase(),
    fecha: document.getElementById('cfgFecha').value.trim(),
    entregado: document.getElementById('cfgEntregado').checked,
    observaciones: document.getElementById('observaciones').value.trim(),
    detalles: [...document.querySelectorAll('#listaDetalles .detalle-item input')]
      .map(i => i.value.trim()).filter(v => v)
  };
}

// ============================================
// RESÚMENES / IMPRESIÓN
// ============================================
function renderResumen() {
  sincronizarEstado('libreria');
  sincronizarEstado('limpieza');
  
  const cont = document.getElementById('contenedorResumen');
  cont.innerHTML = generarDocCompleto();
}

// ---------------------------------------------
// Genera las filas de una tabla.
// Recibe la cantidad de filas que debe tener esa tabla
// (para que las dos queden parejas en altura).
// ---------------------------------------------
function generarFilas(tipo, cantidadFilas) {
  const estado = tipo === 'libreria' ? estadoLibreria : estadoLimpieza;
  const filas = [];
  
  // Solo los ítems con algo cargado
  estado.forEach(item => {
    const sol = item.solicitada;
    const ent = item.entregada;
    
    if (sol || ent) {
      filas.push(`
        <tr>
          <td>${escapeHtml(item.nombre)}</td>
          <td class="num">${sol || ''}</td>
          <td class="num">${ent || ''}</td>
        </tr>
      `);
    }
  });
  
  // Rellenar SOLO hasta la cantidad de filas que le pasamos (no 30 fijas)
  while (filas.length < cantidadFilas) {
    filas.push(`<tr><td>&nbsp;</td><td class="num">&nbsp;</td><td class="num">&nbsp;</td></tr>`);
  }
  
  return filas.join('');
}

// ---------------------------------------------
// Cuenta cuántos ítems cargados tiene cada categoría
// ---------------------------------------------
function contarItemsCargados(tipo) {
  const estado = tipo === 'libreria' ? estadoLibreria : estadoLimpieza;
  let cant = 0;
  estado.forEach(item => {
    if (item.solicitada || item.entregada) cant++;
  });
  return cant;
}

function generarDocCompleto(soloTipo) {
  const cfg = getConfig();
  const chk = cfg.entregado ? '&#9745;' : '&#9744;';
  
  const mostrarLib = !soloTipo || soloTipo === 'libreria';
  const mostrarLimp = !soloTipo || soloTipo === 'limpieza';
  
  // Calcular cuántas filas necesita cada tabla
  let filasLib = mostrarLib ? contarItemsCargados('libreria') : 0;
  let filasLimp = mostrarLimp ? contarItemsCargados('limpieza') : 0;
  
  // Igualar para que las dos tablas queden de la misma altura
  const maxFilas = Math.max(filasLib, filasLimp);
  // Mínimo de filas para que la tabla no quede muy chica visualmente
  const minFilas = 12;
  const filasFinales = Math.max(maxFilas, minFilas);
  
  return `
    <div class="pedido-doc">
      <div class="doc-head">
        <div style="display:flex;align-items:center;gap:14px;">
          <img src="hospital.png" alt="Hospital Julio César Villanueva" class="doc-head-logo-izq">
          <div>
            <h3>Hospital Julio César Villanueva</h3>
            <div class="sub">Solicitud y Entrega de Insumos</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="recuadro-entregado">${chk} ENTREGADO</div>
          <img src="santa fe.webp" alt="Santa Fe Provincia" class="doc-head-logo-der">
        </div>
      </div>
      
      <div class="doc-meta">
        <div><span class="muted">SERVICIO:</span> <strong>${escapeHtml(cfg.servicio) || '—'}</strong></div>
        <div><span class="muted">REFERENTE:</span> <strong>${escapeHtml(cfg.referente) || '—'}</strong></div>
        <div><span class="muted">FECHA:</span> <strong>${escapeHtml(cfg.fecha) || '—'}</strong></div>
      </div>
      
      <div class="tablas-ticket">
        ${mostrarLib ? `
          <div class="tabla-ticket">
            <h4>LIBRERÍA</h4>
            <table>
              <thead>
                <tr>
                  <th style="width:60%">Ítem</th>
                  <th style="width:20%">Cant.<br>solicitada</th>
                  <th style="width:20%">Cant.<br>entregada</th>
                </tr>
              </thead>
              <tbody>${generarFilas('libreria', filasFinales)}</tbody>
            </table>
          </div>
        ` : ''}
        ${mostrarLimp ? `
          <div class="tabla-ticket">
            <h4>LIMPIEZA</h4>
            <table>
              <thead>
                <tr>
                  <th style="width:60%">Ítem</th>
                  <th style="width:20%">Cant.<br>solicitada</th>
                  <th style="width:20%">Cant.<br>entregada</th>
                </tr>
              </thead>
              <tbody>${generarFilas('limpieza', filasFinales)}</tbody>
            </table>
          </div>
        ` : ''}
      </div>
      
      ${cfg.observaciones ? `
        <div class="doc-detalles">
          <span class="label">Observaciones generales</span>
          <div class="contenido">${escapeHtml(cfg.observaciones)}</div>
        </div>
      ` : ''}
      
      ${cfg.detalles.length > 0 ? `
        <div class="doc-detalles">
          <span class="label">Detalles adicionales</span>
          <div class="contenido">${cfg.detalles.map(d => '• ' + escapeHtml(d)).join('<br>')}</div>
        </div>
      ` : ''}
      
      <div class="firma">
        <div>Firma Referente CAPS</div>
        <div>Firma Entrega</div>
        <div>Aclaración</div>
      </div>
    </div>
  `;
}

function imprimirTodo() {
  renderResumen();
  cambiarTab('resumen');
  setTimeout(() => window.print(), 100);
}

function imprimirSeccion(tipo) {
  sincronizarEstado('libreria');
  sincronizarEstado('limpieza');
  const cont = document.getElementById('contenedorResumen');
  cont.innerHTML = generarDocCompleto(tipo);
  cambiarTab('resumen');
  setTimeout(() => window.print(), 100);
}

// ============================================
// LIMPIAR
// ============================================
function limpiarTabla(tipo) {
  if (!confirm(`¿Limpiar todos los datos de la tabla ${tipo}?`)) return;
  const estado = tipo === 'libreria' ? estadoLibreria : estadoLimpieza;
  estado.forEach(item => {
    item.solicitada = '';
    item.entregada = '';
  });
  renderTabla(tipo);
}

function vaciarTodo() {
  if (!confirm('¿Vaciar TODOS los datos del formulario?')) return;
  document.getElementById('cfgServicio').value = '';
  document.getElementById('cfgReferente').value = '';
  document.getElementById('cfgEntregado').checked = false;
  document.getElementById('observaciones').value = '';
  document.getElementById('listaDetalles').innerHTML = '';
  inicializarEstado();
  renderTabla('libreria');
  renderTabla('limpieza');
  setFechaHoy();
  actualizarContadores();
}

// ============================================
// UTILIDADES
// ============================================
function capitalizar(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function escapeHtml(s) {
  if (s === undefined || s === null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
function normalizar(s) {
  return String(s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// ============================================
// INIT
// ============================================
inicializarEstado();
renderTabla('libreria');
renderTabla('limpieza');
setFechaHoy();
actualizarContadores();

// Enter para saltar campos de config
document.querySelectorAll('.config input').forEach((input, idx, arr) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = arr[idx + 1];
      if (next) next.focus();
    }
  });
});