// Obtener los parámetros de la URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const nombreProductoConGuiones = getQueryParam('producto');
const precioProducto = getQueryParam('precio');
const filaProducto = parseInt(getQueryParam('fila'), 10);
const nombreProducto = nombreProductoConGuiones.replace(/-/g, ' ');

document.getElementById('producto-nombre').textContent = capitalizeWords(nombreProducto);
document.getElementById('producto-precio').textContent = `Precio: $${precioProducto}`;

const imagenUrlBase = `../images/Productos de la tienda/${nombreProducto}/`;
const noImageSrc = '../images/no-image.jpeg';
const imagenPrincipal = document.getElementById('imagen-principal');
const videoPrincipal = document.getElementById('video-principal');
const miniaturasContainer = document.querySelector('.miniaturas');
const modal = document.getElementById('modal-imagen');
let modalMedia = document.getElementById('modal-img');
const anteriorImagenBtn = document.getElementById('anterior-imagen');
const siguienteImagenBtn = document.getElementById('siguiente-imagen');
const medios = [];
let medioActualIndex = 0;
let zoomActivado = false;

// Determinar si un archivo es video
function esVideo(url) {
    return url.endsWith('.mp4');
}

//---------------------------Ocultar el boton de volver dentro del modal----------------------------------
const botonVolver = document.querySelector('.boton-volver');
const cerrarModal = document.querySelector('.cerrar');

imagenPrincipal.addEventListener('click', () => {
    mostrarEnModal(imagenPrincipal.src);
    botonVolver.style.display = 'none';
});

videoPrincipal.addEventListener('click', () => {
    mostrarEnModal(videoPrincipal.src);
    botonVolver.style.display = 'none';
});

cerrarModal.addEventListener('click', () => {
    modal.style.display = 'none';
    botonVolver.style.display = 'block';
});

function cerrarModalHandler() {
    modal.style.display = 'none';
    botonVolver.style.display = 'block';
}

cerrarModal.addEventListener('click', cerrarModalHandler);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        cerrarModalHandler();
    }
});

//---------------------------Crea y ordena las fotos y videos----------------------------------------------

function cargarMedia() {
    const tempMedios = [];

    for (let i = 1; i <= 10; i++) {
        tempMedios.push({ tipo: 'img', src: `${imagenUrlBase}${nombreProducto} ${i}.jpeg` });
        tempMedios.push({ tipo: 'video', src: `${imagenUrlBase}${nombreProducto} ${i}.mp4` });
    }

    const validMedios = tempMedios.filter((medio) => {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', medio.src, false);
        xhr.send();
        return xhr.status !== 404;
    });

    if (validMedios.length === 0) {
        actualizarMediaPrincipal(noImageSrc, true);
    } else {
        medios.splice(0, medios.length, ...validMedios);
        medioActualIndex = 0;
        sincronizarMedia();
        miniaturasContainer.innerHTML = '';
        validMedios.forEach((medio, index) => crearMiniatura(medio, index));
    }

    actualizarBotonesModal();
}

function crearMiniatura(medio, index) {
    const miniatura = document.createElement(medio.tipo === 'img' ? 'img' : 'video');
    miniatura.src = medio.src;
    miniatura.classList.add('miniatura');
    miniatura.alt = `${nombreProducto} ${index + 1}`;
    miniatura.onerror = () => miniatura.remove();

    if (medio.tipo === 'video') {
        miniatura.muted = true;
        miniatura.loop = false;
        miniatura.addEventListener('mouseenter', () => miniatura.play());
        miniatura.addEventListener('mouseleave', () => miniatura.pause());
    }

    miniaturasContainer.appendChild(miniatura);

    miniatura.addEventListener('click', () => {
        medioActualIndex = index;
        sincronizarMedia();
    });
}

function actualizarMediaPrincipal(src, esPredeterminada = false) {
    if (esVideo(src)) {
        videoPrincipal.src = src;
        videoPrincipal.style.display = 'block';
        videoPrincipal.play();
        imagenPrincipal.style.display = 'none';
    } else {
        imagenPrincipal.src = src;
        imagenPrincipal.style.display = 'block';
        videoPrincipal.style.display = 'none';
        videoPrincipal.pause();
    }

    imagenPrincipal.style.pointerEvents = esPredeterminada ? 'none' : 'auto';
}

