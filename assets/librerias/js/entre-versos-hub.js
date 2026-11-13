
/**
 * Entre Versos · Hub del poeta
 * Carrusel Slick, vistas ampliadas Bootstrap y contenido REST API.
 * Navegación SPA sin recargar el documento.
 */

(function () {
    'use strict';

    var api = window.EntreVersosRest;
    var $ = window.jQuery;

    var hub = document.getElementById('vista-hub-poeta');
    var inicio = document.getElementById('seleccion-poetas');
    var carrusel = document.getElementById('carrusel-hub-poeta');
    var modalElemento = document.getElementById('modal-hub-contenido');

    var modal = null;
    var ultimoControl = null;
    var scrollEstrofasPendiente = false;

    var estado = {
        poeta: null,
        poemas: [],
        pantallas: [],
        poema: null,
        estrofas: [],
        estrofa: 0,
        continua: false,
        solicitud: 0,
        visual: 0
    };

    if (!api || !hub || !inicio || !carrusel || !modalElemento) {
        return;
    }

    // ========================================
    // UTILIDADES
    // ========================================

    function buscar(selector) {
        return document.querySelector(selector);
    }

    function escribir(selector, texto) {
        var nodo = buscar(selector);

        if (nodo) {
            nodo.textContent = texto == null ? '' : String(texto);
        }
    }

    function textoPlano(html) {
        var contenedor = document.createElement('div');
        contenedor.innerHTML = String(html || '');

        return (contenedor.textContent || '').trim();
    }

    function titulo(entrada) {
        return textoPlano(
            entrada && entrada.title && entrada.title.rendered
        );
    }

    function resumen(entrada) {
        return textoPlano(
            entrada && entrada.excerpt && entrada.excerpt.rendered
        );
    }

    function campos(entrada) {
        return entrada && entrada.acf &&
            typeof entrada.acf === 'object'
            ? entrada.acf
            : {};
    }

    function elementoTexto(etiqueta, clase, texto) {
        var elemento = document.createElement(etiqueta);

        if (clase) {
            elemento.className = clase;
        }

        elemento.textContent = texto == null ? '' : String(texto);

        return elemento;
    }

    function anio(fecha) {
        var texto = String(fecha || '');
        var hallado = texto.match(/\d{4}/);

        return hallado ? hallado[0] : '';
    }

    function detalle(poeta) {
        var datos = campos(poeta);
        var nacimiento = anio(datos.fecha_nacimiento);
        var fallecimiento = anio(datos.fecha_fallecimiento);

        var fechas = nacimiento
            ? nacimiento + (fallecimiento ? '–' + fallecimiento : '–')
            : '';

        return [datos.pais_origen, fechas]
            .filter(Boolean)
            .join(' · ');
    }

    // ========================================
    // IMÁGENES
    // ========================================

    function fuenteImagen(medio) {
        if (!medio) {
            return '';
        }

        if (typeof medio === 'string') {
            return /^https?:\/\//.test(medio) ? medio : '';
        }

        var tamanios = medio.media_details &&
            medio.media_details.sizes;

        if (tamanios) {
            for (var nombre of ['large', 'medium_large', 'medium']) {
                if (tamanios[nombre] &&
                    tamanios[nombre].source_url) {
                    return tamanios[nombre].source_url;
                }
            }
        }

        if (medio.sizes) {
            for (var clave of ['large', 'medium_large', 'medium']) {
                if (medio.sizes[clave]) {
                    return typeof medio.sizes[clave] === 'string'
                        ? medio.sizes[clave]
                        : medio.sizes[clave].url || '';
                }
            }
        }

        return medio.source_url || medio.url || '';
    }

    function buscarImagen(referencia) {
        if (!referencia) {
            return Promise.resolve(null);
        }

        if (typeof referencia === 'object') {
            return Promise.resolve(referencia);
        }

        if (typeof referencia === 'string' &&
            /^https?:\/\//.test(referencia)) {
            return Promise.resolve({ url: referencia });
        }

        return api.obtenerMedio(referencia).catch(function () {
            return null;
        });
    }

    function imagenEntrada(entrada) {
        var adjuntos = entrada &&
            entrada._embedded &&
            entrada._embedded['wp:featuredmedia'];

        if (Array.isArray(adjuntos) && adjuntos.length) {
            return Promise.resolve(adjuntos[0]);
        }

        return buscarImagen(entrada && entrada.featured_media);
    }

    function colocarImagen(contenedor, medio, textoAlternativo) {
        if (!contenedor) {
            return;
        }

        var src = fuenteImagen(medio);

        contenedor.replaceChildren();

        if (!src) {
            contenedor.appendChild(
                elementoTexto('i', 'bi bi-image', '')
            );
            return;
        }

        var img = document.createElement('img');

        img.src = src;
        img.alt = medio &&
            (medio.alt_text || medio.alt) ||
            textoAlternativo || '';
        img.loading = 'lazy';

        contenedor.appendChild(img);
    }

    // ========================================
    // NAVEGACIÓN CONTEXTUAL
    // ========================================

    function ponerRuta(contenido) {
        var nombrePoeta = document.getElementById('miga-poeta-nombre');
        var nombreContenido = document.getElementById('miga-contenido');

        if (nombrePoeta) {
            nombrePoeta.textContent = estado.poeta
                ? titulo(estado.poeta)
                : '';
        }

        if (nombreContenido) {
            nombreContenido.textContent = contenido || 'Obras';
        }
    }

    function mostrarHub() {
        inicio.hidden = true;
        hub.hidden = false;

        document.body.classList.add('modo-hub');

        var navegacion = document.getElementById('navegacion-contextual');

        if (navegacion) {
            navegacion.hidden = false;
        }

        ponerRuta('Obras');
    }

    function limpiarCarrusel() {
        if ($ && $.fn.slick &&
            $(carrusel).hasClass('slick-initialized')) {
            $(carrusel).off('.hub').slick('unslick');
        }

        carrusel.replaceChildren();
    }

    function detenerMusica() {
        if (window.EntreVersosAudio &&
            typeof window.EntreVersosAudio.detener === 'function') {
            window.EntreVersosAudio.detener();
        }
    }

    function volverInicio(actualizarHistorial) {
        estado.solicitud++;
        estado.poeta = null;
        estado.poemas = [];

        limpiarCarrusel();

        if (modal && modalElemento.classList.contains('show')) {
            modal.hide();
        }

        hub.hidden = true;
        inicio.hidden = false;

        document.body.classList.remove('modo-hub');

        var navegacion = document.getElementById('navegacion-contextual');

        if (navegacion) {
            navegacion.hidden = true;
        }

        detenerMusica();

        if (actualizarHistorial) {
            try {
                window.history.pushState(
                    { entreVersos: 'inicio' },
                    '',
                    window.location.pathname + window.location.search
                );
            } catch (error) {
                console.warn('Historial no disponible.', error);
            }
        }
    }

    // ========================================
    // TARJETAS DEL HUB
    // ========================================

    function crearTarjeta(tipo, entrada, indice, medio) {
        var exterior = document.createElement('div');
        var boton = document.createElement('button');
        var foto = document.createElement('div');

        var tituloTarjeta = elementoTexto(
            'h2',
            'hub-poeta__tarjeta-titulo',
            tipo === 'bio' ? 'Biografía' : titulo(entrada)
        );

        var pie = elementoTexto(
            'p',
            'hub-poeta__tarjeta-resumen',
            resumen(entrada)
        );

        exterior.className = 'hub-poeta__pantalla';

        boton.type = 'button';
        boton.className = 'hub-poeta__tarjeta tarjeta-editorial';
        boton.dataset.tipo = tipo;
        boton.dataset.id = String(entrada.id);

        boton.setAttribute(
            'aria-label',
            'Abrir ' +
            (tipo === 'bio' ? 'biografía de ' : 'poema ') +
            titulo(entrada)
        );

        foto.className = 'hub-poeta__tarjeta-imagen';

        colocarImagen(
            foto,
            medio,
            'Retrato o imagen de ' + titulo(entrada)
        );

        boton.appendChild(
            elementoTexto(
                'span',
                'etiqueta-editorial',
                String(indice + 1).padStart(2, '0') +
                ' / ' +
                (tipo === 'bio' ? 'Biografía' : 'Poema')
            )
        );

        boton.appendChild(foto);
        boton.appendChild(tituloTarjeta);

        if (pie.textContent) {
            boton.appendChild(pie);
        }

        boton.appendChild(
            elementoTexto(
                'span',
                'hub-poeta__abrir fuente-mono',
                'Abrir pantalla ↗'
            )
        );

        exterior.appendChild(boton);

        return exterior;
    }

    function actualizarIndicador(indice) {
        var total = estado.pantallas.length;

        escribir(
            '#hub-indicador',
            String(indice + 1).padStart(2, '0') +
            ' / ' +
            String(total).padStart(2, '0')
        );

        document.getElementById('hub-anterior').disabled = total <= 1;
        document.getElementById('hub-siguiente').disabled = total <= 1;
    }

    // ========================================
    // CARRUSEL SLICK - CENTER MODE
    // ========================================

    function montarCarrusel(poeta, poemas, medios) {
        var entradas = [
            { tipo: 'bio', entrada: poeta }
        ].concat(
            poemas.map(function (poema) {
                return { tipo: 'poema', entrada: poema };
            })
        );

        var fragmento = document.createDocumentFragment();

        estado.pantallas = entradas;

        limpiarCarrusel();

        entradas.forEach(function (item, indice) {
            fragmento.appendChild(
                crearTarjeta(
                    item.tipo,
                    item.entrada,
                    indice,
                    medios[indice]
                )
            );
        });

        carrusel.appendChild(fragmento);

        actualizarIndicador(0);
        escribir('#estado-hub-poeta', '');

        if ($ && $.fn.slick && entradas.length > 1) {
            var mostrarTres = entradas.length > 3;

            var reducirMovimiento = window.matchMedia &&
                window.matchMedia(
                    '(prefers-reduced-motion: reduce)'
                ).matches;

            $(carrusel).on(
                'afterChange.hub',
                function (evento, slick, indice) {
                    actualizarIndicador(indice);
                }
            );

            $(carrusel).slick({
                centerMode: true,
                centerPadding: mostrarTres ? '40px' : '23%',
                slidesToShow: mostrarTres ? 3 : 1,
                slidesToScroll: 1,

                infinite: true,
                arrows: false,
                dots: false,

                accessibility: true,
                focusOnSelect: false,

                speed: 950,
                cssEase: 'linear',

                autoplay: !reducirMovimiento,
                autoplaySpeed: 6000,

                pauseOnHover: true,
                pauseOnFocus: true,
                swipe: true,

                responsive: [
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 1,
                            centerPadding: '18%'
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            centerPadding: '13%'
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 1,
                            centerPadding: '8%'
                        }
                    }
                ]
            });
        }
    }

    function controlarAutoplay(pausar) {
        if (!$ || !$.fn.slick ||
            !$(carrusel).hasClass('slick-initialized')) {
            return;
        }

        if (!pausar &&
            window.matchMedia &&
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches) {
            return;
        }

        $(carrusel).slick(
            pausar ? 'slickPause' : 'slickPlay'
        );
    }

    function navegarCarrusel(direccion) {
        if ($ && $.fn.slick &&
            $(carrusel).hasClass('slick-initialized')) {

            $(carrusel).slick(
                direccion > 0 ? 'slickNext' : 'slickPrev'
            );

        } else if (estado.pantallas.length > 1) {
            var activos = Array.from(
                carrusel.querySelectorAll('.hub-poeta__pantalla')
            );

            var index = (
                Number(carrusel.dataset.indice || 0) +
                direccion +
                activos.length
            ) % activos.length;

            carrusel.dataset.indice = String(index);

            activos[index].scrollIntoView({
                block: 'nearest',
                inline: 'center',
                behavior: 'smooth'
            });

            actualizarIndicador(index);
        }
    }

    // ========================================
    // CARGA DEL POETA POR REST API
    // ========================================

    function abrirPoeta(id, historial) {
        var numero = Number(id);

        if (!Number.isInteger(numero) || numero < 1) {
            return;
        }

        var token = ++estado.solicitud;

        mostrarHub();
        limpiarCarrusel();

        escribir(
            '#estado-hub-poeta',
            'Cargando el archivo del poeta…'
        );

        if (historial) {
            try {
                window.history.pushState(
                    { entreVersos: 'poeta', poetaId: numero },
                    '',
                    '#poeta-' + numero
                );
            } catch (error) {
                console.warn('Historial no disponible.', error);
            }
        }

        Promise.all([
            api.obtenerPoeta(numero),
            api.obtenerPoemasDePoeta(numero)
        ]).then(function (datos) {
            if (token !== estado.solicitud) {
                return;
            }

            var poeta = datos[0];

            var poemas = Array.isArray(datos[1])
                ? datos[1]
                : [];

            estado.poeta = poeta;
            estado.poemas = poemas;

            escribir('#titulo-hub-poeta', titulo(poeta));
            escribir('#datos-hub-poeta', detalle(poeta));

            ponerRuta('Obras');

            if (window.EntreVersosAudio &&
                typeof window.EntreVersosAudio.activarPoeta === 'function') {
                window.EntreVersosAudio.activarPoeta(poeta);
            }

            return Promise.all(
                [poeta].concat(poemas).map(imagenEntrada)
            ).then(function (medios) {
                if (token !== estado.solicitud) {
                    return;
                }

                montarCarrusel(poeta, poemas, medios);
            });

        }).catch(function (error) {
            if (token !== estado.solicitud) {
                return;
            }

            console.error(
                'No se pudo cargar el hub del poeta:',
                error
            );

            escribir(
                '#estado-hub-poeta',
                'No se pudo cargar el archivo. Inténtalo nuevamente.'
            );
        });
    }

    // ========================================
    // MODAL DE CONTENIDO
    // ========================================

    function mostrarModal(tipo, entrada) {
        if (!window.bootstrap || !window.bootstrap.Modal) {
            return;
        }

        if (!modal) {
            modal = window.bootstrap.Modal.getOrCreateInstance(
                modalElemento
            );
        }

        buscar('#modal-hub-biografia').hidden = tipo !== 'bio';
        buscar('#modal-hub-poema').hidden = tipo !== 'poema';

        escribir(
            '#modal-hub-titulo',
            tipo === 'bio'
                ? titulo(estado.poeta)
                : titulo(entrada)
        );

        escribir(
            '#modal-hub-categoria',
            tipo === 'bio' ? 'Biografía' : 'Lectura poética'
        );

        ponerRuta(
            tipo === 'bio' ? 'Biografía' : titulo(entrada)
        );

        controlarAutoplay(true);

        modal.show();

        buscar('.modal-hub__cuerpo').scrollTop = 0;
    }

    // ========================================
    // BIOGRAFÍA
    // ========================================

    function abrirBiografia() {
        var poeta = estado.poeta;

        if (!poeta) {
            return;
        }

        escribir(
            '#modal-hub-datos-biografia',
            detalle(poeta)
        );

        escribir(
            '#modal-hub-pie-biografia',
            'Retrato de ' + titulo(poeta)
        );

        var texto = buscar('#modal-hub-texto-biografia');

        // Contenido HTML entregado por Gutenberg mediante REST.
        texto.innerHTML = poeta.content &&
            poeta.content.rendered || '';

        if (!texto.textContent.trim()) {
            texto.textContent = resumen(poeta) ||
                'Biografía pendiente de publicación.';
        }

        mostrarModal('bio', poeta);

        imagenEntrada(poeta).then(function (medio) {
            if (estado.poeta &&
                estado.poeta.id === poeta.id) {
                colocarImagen(
                    buscar('#modal-hub-foto-biografia'),
                    medio,
                    titulo(poeta)
                );
            }
        });
    }

    // ========================================
    // VERSOS Y PALABRAS CLAVE
    // ========================================

    function extraerVersos(estrofa) {
        var texto = String(estrofa.texto_estrofa || '');

        // Compatibilidad con estructura anterior de SCF.
        if (!texto.trim() && Array.isArray(estrofa.versos)) {
            return estrofa.versos.map(function (verso) {
                return {
                    texto: String(verso.texto_verso || ''),
                    clave: String(verso.palabra_clave || '')
                };
            });
        }

        var lineas = texto
            .replace(/\r\n?/g, '\n')
            .split('\n');

        var claves = String(estrofa.palabras_clave || '')
            .replace(/\r\n?/g, '\n')
            .split('\n');

        return lineas.map(function (linea, indice) {
            return {
                texto: linea,
                clave: String(claves[indice] || '').trim()
            };
        });
    }

    function resaltar(nodo, verso) {
        nodo.textContent = verso.texto;

        if (!verso.clave || verso.clave === '-') {
            return;
        }

        if ($ && $.fn.mark) {
            $(nodo).mark(verso.clave, {
                separateWordSearch: false,
                accuracy: 'exactly'
            });

        } else {
            var posicion = verso.texto
                .toLocaleLowerCase('es')
                .indexOf(
                    verso.clave.toLocaleLowerCase('es')
                );

            if (posicion === -1) {
                return;
            }

            nodo.replaceChildren(
                document.createTextNode(
                    verso.texto.slice(0, posicion)
                ),
                elementoTexto(
                    'mark',
                    '',
                    verso.texto.slice(
                        posicion,
                        posicion + verso.clave.length
                    )
                ),
                document.createTextNode(
                    verso.texto.slice(
                        posicion + verso.clave.length
                    )
                )
            );
        }
    }

    function versosEn(destino, estrofa, numerados) {
        var fragmento = document.createDocumentFragment();

        extraerVersos(estrofa).forEach(function (verso, indice) {
            var fila = document.createElement('p');

            fila.className = 'modal-hub__verso';

            if (numerados) {
                fila.appendChild(
                    elementoTexto(
                        'span',
                        'fuente-mono modal-hub__numero-verso',
                        String(indice + 1).padStart(2, '0')
                    )
                );
            }

            var contenido = document.createElement('span');

            resaltar(contenido, verso);
            fila.appendChild(contenido);

            fragmento.appendChild(fila);
        });

        destino.replaceChildren(fragmento);
    }

    // ========================================
    // SCROLL VERTICAL ENTRE ESTROFAS
    // ========================================

    function prepararDesplazamientoEstrofas() {
        var contenedor = buscar('#modal-hub-lectura-estrofa');
        var secuencia = buscar('#modal-hub-secuencia-estrofas');

        if (secuencia) {
            return secuencia;
        }

        if (!contenedor) {
            return null;
        }

        // Sustituimos la estructura de una estrofa
        // por un contenedor con todas las estrofas.

        Array.from(contenedor.children).forEach(function (hijo) {
            if (
                hijo.querySelector(
                    '#modal-hub-versos, #modal-hub-imagen-estrofa'
                )
            ) {
                hijo.remove();
            }
        });

        contenedor.classList.remove(
            'row',
            'g-3',
            'g-lg-4',
            'align-items-start'
        );

        contenedor.classList.add(
            'modal-hub__lectura-por-estrofas'
        );

        secuencia = document.createElement('div');

        secuencia.id = 'modal-hub-secuencia-estrofas';
        secuencia.className = 'modal-hub__secuencia-estrofas';
        secuencia.tabIndex = 0;

        secuencia.setAttribute('role', 'region');
        secuencia.setAttribute(
            'aria-label',
            'Estrofas del poema. Desplázate verticalmente para leerlas.'
        );

        contenedor.prepend(secuencia);

        var controles = contenedor.querySelector(
            '#modal-hub-estrofa-anterior'
        );

        if (controles && controles.parentElement) {
            controles.parentElement.classList.add(
                'modal-hub__controles-estrofas'
            );
        }

        secuencia.addEventListener('scroll', function () {
            if (scrollEstrofasPendiente || estado.continua) {
                return;
            }

            scrollEstrofasPendiente = true;

            window.requestAnimationFrame(function () {
                scrollEstrofasPendiente = false;
                actualizarEstrofaPorDesplazamiento();
            });

        }, { passive: true });

        return secuencia;
    }

    function actualizarControlesEstrofa() {
        var total = estado.estrofas.length;

        var anterior = buscar('#modal-hub-estrofa-anterior');
        var siguiente = buscar('#modal-hub-estrofa-siguiente');

        escribir(
            '#modal-hub-contador-estrofas',
            total
                ? 'Estrofa ' +
                  String(estado.estrofa + 1).padStart(2, '0') +
                  ' / ' +
                  String(total).padStart(2, '0')
                : 'Sin estrofas'
        );

        if (anterior) {
            anterior.disabled =
                !total || estado.estrofa <= 0;
        }

        if (siguiente) {
            siguiente.disabled =
                !total || estado.estrofa >= total - 1;
        }
    }

    function actualizarEstrofaPorDesplazamiento() {
        var secuencia = buscar('#modal-hub-secuencia-estrofas');

        if (!secuencia) {
            return;
        }

        var rect = secuencia.getBoundingClientRect();

        var secciones = secuencia.querySelectorAll(
            '.modal-hub__seccion-estrofa'
        );

        var indiceCercano = 0;
        var distancia = Infinity;

        secciones.forEach(function (seccion, indice) {
            var diferencia = Math.abs(
                seccion.getBoundingClientRect().top - rect.top
            );

            if (diferencia < distancia) {
                distancia = diferencia;
                indiceCercano = indice;
            }
        });

        if (secciones.length) {
            estado.estrofa = indiceCercano;
            actualizarControlesEstrofa();
        }
    }

    function navegarEstrofa(indice) {
        var secuencia = buscar('#modal-hub-secuencia-estrofas');

        if (!secuencia || !estado.estrofas.length) {
            return;
        }

        var nuevo = Math.max(
            0,
            Math.min(estado.estrofas.length - 1, indice)
        );

        var seccion = secuencia.querySelectorAll(
            '.modal-hub__seccion-estrofa'
        )[nuevo];

        if (!seccion) {
            return;
        }

        estado.estrofa = nuevo;
        actualizarControlesEstrofa();

        var movimientoReducido = window.matchMedia &&
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches;

        var destino =
            seccion.getBoundingClientRect().top -
            secuencia.getBoundingClientRect().top +
            secuencia.scrollTop;

        secuencia.scrollTo({
            top: destino,
            behavior: movimientoReducido ? 'auto' : 'smooth'
        });
    }

    // ========================================
    // CONSTRUIR TODAS LAS ESTROFAS
    // ========================================

    function construirEstrofasDesplazables(poema) {
        var secuencia = prepararDesplazamientoEstrofas();

        if (!secuencia) {
            return;
        }

        var fragmento = document.createDocumentFragment();
        var token = ++estado.visual;

        if (!estado.estrofas.length) {
            fragmento.appendChild(
                elementoTexto(
                    'p',
                    'p-3',
                    'Todavía no hay estrofas publicadas.'
                )
            );
        }

        estado.estrofas.forEach(function (estrofa, indice) {
            var seccion = document.createElement('section');

            seccion.className =
                'modal-hub__seccion-estrofa row g-3 g-lg-4 align-items-center';

            seccion.dataset.estrofa = String(indice);

            seccion.setAttribute(
                'aria-label',
                'Estrofa ' +
                (indice + 1) +
                ' de ' +
                estado.estrofas.length
            );

            var texto = document.createElement('div');
            texto.className =
                'col-12 col-lg-6 modal-hub__columna-texto';

            var visual = document.createElement('div');
            visual.className =
                'col-12 col-lg-6 modal-hub__columna-imagen';

            // Estrofa 1: texto izquierda, imagen derecha.
            // Estrofa 2: imagen izquierda, texto derecha.
            // El patrón continúa alternándose.

            if (indice % 2 === 1) {
                texto.classList.add(
                    'order-2',
                    'order-lg-2'
                );

                visual.classList.add(
                    'order-1',
                    'order-lg-1'
                );

            } else {
                texto.classList.add(
                    'order-1',
                    'order-lg-1'
                );

                visual.classList.add(
                    'order-2',
                    'order-lg-2'
                );
            }

            texto.appendChild(
                elementoTexto(
                    'span',
                    'etiqueta-editorial',
                    'Estrofa ' +
                    String(indice + 1).padStart(2, '0')
                )
            );

            var versos = document.createElement('div');

            versos.className = 'modal-hub__versos mt-3';

            versosEn(versos, estrofa, true);
            texto.appendChild(versos);

            var figura = document.createElement('figure');

            figura.className = 'mb-0';

            var imagen = document.createElement('div');

            imagen.className =
                'modal-hub__imagen modal-hub__imagen--estrofa';

            imagen.appendChild(
                elementoTexto(
                    'span',
                    'fuente-mono',
                    'Cargando imagen…'
                )
            );

            figura.appendChild(imagen);

            figura.appendChild(
                elementoTexto(
                    'figcaption',
                    'fuente-mono mt-2',
                    'Imagen asociada a la estrofa ' + (indice + 1)
                )
            );

            visual.appendChild(figura);

            seccion.append(texto, visual);
            fragmento.appendChild(seccion);

            buscarImagen(
                estrofa.imagen_estrofa
            ).then(function (medio) {
                if (
                    token !== estado.visual ||
                    !estado.poema ||
                    estado.poema.id !== poema.id
                ) {
                    return;
                }

                colocarImagen(
                    imagen,
                    medio,
                    'Imagen relacionada con la estrofa ' +
                    (indice + 1)
                );
            });
        });

        secuencia.replaceChildren(fragmento);
        secuencia.scrollTop = 0;

        estado.estrofa = 0;

        actualizarControlesEstrofa();
    }

    // ========================================
    // LECTURA CONTINUA
    // ========================================

    function construirLecturaCompleta(poema) {
        var destino = buscar('#modal-hub-estrofas-completas');
        var fragmento = document.createDocumentFragment();

        estado.estrofas.forEach(function (estrofa, indice) {
            var seccion = document.createElement('section');

            seccion.className = 'modal-hub__estrofa-completa';

            versosEn(seccion, estrofa, false);

            seccion.prepend(
                elementoTexto(
                    'span',
                    'etiqueta-editorial',
                    'Estrofa ' +
                    String(indice + 1).padStart(2, '0')
                )
            );

            fragmento.appendChild(seccion);
        });

        destino.replaceChildren(fragmento);

        escribir('#modal-hub-cierre-titulo', titulo(poema));
        escribir('#modal-hub-cierre-autor', titulo(estado.poeta));

        imagenEntrada(poema).then(function (medio) {
            if (estado.poema &&
                estado.poema.id === poema.id) {

                colocarImagen(
                    buscar('#modal-hub-imagen-cierre'),
                    medio,
                    'Imagen de cierre de ' + titulo(poema)
                );
            }
        });
    }

    function alternarContinua(activa) {
        estado.continua = activa;

        buscar('#modal-hub-lectura-estrofa').hidden = activa;
        buscar('#modal-hub-lectura-continua').hidden = !activa;

        modalElemento.classList.toggle(
            'modal-hub--estrofas-scroll',
            !activa
        );

        var control = buscar('#modal-hub-alternar-lectura');

        control.setAttribute(
            'aria-pressed',
            activa ? 'true' : 'false'
        );

        control.textContent = activa
            ? 'Volver a estrofas'
            : 'Lectura continua';

        buscar('.modal-hub__cuerpo').scrollTop = 0;
    }

    // ========================================
    // ABRIR POEMA
    // ========================================

    function abrirPoema(poemaDeColeccion) {
        var solicitud = ++estado.solicitud;

        api.obtenerPoema(
            poemaDeColeccion.id
        ).then(function (poema) {

            if (solicitud !== estado.solicitud || !estado.poeta) {
                return;
            }

            estado.poema = poema;

            estado.estrofas = Array.isArray(
                campos(poema).estrofas
            ) ? campos(poema).estrofas : [];

            estado.estrofa = 0;
            estado.visual++;

            mostrarModal('poema', poema);

            alternarContinua(false);

            construirEstrofasDesplazables(poema);
            construirLecturaCompleta(poema);

        }).catch(function (error) {
            console.error('Error al abrir poema:', error);

            escribir(
                '#estado-hub-poeta',
                'No se pudo recuperar el poema. Inténtalo de nuevo.'
            );
        });
    }

    function abrirPantalla(boton) {
        ultimoControl = boton;

        var id = Number(boton.dataset.id);
        var tipo = boton.dataset.tipo;

        if (!estado.poeta) {
            return;
        }

        if (tipo === 'bio') {
            abrirBiografia();
            return;
        }

        if (tipo === 'poema') {
            var poema = estado.poemas.find(function (item) {
                return item.id === id;
            });

            if (poema) {
                abrirPoema(poema);
            }
        }
    }

    // ========================================
    // EVENTOS E INICIALIZACIÓN
    // ========================================

    function iniciar() {

        // Selección de poeta desde las Polaroid.

        document.addEventListener('click', function (evento) {
            var explorar = evento.target.closest(
                '#bandeja-poeta-contenido a'
            );

            if (!explorar) {
                return;
            }

            var seleccionado = document.querySelector(
                '#galeria-poetas .posicion-polaroid.esta-seleccionado'
            );

            var id = Number(
                explorar.dataset.poetaId ||
                seleccionado && seleccionado.dataset.poetaId
            );

            if (!id) {
                return;
            }

            evento.preventDefault();
            abrirPoeta(id, true);
        });

        // Abrir tarjeta de biografía o poema.

        carrusel.addEventListener('click', function (evento) {
            var boton = evento.target.closest(
                '.hub-poeta__tarjeta'
            );

            if (boton) {
                abrirPantalla(boton);
            }
        });

        // Navegación del hub.

        document.getElementById(
            'hub-volver-inicio'
        ).addEventListener('click', function () {
            volverInicio(true);
        });

        document.getElementById(
            'hub-anterior'
        ).addEventListener('click', function () {
            navegarCarrusel(-1);
        });

        document.getElementById(
            'hub-siguiente'
        ).addEventListener('click', function () {
            navegarCarrusel(1);
        });

        // Navegación entre estrofas.

        document.getElementById(
            'modal-hub-estrofa-anterior'
        ).addEventListener('click', function () {
            navegarEstrofa(estado.estrofa - 1);
        });

        document.getElementById(
            'modal-hub-estrofa-siguiente'
        ).addEventListener('click', function () {
            navegarEstrofa(estado.estrofa + 1);
        });

        // Alternar lectura continua.

        document.getElementById(
            'modal-hub-alternar-lectura'
        ).addEventListener('click', function () {
            alternarContinua(!estado.continua);
        });

        // Cierre del modal.

        modalElemento.addEventListener(
            'hidden.bs.modal',
            function () {
                ponerRuta('Obras');

                estado.visual++;

                modalElemento.classList.remove(
                    'modal-hub--estrofas-scroll'
                );

                if (!hub.hidden) {
                    controlarAutoplay(false);
                }

                if (
                    ultimoControl &&
                    ultimoControl.isConnected &&
                    !hub.hidden
                ) {
                    ultimoControl.focus();
                }
            }
        );

        // Regreso al inicio desde el menú contextual.

        var volver = document.querySelector(
            '.barra-superior__inicio'
        );

        if (volver) {
            volver.addEventListener('click', function (evento) {
                if (
                    document.body.classList.contains('modo-hub')
                ) {
                    evento.preventDefault();
                    volverInicio(true);
                }
            });
        }

        // Historial del navegador.

        window.addEventListener('popstate', function () {
            var coincidencia = window.location.hash.match(
                /^#poeta-(\d+)$/
            );

            if (coincidencia) {
                abrirPoeta(
                    Number(coincidencia[1]),
                    false
                );
            } else {
                volverInicio(false);
            }
        });

        var inicial = window.location.hash.match(
            /^#poeta-(\d+)$/
        );

        if (inicial) {
            abrirPoeta(
                Number(inicial[1]),
                false
            );
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }

}());
