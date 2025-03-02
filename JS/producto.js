// Obtener los parámetros de la URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const nombreProductoConGuiones = getQueryParam('producto');
const precioProducto = getQueryParam('precio');
const filaProducto = parseInt(getQueryParam('fila'), 10); // Convertir a número
const nombreProducto = nombreProductoConGuiones.replace(/-/g, ' ');

document.getElementById('producto-nombre').textContent = capitalizeWords(nombreProducto);
document.getElementById('producto-precio').textContent = `Precio: $${precioProducto}`;

const imagenUrlBase = `../images/Productos de la tienda/${nombreProducto}/`;
const noImageSrc = '../images/no-image.jpeg'; // Ruta de la imagen predeterminada
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

// Ocultar el botón al abrir el modal
imagenPrincipal.addEventListener('click', () => {
    mostrarEnModal(imagenPrincipal.src);
    botonVolver.style.display = 'none';
});

videoPrincipal.addEventListener('click', () => {
    mostrarEnModal(videoPrincipal.src);
    botonVolver.style.display = 'none';
});

// Mostrar el botón al cerrar el modal
cerrarModal.addEventListener('click', () => {
    modal.style.display = 'none';
    botonVolver.style.display = 'block';
});

// Función para cerrar el modal y volver a mostrar el botón de volver
function cerrarModalHandler() {
    modal.style.display = 'none';
    botonVolver.style.display = 'block'; // Mostrar el botón al salir del modal
}

// Eventos para cerrar el modal y restaurar el botón de volver
cerrarModal.addEventListener('click', cerrarModalHandler);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        cerrarModalHandler();
    }
});

//---------------------------Crea y ordena las fotos y videos----------------------------------------------

// Cargar y ordenar los medios
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
        actualizarMediaPrincipal(noImageSrc, true); // Imagen predeterminada
    } else {
        medios.splice(0, medios.length, ...validMedios);
        medioActualIndex = 0; // Reinicia índice
        sincronizarMedia(); // Actualiza vista inicial
        miniaturasContainer.innerHTML = '';
        validMedios.forEach((medio, index) => crearMiniatura(medio, index));
    }

    actualizarBotonesModal();
}

//---------------------------------Crea las miniaturasContainer-----------------------------------

// Crear miniaturas
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
        medioActualIndex = index; // Actualiza el índice actual
        sincronizarMedia(); // Sincroniza la imagen principal
    });
}

// Actualizar el contenido principal
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

    // Deshabilitar clic en la imagen principal si es la predeterminada
    imagenPrincipal.style.pointerEvents = esPredeterminada ? 'none' : 'auto';
}

// Mostrar contenido en el modal
function mostrarEnModal(src) {
    if (esVideo(src)) {
        modalMedia.outerHTML = `<video id="modal-img" src="${src}" controls autoplay loop muted class="modal-content"></video>`;
    } else {
        modalMedia.outerHTML = `<img id="modal-img" src="${src}" alt="Media" class="modal-content zoomable" />`;
    }
    modalMedia = document.getElementById('modal-img'); // Actualiza referencia
    modal.style.display = 'flex';
    zoomActivado = false; // Resetea zoom
    actualizarBotonesModal();
}

// Mostrar u ocultar botones en el modal
function actualizarBotonesModal() {
    anteriorImagenBtn.style.display = medios.length > 1 ? 'block' : 'none';
    siguienteImagenBtn.style.display = medios.length > 1 ? 'block' : 'none';
}

// Cerrar el modal
modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.id === 'cerrar-modal') {
        modal.style.display = 'none';
    }
});

//-------------------------------------Navegacion dentro del modal-----------------------------------

// Navegación al siguiente medio
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
    actualizarMediaPrincipal(src); // Actualiza la imagen principal
    if (modal.style.display === 'flex') {
        mostrarEnModal(src); // Actualiza el contenido del modal si está abierto
    }
}

// Manejo de clic en las miniaturas para abrir en el modal directamente
function abrirModalDesdeMiniatura(index) {
    medioActualIndex = index;
    mostrarEnModal(medios[medioActualIndex].src);
}

// Eventos para los botones
anteriorImagenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mostrarMedioAnterior();
});

siguienteImagenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mostrarMedioSiguiente();
});