function mostrarEnModal(src) {
    if (esVideo(src)) {
        modalMedia.outerHTML = `<video id="modal-img" src="${src}" controls autoplay loop muted class="modal-content"></video>`;
    } else {
        modalMedia.outerHTML = `<img id="modal-img" src="${src}" alt="Media" class="modal-content zoomable" />`;
    }
    modalMedia = document.getElementById('modal-img');
    modal.style.display = 'flex';
    zoomActivado = false;
    actualizarBotonesModal();
}

function actualizarBotonesModal() {
    anteriorImagenBtn.style.display = medios.length > 1 ? 'block' : 'none';
    siguienteImagenBtn.style.display = medios.length > 1 ? 'block' : 'none';
}

modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.id === 'cerrar-modal') {
        modal.style.display = 'none';
    }
});

function mostrarMedioSiguiente() {
    if (medios.length > 0) {
        medioActualIndex = (medioActualIndex + 1) % medios.length;
        sincronizarMedia();
    }
}

function mostrarMedioAnterior() {
    if (medios.length > 0) {
        medioActualIndex = (medioActualIndex - 1 + medios.length) % medios.length;
        sincronizarMedia();
    }
}

function sincronizarMedia() {
    const src = medios[medioActualIndex].src;
    actualizarMediaPrincipal(src);
    if (modal.style.display === 'flex') {
        mostrarEnModal(src);
    }
}

function abrirModalDesdeMiniatura(index) {
    medioActualIndex = index;
    mostrarEnModal(medios[medioActualIndex].src);
}

anteriorImagenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mostrarMedioAnterior();
});

siguienteImagenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mostrarMedioSiguiente();
});

document.addEventListener('DOMContentLoaded', () => {
    cargarMedia();
});

modal.addEventListener('click', (e) => {
    const img = document.querySelector('.zoomable');
    if (!img || e.target !== img) return;

    zoomActivado = !zoomActivado;
    if (zoomActivado) {
        img.style.transform = 'scale(1.5)';
        img.style.cursor = 'zoom-out';
        modal.addEventListener('mousemove', moverZoom);
    } else {
        img.style.transform = 'scale(1)';
        img.style.cursor = 'zoom-in';
        modal.removeEventListener('mousemove', moverZoom);
    }
});

function moverZoom(e) {
    const img = document.querySelector('.zoomable');
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
    ) {
        return;
    }

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
}

imagenPrincipal.addEventListener('click', () => {
    mostrarEnModal(imagenPrincipal.src);
    medioActualIndex = medios.findIndex(medio => medio.src === imagenPrincipal.src);
});

videoPrincipal.addEventListener('click', () => {
    mostrarEnModal(videoPrincipal.src);
    medioActualIndex = medios.findIndex(medio => medio.src === videoPrincipal.src);
});

function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

document.addEventListener('DOMContentLoaded', cargarMedia);


// ========================= MAPA DE COLORES CON PREVIEW =========================
// Si agregás un color nuevo a tu lista, agregalo acá también con su código hex
const MAPA_COLORES = {
    'amarillo':                                 { bg: '#FFD600' },
    'azul fluo':                                { bg: '#1100ff' },
    'azul pal':                                 { bg: '#5B9BD5' },
    'blanco':                                   { bg: '#F5F5F5', border: true },
    'celeste':                                  { bg: '#87CEEB' },
    'cobalto (azul oscuro metalizado)':         { bg: '#1B3A6B' },
    'dorado metalizado (oscuro)':               { bg: '#B8860B' },
    'fucsia':                                   { bg: '#d3005f' },
    'gris':                                     { bg: '#9E9E9E' },
    'naraja':                                   { bg: '#FF6B1A' },
    'negro':                                    { bg: '#1A1A1A' },
    'piel':                                     { bg: '#EAAA7A' },
    'rojo':                                     { bg: '#e22f2f' },
    'rojo fluo':                                { bg: '#f81818' },
    'rojo translucido':                         { bg: 'rgba(255, 0, 0, 0.56)' },
    'silk; azul-verde-naranja':                 { gradient: 'conic-gradient(#1565C0 0deg 120deg, #2E7D32 120deg 240deg, #E65100 240deg 360deg)', border: true },
    'silk; azul-violeta-negro':                 { gradient: 'conic-gradient(#1565C0 0deg 120deg, #6A1B9A 120deg 240deg, #1A1A1A 240deg 360deg)', border: true },
    'silk; negro-rojo (fucsia mas que rojo)':   { gradient: 'conic-gradient(#1A1A1A 0deg 180deg, #E8006A 180deg 360deg)', border: true },
    'silk; negro-violeta':                      { gradient: 'conic-gradient(#1A1A1A 0deg 180deg, #6A1B9A 180deg 360deg)', border: true },
    'silk; plata':                              { gradient: 'conic-gradient(#C0C0C0 0deg 360deg)', border: true },
    'verde fluo':                               { bg: '#39FF14' },
};

