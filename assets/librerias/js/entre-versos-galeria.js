/**
 * Entre Versos · Distribución de Polaroids
 * Muuri.js se ocupa de situar los elementos. Este módulo calcula
 * posiciones dispersas y reserva la superficie de «Dejar aquí».
 * No activa drag & drop: la selección por clic sigue en contenido.js.
 */
(function () {
    'use strict';

    var instancia = null;
    var observador = null;

    // Aleatoriedad reproducible: las fotografías no cambian de lugar
    // arbitrariamente cada vez que se recalcula la pantalla.
    function variacion(semilla) {
        var valor = Math.sin(semilla * 12.9898 + 78.233) * 43758.5453;
        return valor - Math.floor(valor);
    }

    function limitar(valor, minimo, maximo) {
        return Math.max(minimo, Math.min(maximo, valor));
    }

    function dimensionesBandeja(visor) {
        var bandeja = document.getElementById('bandeja-poeta');

        if (!bandeja || !visor) {
            return null;
        }

        var base = visor.getBoundingClientRect();
        var caja = bandeja.getBoundingClientRect();
        var margen = 16;

        return {
            izquierda: caja.left - base.left - margen,
            superior: caja.top - base.top - margen,
            derecha: caja.right - base.left + margen,
            inferior: caja.bottom - base.top + margen
        };
    }

    function seCruzan(a, b) {
        return a.izquierda < b.derecha &&
            a.derecha > b.izquierda &&
            a.superior < b.inferior &&
            a.inferior > b.superior;
    }

    function calcularDistribucion(grid, id, items, ancho, alto, callback) {
        var visor = document.getElementById('visor-galeria-poetas');
        var total = items.length;
        var vacio = { id: id, items: items, slots: [], styles: {} };

        if (!total || !visor || ancho <= 0) {
            callback(vacio);
            return;
        }

        var margen = ancho < 480 ? 14 : 28;
        var altoVisible = Math.max(280, visor.clientHeight);
        var anchoTarjeta = Math.max.apply(null, items.map(function (item) {
            return item.getWidth();
        }));
        var altoTarjeta = Math.max.apply(null, items.map(function (item) {
            return item.getHeight();
        }));

        // Se acepta un solapamiento moderado cuando aumenta el número
        // de fotografías, pero nunca se repiten posiciones idénticas.
        var maxColumnas = Math.max(1, Math.floor(
            (ancho - 2 * margen) / Math.max(80, anchoTarjeta * 0.86)
        ));
        var maxFilasVisibles = Math.max(1, Math.floor(
            (altoVisible - 2 * margen) / Math.max(100, altoTarjeta * 0.87)
        ));
        var filasObjetivo = total <= 3 ? 1 : (total <= 7 ? 2 : 3);
        var filas = Math.min(filasObjetivo, maxFilasVisibles);
        var columnas = Math.min(maxColumnas, Math.ceil(total / filas));
        var bandeja = dimensionesBandeja(visor);
        var posiciones = [];
        var altoContenido = altoVisible;
        var intentos = 0;

        function construirPosiciones() {
            var candidatos = [];
            var pasoX = (ancho - 2 * margen) / columnas;
            var pasoY = Math.max(
                altoTarjeta * 0.88,
                (altoVisible - 2 * margen) / Math.min(filas, maxFilasVisibles)
            );
            var altoTotal = Math.max(altoVisible, filas * pasoY + 2 * margen);

            // Repartimos primero entre columnas y después entre filas.
            // Así no quedan todas las últimas fotografías acumuladas a la izquierda.
            for (var col = 0; col < columnas; col++) {
                for (var fila = 0; fila < filas; fila++) {
                    var indice = col * filas + fila;
                    var w = anchoTarjeta;
                    var h = altoTarjeta;
                    var holguraX = Math.max(0, pasoX - w);
                    var holguraY = Math.max(0, pasoY - h);
                    var jitterX = (variacion(indice + 91) - 0.5) * Math.min(holguraX * .54, 55);
                    var jitterY = (variacion(indice + 213) - 0.5) * Math.min(holguraY * .58, 34);
                    var x = margen + col * pasoX + (pasoX - w) / 2 + jitterX;
                    var y = margen + fila * pasoY + (pasoY - h) / 2 + jitterY;
                    x = limitar(x, margen, Math.max(margen, ancho - w - margen));
                    y = Math.max(margen, y);

                    var rectangulo = {
                        izquierda: x - 8,
                        superior: y - 8,
                        derecha: x + w + 8,
                        inferior: y + h + 8
                    };

                    if (bandeja && seCruzan(rectangulo, bandeja)) {
                        continue;
                    }
                    candidatos.push({ x: x, y: y });
                }
            }
            return { candidatos: candidatos, altura: altoTotal };
        }

        var resultado = construirPosiciones();
        while (resultado.candidatos.length < total && intentos < total + 40) {
            if (columnas < maxColumnas) {
                columnas++;
            } else {
                filas++;
            }
            resultado = construirPosiciones();
            intentos++;
        }
        posiciones = resultado.candidatos;
        altoContenido = resultado.altura;

        // Cada registro corresponde a una tarjeta, sin duplicados.
        for (var i = 0; i < total; i++) {
            var punto = posiciones[i] || {x: margen, y: margen + i * altoTarjeta};
            vacio.slots.push(punto.x, punto.y);
        }
        vacio.styles.height = altoContenido + 'px';
        callback(vacio);
    }

    function inicializar(galeria) {
        if (!galeria) {
            return;
        }
        if (instancia) {
            instancia.destroy();
            instancia = null;
        }
        if (observador) {
            observador.disconnect();
            observador = null;
        }

        var poetas = galeria.querySelectorAll('.posicion-polaroid');
        if (!poetas.length) {
            return;
        }

        // La rotación es distinta por tarjeta y se aplica al interior,
        // porque Muuri necesita controlar el transform del elemento exterior.
        poetas.forEach(function (elemento, indice) {
            var semilla = Number(elemento.dataset.poetaId) || indice + 1;
            var grados = (variacion(semilla + 13) - .5) * 13;
            elemento.style.setProperty('--giro', grados.toFixed(2) + 'deg');
        });

        if (typeof window.Muuri !== 'function') {
            console.warn('Muuri no está disponible. Se usará la cuadrícula de respaldo.');
            galeria.classList.add('galeria-poetas--respaldo');
            return;
        }

        galeria.classList.remove('galeria-poetas--respaldo');
        galeria.classList.add('galeria-poetas--muuri');

        try {
            instancia = new window.Muuri(galeria, {
                items: '.posicion-polaroid',
                layout: calcularDistribucion,
                layoutDuration: window.matchMedia &&
                    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350,
                layoutEasing: 'ease-out',
                layoutOnResize: 180,
                dragEnabled: false,
                sortData: null
            });
        } catch (error) {
            galeria.classList.remove('galeria-poetas--muuri');
            galeria.classList.add('galeria-poetas--respaldo');
            console.error('No se pudo inicializar Muuri:', error);
            return;
        }

        // Las fuentes web pueden variar la altura del nombre del poeta.
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
                if (instancia) {
                    instancia.refreshItems().layout();
                }
            });
        }

        // Al regresar del hub, recalcular después de mostrar la portada.
        var inicio = document.getElementById('seleccion-poetas');
        if (inicio && window.MutationObserver) {
            observador = new MutationObserver(function () {
                if (!inicio.hidden && instancia) {
                    window.requestAnimationFrame(function () {
                        if (instancia) {
                            instancia.refreshItems().layout();
                        }
                    });
                }
            });
            observador.observe(inicio, { attributes: true, attributeFilter: ['hidden'] });
        }
    }

    window.EntreVersosGaleria = { inicializar: inicializar };
}());