// Inicializar el modal
document.addEventListener('DOMContentLoaded', () => {
    cargarMedia();
});

//-----------------------------------zoom dentro del modal-------------------------------------------------

// Zoom controlado en la imagen
modal.addEventListener('click', (e) => {
    const img = document.querySelector('.zoomable');
    if (!img || e.target !== img) return;

    zoomActivado = !zoomActivado; // Alternar zoom
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
        return; // Ignorar si el cursor está fuera de la imagen
    }

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
}

// Mostrar al hacer clic en imagen o video principal
imagenPrincipal.addEventListener('click', () => {
    mostrarEnModal(imagenPrincipal.src);
    medioActualIndex = medios.findIndex(medio => medio.src === imagenPrincipal.src);
});

videoPrincipal.addEventListener('click', () => {
    mostrarEnModal(videoPrincipal.src);
    medioActualIndex = medios.findIndex(medio => medio.src === videoPrincipal.src);
});

// Capitalizar palabras
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Inicializar
document.addEventListener('DOMContentLoaded', cargarMedia);


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

        // Eliminar mensaje de error existente si se vuelve a seleccionar "Sí"
        if (errorMensaje) {
            errorMensaje.remove();
        }
    } else {
        // Resetear los estados de la segunda pregunta
        deseaSubirArchivo.value = 'no';
        mensajeAdjuntar.style.display = 'none'; // Oculta el mensaje si estaba visible
        adjuntarArchivos.style.display = 'none'; // Oculta la sección de adjuntar archivos

        // Ocultar los elementos relacionados con modificaciones
        notaModificacion.style.display = 'none';
        comprarConModificacionBtn.style.display = 'none';
        notaModificacion.value = ''; // Limpiar el contenido del textarea

        // Eliminar mensaje de error si existe
        if (errorMensaje) {
            errorMensaje.remove();
        }
    }
});

// Mostrar mensaje al seleccionar "Sí" en adjuntar archivo
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

// ---------------------------- Configuración de la API de Google Sheets ----------------------------
const SHEET_ID = '1hXDhjwPD72uNNWZdoBMLPWz5lwqem8uXPDpVolZesn8';
const API_KEY = 'AIzaSyCRssSltm27xuAc_4jrM0rDqnm8p6-QXus';
const RANGE_COLORES = 'Hoja 1!G2:G'; // Colores disponibles
const RANGE_NUMEROS = 'Hoja 1!C2:C'; // Número de selects para cada producto

// URLs para las APIs
const API_URL_COLORES = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE_COLORES}?key=${API_KEY}`;
const API_URL_NUMEROS = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE_NUMEROS}?key=${API_KEY}`;

// ---------------------------- Referencias del DOM ----------------------------
const colorFilamentoContainer = document.getElementById('color-filamento-container');
const comprarBoton = document.getElementById('comprar-boton');
const notaModificacionInput = document.getElementById('nota-modificacion');

// ---------------------------- Obtener índice del producto ----------------------------
function obtenerIndiceProducto(nombreProducto, nombresProductos) {
    const index = nombresProductos.findIndex(producto => producto.toLowerCase() === nombreProducto.toLowerCase());
    return index !== -1 ? index : null;
}

// ---------------------------- Cargar colores y número de selects desde Google Sheets ----------------------------
async function cargarColoresYNumero() {
    try {
        // Realizar las solicitudes a las APIs
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

        // Obtener el nombre del producto desde la página
        const nombreProducto = document.getElementById('producto-nombre').textContent.trim();
        const nombresProductos = datosNumeros.values.map(fila => fila[0]); // Lista de nombres desde la hoja
        const indexProducto = obtenerIndiceProducto(nombreProducto, nombresProductos);

        if (indexProducto === null || !datosNumeros.values[indexProducto]) {
            throw new Error("Índice de producto inválido o datos incompletos.");
        }

        // Obtener los datos necesarios
        const numeroColoresInicial = parseInt(datosNumeros.values[indexProducto][0], 10) || 1;
        const opcionesColores = datosColores.values.map(fila => fila[0]);

        // Generar los selects dinámicamente
        generarSelects(numeroColoresInicial, opcionesColores);
    } catch (error) {
        console.error('Error al cargar colores y número de selects:', error);
        colorFilamentoContainer.innerHTML = '<p style="color: red;">Error al cargar los colores.</p>';
    }
}