function actualizarPreviewColor(valorColor, previewEl) {
    const key = valorColor.toLowerCase().trim();
    const config = MAPA_COLORES[key];

    if (!config) {
        previewEl.style.background = '#cccccc';
        previewEl.style.border = '2px solid #999';
        previewEl.title = valorColor;
        previewEl.style.display = 'inline-block';
        return;
    }

    previewEl.style.background = config.gradient || config.bg;
    previewEl.style.border = '2px solid #000000';
    previewEl.title = valorColor;
    previewEl.style.display = 'inline-block';

    // Buscar o crear el link "Ver ejemplo"
    const wrapper = previewEl.closest('.color-select-wrapper');
    let linkEjemplo = wrapper.querySelector('.link-ver-ejemplo');
    if (!linkEjemplo) {
        linkEjemplo = document.createElement('span');
        linkEjemplo.classList.add('link-ver-ejemplo');
        linkEjemplo.textContent = 'Ver ejemplo';
        wrapper.appendChild(linkEjemplo);
    }

    const select = wrapper.querySelector('select');
    const opcionSeleccionada = Array.from(select.options).find(o => o.value === valorColor);
    const nombreCarpeta = opcionSeleccionada ? opcionSeleccionada.textContent.trim() : valorColor;

    linkEjemplo.onclick = () => abrirModalColor(nombreCarpeta);
    linkEjemplo.style.display = 'inline-block';
}

// ========================= MODAL DE FOTOS DE COLOR =========================

let fotosColorActuales = [];
let fotoColorIndex = 0;

function abrirModalColor(nombreColor) {
    fotosColorActuales = [];
    fotoColorIndex = 0;

    const baseUrl = `../images/Ejemplos de colores/${nombreColor}/`;
    const extensiones = ['jpeg', 'jpg', 'png'];
    const maxFotos = 10;
    let intentos = 0;

    function cargarFoto(numero) {
        if (numero > maxFotos) {
            if (fotosColorActuales.length > 0) mostrarModalColor();
            else alert('No hay fotos de ejemplo para este color todavía.');
            return;
        }

        let extIndex = 0;

        function probarExt() {
            if (extIndex >= extensiones.length) {
                // No existe esta foto, terminar
                if (fotosColorActuales.length > 0) mostrarModalColor();
                else alert('No hay fotos de ejemplo para este color todavía.');
                return;
            }

            const src = `${baseUrl}${nombreColor} ${numero}.${extensiones[extIndex]}`;
            const img = new Image();

            img.onload = () => {
                fotosColorActuales.push(src);
                cargarFoto(numero + 1);
            };

            img.onerror = () => {
                extIndex++;
                // Si falló con todas las extensiones, esta foto no existe
                if (extIndex >= extensiones.length) {
                    if (fotosColorActuales.length > 0) mostrarModalColor();
                    else alert('No hay fotos de ejemplo para este color todavía.');
                } else {
                    probarExt();
                }
            };

            img.src = src;
        }

        probarExt();
    }

    cargarFoto(1);
}

function mostrarModalColor() {
    document.getElementById('modal-color-img').src = fotosColorActuales[fotoColorIndex];
    actualizarContadorColor();
    document.getElementById('modal-color').style.display = 'flex';
}

