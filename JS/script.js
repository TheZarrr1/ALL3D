// ID de la hoja de cálculo y API key
const SHEET_ID = '1hXDhjwPD72uNNWZdoBMLPWz5lwqem8uXPDpVolZesn8';
const API_KEY = 'AIzaSyCRssSltm27xuAc_4jrM0rDqnm8p6-QXus';

// Carpeta de las imágenes en tu proyecto
const CARPETA_IMAGENES = 'images/Productos de la tienda/';
const IMAGEN_PREDETERMINADA = 'images/no-image.jpeg'; // Imagen predeterminada

// Función para obtener productos desde la hoja de Google Sheets
async function obtenerProductosDesdeSheets() {
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:B?key=${API_KEY}`;
    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        // Validación de datos
        if (!data.values || data.values.length < 2) {
            throw new Error('No se encontraron productos en la hoja.');
        }

        // Procesar datos desde la segunda fila (omitimos encabezados)
        const productos = data.values.slice(1).map(row => {
            const nombre = row[0]?.trim(); // Columna A
            const precioRaw = row[1]?.trim(); // Columna B

            if (!nombre || !precioRaw) return null; // Ignorar filas incompletas

            const precio = parseFloat(precioRaw.replace(/[^0-9,-]+/g, "").replace(",", "."));
            const imagenRuta = `${CARPETA_IMAGENES}${nombre}/${nombre} 1.jpeg`; // Ruta de imagen directa

            return {
                nombre: nombre,
                precio: precio,
                imagen: imagenRuta,
                enlace: `HTML/producto.html?producto=${encodeURIComponent(nombre)}&precio=${precio}`
            };
        }).filter(producto => producto !== null);

        mostrarProductos(productos);
    } catch (error) {
        console.error('Error al obtener productos desde Google Sheets:', error);
    }
}

// Función para mostrar los productos en la sección "Tienda"
function mostrarProductos(productos) {
    const contenedor = document.querySelector('.product-container');
    contenedor.innerHTML = ''; // Limpiar contenedor antes de agregar productos

    productos.forEach((producto, index) => {
        const fila = index + 2; // Fila correspondiente en la hoja de cálculo (comenzando desde 2)
        const enlaceConFila = `${producto.enlace}&fila=${fila}`; // Agregar parámetro "fila"

        const productoDiv = document.createElement('div');
        productoDiv.classList.add('product');

        productoDiv.innerHTML = `
            <a href="${enlaceConFila}" style="text-decoration: none; color: white;">
                <img 
                    src="${producto.imagen}" 
                    alt="${producto.nombre}" 
                    onerror="this.onerror=null; this.src='${IMAGEN_PREDETERMINADA}'"
                >
                <p>${producto.nombre}</p>
                <p>$${producto.precio.toLocaleString('es-AR')}</p>
            </a>
        `;
        contenedor.appendChild(productoDiv);
    });
}


// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', obtenerProductosDesdeSheets);