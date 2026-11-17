/**
 * Entre Versos · Interacciones de portada
 * Muuri: posiciona las Polaroid (galeria.js).
 * GSAP: entrada progresiva y regreso del arrastre.
 * GSAP Draggable: detecta solapamiento con «Dejar aquí».
 * Atropos: profundidad 3D de la fotografía, sin mover el item Muuri.
 * Un único evento activa el hub tanto por clic como por drop.
 */
(function () {
    'use strict';

    var arrastres = [];
    var profundidades = [];
    var galeriaActiva = null;
    var bandeja = null;

    function movimientoReducido() {
        return !!(window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function activarPoeta(id) {
        if (window.EntreVersosSeleccion &&
            typeof window.EntreVersosSeleccion.seleccionarId === 'function') {
            window.EntreVersosSeleccion.seleccionarId(id, 'arrastre');
        } else {
            window.dispatchEvent(new CustomEvent('entreversos:seleccionar-poeta', {
                detail: {id: Number(id), origen: 'arrastre'}
            }));
        }
    }

    function limpiar() {
        arrastres.forEach(function (arrastre) {
            if (arrastre && typeof arrastre.kill === 'function') { arrastre.kill(); }
        });
        profundidades.forEach(function (efecto) {
            if (efecto && typeof efecto.destroy === 'function') { efecto.destroy(); }
        });
        arrastres = [];
        profundidades = [];
        if (bandeja) { bandeja.classList.remove('bandeja-poeta--objetivo'); }
    }

    // La envoltura interna recibe el transform del arrastre.
    // Muuri reserva el transform exterior exclusivamente para el layout.
    function inicializarArrastreGsap(tarjetas) {
        if (!window.gsap || !window.Draggable) { return false; }
        if (typeof window.gsap.registerPlugin === 'function') {
            window.gsap.registerPlugin(window.Draggable);
        }
        tarjetas.forEach(function (tarjeta) {
            var interior = tarjeta.querySelector('.polaroid-muuri__contenido');
            var id = Number(tarjeta.dataset.poetaId);
            if (!interior || !id) { return; }
            var instancias = window.Draggable.create(interior, {
                type: 'x,y',
                trigger: interior,
                minimumMovement: 5,
                edgeResistance: 0.7,
                zIndexBoost: false,
                cursor: 'grab',
                allowNativeTouchScrolling: true,
                onClick: function () {
                    // GSAP puede retener el click nativo: este respaldo también
                    // abre el hub, sin duplicar la apertura por el control en contenido.js.
                    if ( !tarjeta.dataset.arrastrando && window.EntreVersosSeleccion ) {
                        window.EntreVersosSeleccion.seleccionarId( id, 'clic' );
                    }
                },
                onDragStart: function () {
                    tarjeta.dataset.arrastrando = 'true';
                    tarjeta.classList.add('esta-arrastrando');
                },
                onDrag: function () {
                    if (bandeja) {
                        bandeja.classList.toggle('bandeja-poeta--objetivo',
                            window.Draggable.hitTest(interior, bandeja, '12%'));
                    }
                },
                onDragEnd: function () {
                    var dentro = bandeja && window.Draggable.hitTest(interior, bandeja, '12%');
                    tarjeta.classList.remove('esta-arrastrando');
                    if (bandeja) { bandeja.classList.remove('bandeja-poeta--objetivo'); }

                    // Mantener la supresión del clic sintético al terminar un drag.
                    window.setTimeout(function () {
                        delete tarjeta.dataset.arrastrando;
                    }, 80);

                    if (dentro) {
                        activarPoeta(id);
                        window.gsap.set(interior, {x: 0, y: 0});
                    } else {
                        window.gsap.to(interior, {
                            x: 0,
                            y: 0,
                            duration: movimientoReducido() ? 0 : 0.28,
                            ease: 'power2.out',
                            overwrite: true
                        });
                    }
                }
            });
            arrastres.push.apply(arrastres, instancias);
        });
        return true;
    }

    // Respaldo equivalente al proyecto Sinapsis: HTML5 DataTransfer.
    // Se usa cuando Draggable no está disponible, sin duplicar el arrastre.
    function inicializarArrastreNativo(tarjetas) {
        if (!bandeja) { return; }
        tarjetas.forEach(function (tarjeta) {
            tarjeta.draggable = true;
            tarjeta.addEventListener('dragstart', function (evento) {
                if (!evento.dataTransfer) { return; }
                tarjeta.dataset.arrastrando = 'true';
                evento.dataTransfer.setData('text/plain', String(tarjeta.dataset.poetaId));
                evento.dataTransfer.effectAllowed = 'copy';
            });
            tarjeta.addEventListener('dragend', function () {
                bandeja.classList.remove('bandeja-poeta--objetivo');
                window.setTimeout(function () { delete tarjeta.dataset.arrastrando; }, 80);
            });
        });
        bandeja.addEventListener('dragover', function (evento) {
            evento.preventDefault();
            bandeja.classList.add('bandeja-poeta--objetivo');
            if (evento.dataTransfer) { evento.dataTransfer.dropEffect = 'copy'; }
        });
        bandeja.addEventListener('dragleave', function (evento) {
            if (!bandeja.contains(evento.relatedTarget)) {
                bandeja.classList.remove('bandeja-poeta--objetivo');
            }
        });
        bandeja.addEventListener('drop', function (evento) {
            evento.preventDefault();
            bandeja.classList.remove('bandeja-poeta--objetivo');
            var identificador = Number(evento.dataTransfer &&
                evento.dataTransfer.getData('text/plain'));
            if (identificador && galeriaActiva &&
                Array.from(galeriaActiva.querySelectorAll('.posicion-polaroid'))
                    .some(function (item) { return Number(item.dataset.poetaId) === identificador; })) {
                activarPoeta(identificador);
            }
        });
    }

    function inicializarProfundidad(tarjetas) {
        if (typeof window.Atropos !== 'function' || movimientoReducido()) { return; }
        tarjetas.forEach(function (tarjeta) {
            var superficie = tarjeta.querySelector('.tarjeta-polaroid.atropos');
            if (!superficie) { return; }
            try {
                profundidades.push(window.Atropos({
                    el: superficie,
                    activeOffset: 8,
                    rotateXMax: 9,
                    rotateYMax: 9,
                    rotateTouch: false,
                    shadow: false,
                    highlight: false,
                    duration: 230
                }));
            } catch (error) {
                console.warn('No se pudo activar la profundidad de una fotografía:', error);
            }
        });
    }

    function animarEntrada(tarjetas) {
        if (!window.gsap || movimientoReducido()) { return; }
        window.gsap.fromTo(tarjetas,
            {opacity: 0},
            {
                opacity: 1,
                duration: 0.48,
                stagger: {each: 0.025, from: 'random'},
                ease: 'power2.out',
                overwrite: true,
                clearProps: 'opacity'
            }
        );
    }

    function inicializar() {
        var galeria = document.getElementById('galeria-poetas');
        bandeja = document.getElementById('bandeja-poeta');
        if (!galeria || !bandeja) { return; }
        limpiar();
        galeriaActiva = galeria;
        var tarjetas = Array.from(galeria.querySelectorAll('.posicion-polaroid'));
        inicializarProfundidad(tarjetas);
        if (!inicializarArrastreGsap(tarjetas)) {
            inicializarArrastreNativo(tarjetas);
        }
        animarEntrada(tarjetas);
    }

    // contenido.js dispara este evento cuando recibió JSON y creó todos los nodos.
    window.addEventListener('entreversos:galeria-lista', inicializar);
    window.EntreVersosInteracciones = {inicializar: inicializar, limpiar: limpiar};
}());