function actualizarContadorColor() {
    document.getElementById('modal-color-contador').textContent =
        `${fotoColorIndex + 1} / ${fotosColorActuales.length}`;
    document.getElementById('modal-color-img').src = fotosColorActuales[fotoColorIndex];
}

function cerrarModalColor() {
    document.getElementById('modal-color').style.display = 'none';
}

// ========================= FIN MAPA DE COLORES =========================


// Mostrar área de texto y opciones adicionales al elegir "Sí"
const modificacionesSelect = document.getElementById('modificaciones');
modificacionesSelect.addEventListener('change', function () {
    const notaModificacion = document.getElementById('nota-modificacion');
    const comprarConModificacionBtn = document.getElementById('comprar-con-modificacion');
    const adjuntarArchivos = document.getElementById('adjuntar-archivos');
    const deseaSubirArchivo = document.getElementById('desea-subir-archivo');
    const mensajeAdjuntar = document.getElementById('mensaje-adjuntar');
    const errorMensaje = document.getElementById('error-modificacion');

    if (this.value === 'si') {
        notaModificacion.style.display = 'block';
        comprarConModificacionBtn.style.display = 'block';
        adjuntarArchivos.style.display = 'block';

        if (errorMensaje) {
            errorMensaje.remove();
        }
    } else {
        deseaSubirArchivo.value = 'no';
        mensajeAdjuntar.style.display = 'none';
        adjuntarArchivos.style.display = 'none';
        notaModificacion.style.display = 'none';
        comprarConModificacionBtn.style.display = 'none';
        notaModificacion.value = '';

        if (errorMensaje) {
            errorMensaje.remove();
        }
    }
});

document.getElementById('desea-subir-archivo').addEventListener('change', function () {
    const mensajeAdjuntar = document.getElementById('mensaje-adjuntar');

    if (this.value === 'si') {
        mensajeAdjuntar.style.display = 'block';
        mensajeAdjuntar.textContent = 'Por favor, adjunta los archivos directamente después de apretar el botón de "Comprar con la Modificación".';
    } else {
        mensajeAdjuntar.style.display = 'none';
        mensajeAdjuntar.textContent = '';
    }
});

//-------------------------------------Utilizando el metodo de google sheets en drive automaticamente------------------------------------------------------

const SHEET_ID = '1hXDhjwPD72uNNWZdoBMLPWz5lwqem8uXPDpVolZesn8';
const API_KEY = 'AIzaSyCRssSltm27xuAc_4jrM0rDqnm8p6-QXus';
const RANGE_COLORES = 'Datos para subir a las redes sociales!K2:K';
const RANGE_NUMEROS = 'Hoja 1!C3:C';

const API_URL_COLORES = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE_COLORES}?key=${API_KEY}`;
const API_URL_NUMEROS = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE_NUMEROS}?key=${API_KEY}`;

const colorFilamentoContainer = document.getElementById('color-filamento-container');
const comprarBoton = document.getElementById('comprar-boton');
const notaModificacionInput = document.getElementById('nota-modificacion');

function obtenerIndiceProducto(nombreProducto, nombresProductos) {
    const index = nombresProductos.findIndex(producto => producto.toLowerCase() === nombreProducto.toLowerCase());
    return index !== -1 ? index : null;
}

async function cargarColoresYNumero() {
    try {
        const [respuestaColores, respuestaNumeros] = await Promise.all([
            fetch(API_URL_COLORES),
            fetch(API_URL_NUMEROS),
        ]);

        if (!respuestaColores.ok || !respuestaNumeros.ok) {
            throw new Error('Error al acceder a Google Sheets.');
        }

        const datosColores = await respuestaColores.json();
        const datosNumeros = await respuestaNumeros.json();

        if (!datosColores.values || !datosNumeros.values) {
            throw new Error('Datos incompletos.');
        }

        const nombreProducto = document.getElementById('producto-nombre').textContent.trim();
        const nombresProductos = datosNumeros.values.map(fila => fila[0]);
        const indexProducto = obtenerIndiceProducto(nombreProducto, nombresProductos);

        if (indexProducto === null || !datosNumeros.values[indexProducto]) {
            throw new Error("Índice de producto inválido o datos incompletos.");
        }

        const numeroColoresInicial = parseInt(datosNumeros.values[indexProducto][0], 10) || 1;
        const opcionesColores = datosColores.values.map(fila => fila[0]);

        generarSelects(numeroColoresInicial, opcionesColores);
    } catch (error) {
        console.error('Error al cargar colores y número de selects:', error);
        colorFilamentoContainer.innerHTML = '<p style="color: red;">Error al cargar los colores.</p>';
    }
}

