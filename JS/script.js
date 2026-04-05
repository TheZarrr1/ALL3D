// ID de la hoja de cálculo y API key
const SHEET_ID = '1hXDhjwPD72uNNWZdoBMLPWz5lwqem8uXPDpVolZesn8';
const API_KEY = 'AIzaSyCRssSltm27xuAc_4jrM0rDqnm8p6-QXus';

// Carpeta de las imágenes en tu proyecto
const CARPETA_IMAGENES = 'images/Productos de la tienda/';
const IMAGEN_PREDETERMINADA = 'images/no-image.jpeg';

// Variable global para guardar productos
let productosGlobal = [];



// Función para obtener productos desde Google Sheets
async function obtenerProductosDesdeSheets() {

    const endpoint =
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Datos%20para%20subir%20a%20las%20redes%20sociales!B2:I?key=${API_KEY}`;

    try {

        const response = await fetch(endpoint);
        const data = await response.json();

        if (!data.values || data.values.length === 0) {
            throw new Error('No se encontraron productos.');
        }

        productosGlobal = data.values
            .map((row, index) => {

                const nombre = row[0]?.trim();   // Columna B
                const precioRaw = row[2]?.trim(); // Columna D
                const publicado = row[7];        // Columna I

                // Mostrar solo si está publicado
                if (
                    !nombre ||
                    !precioRaw ||
                    publicado !== "TRUE"
                ) return null;

                const precio =
                    parseFloat(
                        precioRaw
                            .replace(/[^0-9,-]+/g, "")
                            .replace(",", ".")
                    );

                const imagenRuta =
                    `${CARPETA_IMAGENES}${nombre}/${nombre} 1.jpeg`;

                return {

                    nombre: nombre,
                    precio: precio,
                    imagen: imagenRuta,

                    enlace:
                        `HTML/producto.html?producto=${
                            encodeURIComponent(nombre)
                        }&precio=${precio}`,

                    filaReal: index + 2

                };

            })
            .filter(p => p !== null);

        mostrarProductos(productosGlobal);

    } catch (error) {

        console.error(
            'Error al obtener productos:',
            error
        );

    }

}



// Mostrar productos
function mostrarProductos(productos) {

    const contenedor =
        document.querySelector('.product-container');

    contenedor.innerHTML = '';

    productos.forEach((producto) => {

        const enlaceConFila =
            `${producto.enlace}&fila=${producto.filaReal}`;

        const div =
            document.createElement('div');

        div.classList.add('product');

        div.innerHTML = `

            <a href="${enlaceConFila}"
               style="text-decoration: none; color: white;">

                <img
                    src="${producto.imagen}"
                    alt="${producto.nombre}"
                    onerror="
                        this.onerror=null;
                        this.src='${IMAGEN_PREDETERMINADA}'
                    "
                >

                <p>${producto.nombre}</p>

                <p>
                    $${producto.precio
                        .toLocaleString('es-AR')}
                </p>

            </a>

        `;

        contenedor.appendChild(div);

    });

}



//
// BUSCADOR
//

document.addEventListener(
    "input",
    function (e) {

        if (e.target.id !== "buscador") return;

        const texto =
            e.target.value.toLowerCase();

        const filtrados =
            productosGlobal.filter(p =>
                p.nombre
                    .toLowerCase()
                    .includes(texto)
            );

        mostrarProductos(filtrados);

    }
);



//
// ORDENAMIENTO
//

document.addEventListener(
    "change",
    function (e) {

        if (e.target.id !== "ordenar") return;

        let copia =
            [...productosGlobal];

        switch (e.target.value) {

            case "az":

                copia.sort(
                    (a, b) =>
                        a.nombre
                            .localeCompare(b.nombre)
                );

                break;

            case "za":

                copia.sort(
                    (a, b) =>
                        b.nombre
                            .localeCompare(a.nombre)
                );

                break;

            case "precio-menor":

                copia.sort(
                    (a, b) =>
                        a.precio - b.precio
                );

                break;

            case "precio-mayor":

                copia.sort(
                    (a, b) =>
                        b.precio - a.precio
                );

                break;

            case "popular":

                copia.sort(
                    () =>
                        Math.random() - 0.5
                );

                break;

            case "tendencia":

                copia.sort(
                    () =>
                        Math.random() - 0.5
                );

                break;

        }

        mostrarProductos(copia);

    }
);



// Cargar productos
document.addEventListener(
    'DOMContentLoaded',
    obtenerProductosDesdeSheets
);