// ---------------------------- Generar selects dinámicamente ----------------------------
function generarSelects(cantidad, opciones) {
    colorFilamentoContainer.innerHTML = ''; // Limpiar contenedor
    for (let i = 0; i < cantidad; i++) {
        agregarSelectColor(opciones);
    }
}

// ---------------------------- Función para agregar un select dinámico ----------------------------
function agregarSelectColor(opciones) {
    const select = document.createElement('select');
    select.name = `color-${colorFilamentoContainer.childElementCount + 1}`;
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

    colorFilamentoContainer.appendChild(select);
}

// ---------------------------- Inicializar ----------------------------
document.addEventListener('DOMContentLoaded', cargarColoresYNumero);

// ---------------------------- Mostrar mensaje al elegir modificaciones ----------------------------
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

// ----------------------------- Botón de comprar ahora -----------------------------
comprarBoton.addEventListener('click', () => {
    const nombreProducto = document.getElementById('producto-nombre').textContent;

    // Obtener y limpiar el precio del producto
    const precioTexto = document.getElementById('producto-precio').textContent;
    const precioProducto = parseFloat(precioTexto.replace(/[^\d.-]/g, '')); // Eliminar cualquier carácter no numérico

    const cantidadSeleccionada = parseInt(cantidadProductoSelect.value, 10); // Obtener cantidad seleccionada

    // Validar cantidad seleccionada
    if (cantidadSeleccionada <= 0 || isNaN(cantidadSeleccionada)) {
        alert('Por favor selecciona una cantidad válida.');
        return;
    }

    // Verificar si es una compra de una unidad o varias
    if (cantidadSeleccionada === 1) {
        // Mensaje para una sola unidad
        let mensaje = `Hola, quiero comprar 1 unidad del producto: ${nombreProducto}.
Precio por unidad: $${precioProducto.toLocaleString('es-AR')}.
`;

        // Obtener los colores seleccionados
        const coloresSeleccionados = [];
        for (let j = 0; j < numeroDeColores; j++) {
            const select = document.querySelector(`select[name="color-${j + 1}"]`);
            const colorSeleccionado = select ? select.value || 'No especificado' : 'No especificado';
            coloresSeleccionados.push(colorSeleccionado);
        }

        // Añadir colores al mensaje
        if (coloresSeleccionados.length === 1) {
            mensaje += `Color seleccionado: ${coloresSeleccionados.join(', ')}.`;
        } else {
            mensaje += `Colores seleccionados: ${coloresSeleccionados.join(', ')}.`;
        }

        const mensajeCodificado = encodeURIComponent(mensaje);
        window.open(`https://wa.me/5491128313561?text=${mensajeCodificado}`, '_blank');
    } else {
        // Mensaje para múltiples unidades
        const precioTotal = precioProducto * cantidadSeleccionada;
        let mensaje = `Hola, quiero comprar ${cantidadSeleccionada} unidades del producto: ${nombreProducto}.
Precio por unidad: $${precioProducto.toLocaleString('es-AR')}.
Precio total: $${precioTotal.toLocaleString('es-AR')}.
`;

        // Obtener los colores seleccionados
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

// Evento para manejar cambios en "¿Deseas alguna modificación en el producto?"
document.getElementById('modificaciones').addEventListener('change', function () {
    const notaModificacion = document.getElementById('nota-modificacion');
    const comprarConModificacionBtn = document.getElementById('comprar-con-modificacion');
    const comprarBoton = document.getElementById('comprar-boton');
    const adjuntarArchivos = document.getElementById('adjuntar-archivos');
    const opcionesModificacion = document.querySelector('.opciones-modificacion');

    if (this.value === 'si') {
        // Mostrar elementos dinámicos con animación
        notaModificacion.classList.add('mostrar');
        comprarConModificacionBtn.classList.add('mostrar');
        adjuntarArchivos.classList.add('mostrar');

        // Aplicar la animación para ocultar el botón "Comprar Ahora"
        comprarBoton.classList.add('oculto');

        // Asegurar que el contenedor se ajuste automáticamente
        opcionesModificacion.style.height = 'auto';
    } else {
        // Ocultar elementos dinámicos
        notaModificacion.classList.remove('mostrar');
        comprarConModificacionBtn.classList.remove('mostrar');
        adjuntarArchivos.classList.remove('mostrar');

        // Aplicar la animación para mostrar el botón "Comprar Ahora"
        comprarBoton.classList.remove('oculto');

        // Asegurar que el contenedor se ajuste automáticamente
        opcionesModificacion.style.height = 'auto';
    }
});

// Validación y acción del botón "Comprar con Modificación"
document.getElementById('comprar-con-modificacion').addEventListener('click', () => {
    const nombreProducto = document.getElementById('producto-nombre').textContent;

    // Obtener y limpiar el precio del producto
    const precioTexto = document.getElementById('producto-precio').textContent;
    const precioProducto = parseFloat(precioTexto.replace(/[^\d.-]/g, '')); // Eliminar caracteres no numéricos

    const notaModificacionInput = document.getElementById('nota-modificacion');
    const notaModificacion = notaModificacionInput.value.trim();
    const deseaSubirArchivoSelect = document.getElementById('desea-subir-archivo');
    const deseaSubirArchivo = deseaSubirArchivoSelect ? deseaSubirArchivoSelect.value : 'no';

    const cantidadSeleccionada = parseInt(cantidadProductoSelect.value, 10); // Obtener cantidad seleccionada

    // Validar si la nota de modificación está vacía
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
        return; // Detener ejecución si la validación falla
    } else if (errorMensaje) {
        errorMensaje.remove();
    }

    // Verificar si es una compra de una unidad o varias
    if (cantidadSeleccionada === 1) {
        // Mensaje para una sola unidad
        let mensaje = `Hola, quiero comprar 1 unidad del producto: ${nombreProducto}.
Precio por unidad: $${precioProducto.toLocaleString('es-AR')}.
Nota de modificación: ${notaModificacion}.
`;

        // Obtener los colores seleccionados
        const coloresSeleccionados = [];
        for (let j = 0; j < numeroDeColores; j++) {
            const select = document.querySelector(`select[name="color-${j + 1}"]`);
            const colorSeleccionado = select ? select.value || 'No especificado' : 'No especificado';
            coloresSeleccionados.push(colorSeleccionado);
        }

        // Añadir colores al mensaje
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
        // Mensaje para múltiples unidades
        const precioTotal = precioProducto * cantidadSeleccionada;
        let mensaje = `Hola, quiero comprar ${cantidadSeleccionada} unidades del producto: ${nombreProducto}.
Precio por unidad: $${precioProducto.toLocaleString('es-AR')}.
Precio total: $${precioTotal.toLocaleString('es-AR')}.
Nota de modificación: ${notaModificacion}.
`;

        // Obtener los colores seleccionados
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

// Inicializar la funcionalidad
document.addEventListener('DOMContentLoaded', cargarColoresYNumero);

// ---------------------------- Cargar colores basado en fila de la URL ----------------------------
async function cargarColoresPorFila() {
    try {
        // Validar si el parámetro "fila" es válido
        if (isNaN(filaProducto) || filaProducto <= 0) {
            throw new Error('El parámetro "fila" debe ser un número válido y mayor a 0.');
        }

        // Construir URLs específicas para la fila del producto
        const urlNumeros = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Hoja%201!C${filaProducto}:C${filaProducto}?key=${API_KEY}`;
        const urlColores = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE_COLORES}?key=${API_KEY}`;

        // Realizar las solicitudes a Google Sheets
        const [respuestaNumeros, respuestaColores] = await Promise.all([
            fetch(urlNumeros),
            fetch(urlColores),
        ]);

        // Validar respuestas de las APIs
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

        const opcionesColores = datosColores.values.map(fila => fila[0]); // Lista de colores disponibles

        // Generar los selects dinámicamente
        generarSelects(numeroSelects, opcionesColores);
    } catch (error) {
        console.error('Error al cargar colores por fila:', error);
        colorFilamentoContainer.innerHTML = `<p style="color: red;">Error al cargar los colores o el número de selects: ${error.message}</p>`;
    }
}

// ---------------------------- Generar selects dinámicamente ----------------------------
function generarSelects(cantidad, opciones) {
    colorFilamentoContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos selects

    for (let i = 0; i < cantidad; i++) {
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

        colorFilamentoContainer.appendChild(select);
    }
}

// ---------------------------- Inicializar carga de colores por fila ----------------------------
document.addEventListener('DOMContentLoaded', cargarColoresPorFila);

//-----------------------------------CANTIDAD DE PRODUCTOS----------------------------------------------------------

// ---------------------------- Referencias del DOM ----------------------------
const cantidadProductoSelect = document.getElementById('cantidad-producto');
const coloresProductoContainer = document.getElementById('colores-producto');

let coloresDisponibles = []; // Se llenará con los colores del Google Sheets
let numeroDeColores = 0; // Número de selects predeterminado para el producto

// ---------------------------- Obtener fila desde la URL ----------------------------
function obtenerFilaDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('fila'), 10); // Fila de Google Sheets
}

// ---------------------------- Obtener colores desde Google Sheets ----------------------------
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

        coloresDisponibles = datos.values.map(fila => fila[0]); // Llenar con los colores disponibles
    } catch (error) {
        console.error('Error al cargar los colores:', error);
        coloresProductoContainer.innerHTML = '<p style="color: red;">Error al cargar los colores.</p>';
    }
}

// ---------------------------- Obtener número de selects predeterminado ----------------------------
async function obtenerNumeroDeColores() {
    try {
        const filaProducto = obtenerFilaDesdeURL(); // Obtener la fila desde la URL
        if (isNaN(filaProducto) || filaProducto <= 0) {
            throw new Error('El parámetro "fila" debe ser un número válido y mayor a 0.');
        }

        const urlNumeros = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Hoja 1!C${filaProducto}:C${filaProducto}?key=${API_KEY}`;
        const respuesta = await fetch(urlNumeros);
        if (!respuesta.ok) {
            throw new Error('Error al obtener el número de colores desde Google Sheets.');
        }

        const datos = await respuesta.json();
        if (!datos.values || !datos.values[0]) {
            throw new Error('No se encontró un número válido en la fila especificada.');
        }

        numeroDeColores = parseInt(datos.values[0][0], 10) || 1; // Número de colores predeterminado
    } catch (error) {
        console.error('Error al obtener el número de colores predeterminado:', error);
    }
}

// ---------------------------- Generar Selectores de Colores Dinámicamente ----------------------------
function generarSelectoresAdicionales(cantidad) {
    // Vaciar el contenedor de colores primero
    coloresProductoContainer.innerHTML = "";

    // No generar textos ni selects adicionales si la cantidad es 1
    if (cantidad <= 1) return;

    // Generar textos y selects para cada cantidad adicional
    for (let i = 2; i <= cantidad; i++) {
        // Crear el texto para la cantidad seleccionada
        const titulo = document.createElement("p");
        titulo.textContent = `Color del ${nombreProducto} (${i})`;
        titulo.style.fontWeight = 'bold';
        titulo.style.marginTop = '10px';
        titulo.style.marginBottom = '5px';
        coloresProductoContainer.appendChild(titulo);

        // Generar selects según el número de colores predeterminado
        for (let j = 0; j < numeroDeColores; j++) {
            const grupo = document.createElement("div");
            grupo.classList.add("colores-grupo");

            const select = crearSelectColores((i - 1) * numeroDeColores + j + 1);
            grupo.appendChild(select);
            coloresProductoContainer.appendChild(grupo);
        }
    }
}

// ---------------------------- Crear un Select de Colores ----------------------------
function crearSelectColores(indice) {
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

    return select;
}

// ---------------------------- Evento para manejar cambios en el selector de cantidad ----------------------------
cantidadProductoSelect.addEventListener("change", (e) => {
    const cantidadSeleccionada = parseInt(e.target.value, 10);
    generarSelectoresAdicionales(cantidadSeleccionada);
});

// ---------------------------- Inicializar al cargar la página ----------------------------
document.addEventListener("DOMContentLoaded", async () => {
    await obtenerColoresDesdeDrive(); // Obtener colores desde Google Sheets
    await obtenerNumeroDeColores(); // Obtener el número de colores predeterminado
    generarSelectoresAdicionales(parseInt(cantidadProductoSelect.value, 10)); // Generar los selects iniciales
});