// ========================= FUNCIÓN GENERARSELECTS CON PREVIEW =========================
function generarSelects(cantidad, opciones) {
    colorFilamentoContainer.innerHTML = '';

    for (let i = 0; i < cantidad; i++) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('color-select-wrapper');

        const select = document.createElement('select');
        select.name = `color-${i + 1}`;
        select.classList.add('styled-select');
        select.required = true;

        const opcionPredeterminada = document.createElement('option');
        opcionPredeterminada.value = '';
        opcionPredeterminada.disabled = true;
        opcionPredeterminada.selected = true;
        opcionPredeterminada.textContent = 'Elegir color';
        select.appendChild(opcionPredeterminada);

        opciones.forEach(color => {
            const opcion = document.createElement('option');
            opcion.value = color.toLowerCase();
            opcion.textContent = color;
            select.appendChild(opcion);
        });

        const preview = document.createElement('div');
        preview.classList.add('color-preview-bubble');

        select.addEventListener('change', () => {
            actualizarPreviewColor(select.value, preview);
        });

        wrapper.appendChild(select);
        wrapper.appendChild(preview);
        colorFilamentoContainer.appendChild(wrapper);
    }
}
// ========================= FIN FUNCIÓN GENERARSELECTS =========================

document.addEventListener('DOMContentLoaded', cargarColoresYNumero);

document.getElementById('modificaciones').addEventListener('change', function () {
    const notaModificacion = document.getElementById('nota-modificacion');
    const comprarConModificacionBtn = document.getElementById('comprar-con-modificacion');
    const adjuntarArchivos = document.getElementById('adjuntar-archivos');

    if (this.value === 'si') {
        notaModificacion.style.display = 'block';
        comprarConModificacionBtn.style.display = 'block';
        adjuntarArchivos.style.display = 'block';
    } else {
        notaModificacion.style.display = 'none';
        comprarConModificacionBtn.style.display = 'none';
        adjuntarArchivos.style.display = 'none';
    }
});

//-----------------------------ANIMACION Y CONFIGURACION DE BOTONES DE COMPRAR----------------------------------

comprarBoton.addEventListener('click', () => {
    const nombreProducto = document.getElementById('producto-nombre').textContent;

    const precioTexto = document.getElementById('producto-precio').textContent;
    const precioProducto = parseFloat(precioTexto.replace(/[^\d.-]/g, ''));

    const cantidadSeleccionada = parseInt(cantidadProductoSelect.value, 10);

    if (cantidadSeleccionada <= 0 || isNaN(cantidadSeleccionada)) {
        alert('Por favor selecciona una cantidad válida.');
        return;
    }

    if (cantidadSeleccionada === 1) {
        let mensaje = `Hola, quiero comprar 1 unidad del producto: ${nombreProducto}.\nPrecio por unidad: $${precioProducto.toLocaleString('es-AR')}.\n`;

        const coloresSeleccionados = [];
        for (let j = 0; j < numeroDeColores; j++) {
            const select = document.querySelector(`select[name="color-${j + 1}"]`);
            const colorSeleccionado = select ? select.value || 'No especificado' : 'No especificado';
            coloresSeleccionados.push(colorSeleccionado);
        }

        if (coloresSeleccionados.length === 1) {
            mensaje += `Color seleccionado: ${coloresSeleccionados.join(', ')}.`;
        } else {
            mensaje += `Colores seleccionados: ${coloresSeleccionados.join(', ')}.`;
        }

        const mensajeCodificado = encodeURIComponent(mensaje);
        window.open(`https://wa.me/5491128313561?text=${mensajeCodificado}`, '_blank');
    } else {
        const precioTotal = precioProducto * cantidadSeleccionada;
        let mensaje = `Hola, quiero comprar ${cantidadSeleccionada} unidades del producto: ${nombreProducto}.\nPrecio por unidad: $${precioProducto.toLocaleString('es-AR')}.\nPrecio total: $${precioTotal.toLocaleString('es-AR')}.\n`;

        let indiceColor = 1;
        for (let i = 1; i <= cantidadSeleccionada; i++) {
            mensaje += `\nUnidad (${i}):\n`;

            for (let j = 0; j < numeroDeColores; j++) {
                const select = document.querySelector(`select[name="color-${indiceColor}"]`);
                const colorSeleccionado = select ? select.value || 'No especificado' : 'No especificado';
                mensaje += `- Color ${j + 1}: ${colorSeleccionado}\n`;
                indiceColor++;
            }
        }

        const mensajeCodificado = encodeURIComponent(mensaje);
        window.open(`https://wa.me/5491128313561?text=${mensajeCodificado}`, '_blank');
    }
});

document.getElementById('modificaciones').addEventListener('change', function () {
    const notaModificacion = document.getElementById('nota-modificacion');
    const comprarConModificacionBtn = document.getElementById('comprar-con-modificacion');
    const comprarBoton = document.getElementById('comprar-boton');
    const adjuntarArchivos = document.getElementById('adjuntar-archivos');
    const opcionesModificacion = document.querySelector('.opciones-modificacion');

    if (this.value === 'si') {
        notaModificacion.classList.add('mostrar');
        comprarConModificacionBtn.classList.add('mostrar');
        adjuntarArchivos.classList.add('mostrar');
        comprarBoton.classList.add('oculto');
        opcionesModificacion.style.height = 'auto';
    } else {
        notaModificacion.classList.remove('mostrar');
        comprarConModificacionBtn.classList.remove('mostrar');
        adjuntarArchivos.classList.remove('mostrar');
        comprarBoton.classList.remove('oculto');
        opcionesModificacion.style.height = 'auto';
    }
});

document.getElementById('comprar-con-modificacion').addEventListener('click', () => {
    const nombreProducto = document.getElementById('producto-nombre').textContent;

    const precioTexto = document.getElementById('producto-precio').textContent;
    const precioProducto = parseFloat(precioTexto.replace(/[^\d.-]/g, ''));

    const notaModificacionInput = document.getElementById('nota-modificacion');
    const notaModificacion = notaModificacionInput.value.trim();
    const deseaSubirArchivoSelect = document.getElementById('desea-subir-archivo');
    const deseaSubirArchivo = deseaSubirArchivoSelect ? deseaSubirArchivoSelect.value : 'no';

    const cantidadSeleccionada = parseInt(cantidadProductoSelect.value, 10);

    const errorMensajeId = 'error-modificacion';
    const errorMensaje = document.getElementById(errorMensajeId);

    if (!notaModificacion) {
        if (!errorMensaje) {
            const nuevoError = document.createElement('p');
            nuevoError.id = errorMensajeId;
            nuevoError.textContent = 'Por favor, describe las modificaciones deseadas antes de continuar.';
            nuevoError.style.color = 'red';
            nuevoError.style.marginTop = '5px';
            nuevoError.style.fontSize = '14px';
            notaModificacionInput.after(nuevoError);
        }
        return;
    } else if (errorMensaje) {
        errorMensaje.remove();
    }

    if (cantidadSeleccionada === 1) {
        let mensaje = `Hola, quiero comprar 1 unidad del producto: ${nombreProducto}.\nPrecio por unidad: $${precioProducto.toLocaleString('es-AR')}.\nNota de modificación: ${notaModificacion}.\n`;

        const coloresSeleccionados = [];
        for (let j = 0; j < numeroDeColores; j++) {
            const select = document.querySelector(`select[name="color-${j + 1}"]`);
            const colorSeleccionado = select ? select.value || 'No especificado' : 'No especificado';
            coloresSeleccionados.push(colorSeleccionado);
        }

        if (coloresSeleccionados.length === 1) {
            mensaje += `Color seleccionado: ${coloresSeleccionados.join(', ')}.`;
        } else {
            mensaje += `Colores seleccionados: ${coloresSeleccionados.join(', ')}.`;
        }

        if (deseaSubirArchivo === 'si') {
            mensaje += `\nPor favor, adjunta los archivos (imágenes o videos) para entender mejor tu idea.`;
        }

        const mensajeCodificado = encodeURIComponent(mensaje);
        window.open(`https://wa.me/5491128313561?text=${mensajeCodificado}`, '_blank');
    } else {
        const precioTotal = precioProducto * cantidadSeleccionada;
        let mensaje = `Hola, quiero comprar ${cantidadSeleccionada} unidades del producto: ${nombreProducto}.\nPrecio por unidad: $${precioProducto.toLocaleString('es-AR')}.\nPrecio total: $${precioTotal.toLocaleString('es-AR')}.\nNota de modificación: ${notaModificacion}.\n`;

        let indiceColor = 1;
        for (let i = 1; i <= cantidadSeleccionada; i++) {
            mensaje += `\nUnidad (${i}):\n`;

            for (let j = 0; j < numeroDeColores; j++) {
                const select = document.querySelector(`select[name="color-${indiceColor}"]`);
                const colorSeleccionado = select ? select.value || 'No especificado' : 'No especificado';
                mensaje += `- Color ${j + 1}: ${colorSeleccionado}\n`;
                indiceColor++;
            }
        }

        if (deseaSubirArchivo === 'si') {
            mensaje += `\nPor favor, adjunta los archivos (imágenes o videos) para entender mejor tu idea.`;
        }

        const mensajeCodificado = encodeURIComponent(mensaje);
        window.open(`https://wa.me/5491128313561?text=${mensajeCodificado}`, '_blank');
    }
});

document.addEventListener('DOMContentLoaded', cargarColoresYNumero);

async function cargarColoresPorFila() {
    try {
        if (isNaN(filaProducto) || filaProducto <= 0) {
            throw new Error('El parámetro "fila" debe ser un número válido y mayor a 0.');
        }

        const urlNumeros = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Hoja%201!C${filaProducto + 1}:C${filaProducto + 1}?key=${API_KEY}`;
        const urlColores = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE_COLORES}?key=${API_KEY}`;

        const [respuestaNumeros, respuestaColores] = await Promise.all([
            fetch(urlNumeros),
            fetch(urlColores),
        ]);

        if (!respuestaNumeros.ok || !respuestaColores.ok) {
            throw new Error('Error al acceder a los datos de Google Sheets.');
        }

        const datosNumeros = await respuestaNumeros.json();
        const datosColores = await respuestaColores.json();

        if (!datosNumeros.values || !datosNumeros.values[0]) {
            throw new Error('No se encontró un número válido en la fila especificada.');
        }

        const numeroSelects = parseInt(datosNumeros.values[0][0], 10);
        if (isNaN(numeroSelects) || numeroSelects <= 0) {
            throw new Error('El número de selects obtenido es inválido.');
        }

        if (!datosColores.values || datosColores.values.length === 0) {
            throw new Error('No hay colores disponibles en la hoja.');
        }

        const opcionesColores = datosColores.values.map(fila => fila[0]);

        generarSelects(numeroSelects, opcionesColores);
    } catch (error) {
        console.error('Error al cargar colores por fila:', error);
        colorFilamentoContainer.innerHTML = `<p style="color: red;">Error al cargar los colores o el número de selects: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', cargarColoresPorFila);

async function cargarDescripcion() {
    try {
        if (isNaN(filaProducto) || filaProducto <= 0) {
            throw new Error('Fila inválida.');
        }

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Datos%20para%20subir%20a%20las%20redes%20sociales!C${filaProducto}:C${filaProducto}?key=${API_KEY}`;

        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error('Error al acceder a Google Sheets.');

        const datos = await respuesta.json();

        const descripcion = datos.values?.[0]?.[0] || '';
        const parrafos = descripcion
            .split('.')
            .map(p => p.trim())
            .filter(p => p.length > 0);

        const contenedor = document.getElementById('producto-descripcion');
        contenedor.innerHTML = parrafos.map(p => `<p>${p}.</p>`).join('');

    } catch (error) {
        console.error('Error al cargar la descripción:', error);
    }
}

document.addEventListener('DOMContentLoaded', cargarDescripcion);

//-----------------------------------CANTIDAD DE PRODUCTOS----------------------------------------------------------

const cantidadProductoSelect = document.getElementById('cantidad-producto');
const coloresProductoContainer = document.getElementById('colores-producto');

let coloresDisponibles = [];
let numeroDeColores = 0;

function obtenerFilaDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('fila'), 10);
}

async function obtenerColoresDesdeDrive() {
    try {
        const respuesta = await fetch(API_URL_COLORES);
        if (!respuesta.ok) {
            throw new Error('Error al obtener los colores desde Google Sheets.');
        }

        const datos = await respuesta.json();
        if (!datos.values || datos.values.length === 0) {
            throw new Error('No se encontraron colores en la hoja.');
        }

        coloresDisponibles = datos.values.map(fila => fila[0]);
    } catch (error) {
        console.error('Error al cargar los colores:', error);
        coloresProductoContainer.innerHTML = '<p style="color: red;">Error al cargar los colores.</p>';
    }
}

async function obtenerNumeroDeColores() {
    try {
        const filaProducto = obtenerFilaDesdeURL();
        if (isNaN(filaProducto) || filaProducto <= 0) {
            throw new Error('El parámetro "fila" debe ser un número válido y mayor a 0.');
        }

        const urlNumeros = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Hoja 1!C${filaProducto + 1}:C${filaProducto + 1}?key=${API_KEY}`;
        const respuesta = await fetch(urlNumeros);
        if (!respuesta.ok) {
            throw new Error('Error al obtener el número de colores desde Google Sheets.');
        }

        const datos = await respuesta.json();
        if (!datos.values || !datos.values[0]) {
            throw new Error('No se encontró un número válido en la fila especificada.');
        }

        numeroDeColores = parseInt(datos.values[0][0], 10) || 1;
    } catch (error) {
        console.error('Error al obtener el número de colores predeterminado:', error);
    }
}

// ========================= FUNCIÓN GENERARSELECTORES CON PREVIEW =========================
function generarSelectoresAdicionales(cantidad) {
    coloresProductoContainer.innerHTML = "";

    if (cantidad <= 1) return;

    for (let i = 2; i <= cantidad; i++) {
        const titulo = document.createElement("p");
        titulo.textContent = `Color del ${nombreProducto} (${i})`;
        titulo.style.fontWeight = 'bold';
        titulo.style.marginTop = '10px';
        titulo.style.marginBottom = '5px';
        coloresProductoContainer.appendChild(titulo);

        for (let j = 0; j < numeroDeColores; j++) {
            const wrapper = crearSelectColores((i - 1) * numeroDeColores + j + 1);
            coloresProductoContainer.appendChild(wrapper);
        }
    }
}

function crearSelectColores(indice) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("color-select-wrapper");

    const select = document.createElement("select");
    select.name = `color-${indice}`;
    select.classList.add("color-select");
    select.required = true;

    const opcionPredeterminada = document.createElement("option");
    opcionPredeterminada.value = '';
    opcionPredeterminada.disabled = true;
    opcionPredeterminada.selected = true;
    opcionPredeterminada.textContent = 'Elegir color';
    select.appendChild(opcionPredeterminada);

    coloresDisponibles.forEach((color) => {
        const option = document.createElement("option");
        option.value = color.toLowerCase();
        option.textContent = color;
        select.appendChild(option);
    });

    const preview = document.createElement("div");
    preview.classList.add("color-preview-bubble");

    select.addEventListener('change', () => {
        actualizarPreviewColor(select.value, preview);
    });

    wrapper.appendChild(select);
    wrapper.appendChild(preview);

    return wrapper;
}
// ========================= FIN FUNCIÓN GENERARSELECTORES =========================

cantidadProductoSelect.addEventListener("change", (e) => {
    const cantidadSeleccionada = parseInt(e.target.value, 10);
    generarSelectoresAdicionales(cantidadSeleccionada);
});

document.addEventListener("DOMContentLoaded", async () => {
    await obtenerColoresDesdeDrive();
    await obtenerNumeroDeColores();
    generarSelectoresAdicionales(parseInt(cantidadProductoSelect.value, 10));
});