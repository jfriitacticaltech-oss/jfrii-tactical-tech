/* ============================================================
   JFRII TACTICAL TECH
   3D TECHNICAL VIEW + SISTEMA DE TICKETS
============================================================ */


/* ============================================================
   THREE.JS
============================================================ */

import * as THREE from "three";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

import {
    OrbitControls
} from "three/addons/controls/OrbitControls.js";


/* ============================================================
   CONFIGURACIÓN GENERAL 3D
============================================================ */

const MODEL_PATH =
    "./Tippman_Project_Salvo.glb";

const container =
    document.getElementById("canvas-container");


if (!container) {

    console.warn(
        "JFRII 3D: no se encontró #canvas-container."
    );

} else {


    /* ========================================================
       ESCENA
    ======================================================== */

    const scene =
        new THREE.Scene();


    /* ========================================================
       CÁMARA
    ======================================================== */

    const camera =
        new THREE.PerspectiveCamera(
            32,
            container.clientWidth /
            Math.max(container.clientHeight, 1),
            0.01,
            1000
        );


    camera.position.set(
        0,
        0.35,
        5.5
    );


    /* ========================================================
       RENDERER
    ======================================================== */

    const renderer =
        new THREE.WebGLRenderer({

            antialias: true,

            alpha: true,

            powerPreference:
                "high-performance"

        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            2
        )
    );


    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );


    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;


    renderer.toneMappingExposure =
        1.25;


    renderer.shadowMap.enabled =
        false;


    container.appendChild(
        renderer.domElement
    );


    /* ========================================================
       CONTROLES
    ======================================================== */

    const controls =
        new OrbitControls(
            camera,
            renderer.domElement
        );


    controls.enableDamping =
        true;


    controls.dampingFactor =
        0.075;


    controls.enableZoom =
        false;


    controls.enablePan =
        false;


    controls.enableRotate =
        true;


    controls.minPolarAngle =
        Math.PI * 0.25;


    controls.maxPolarAngle =
        Math.PI * 0.75;


    controls.rotateSpeed =
        0.65;


    /* ========================================================
       ILUMINACIÓN
    ======================================================== */

    const ambientLight =
        new THREE.AmbientLight(
            0xffead8,
            2.8
        );


    scene.add(
        ambientLight
    );


    const keyLight =
        new THREE.DirectionalLight(
            0xffd0a3,
            7.0
        );


    keyLight.position.set(
        4,
        5,
        6
    );


    scene.add(
        keyLight
    );


    const frontLight =
        new THREE.PointLight(
            0xffdfc0,
            7.0,
            12
        );


    frontLight.position.set(
        1,
        2,
        5
    );


    scene.add(
        frontLight
    );


    const fillLight =
        new THREE.DirectionalLight(
            0xffeee3,
            3.5
        );


    fillLight.position.set(
        -4,
        2,
        5
    );


    scene.add(
        fillLight
    );


    const topLight =
        new THREE.PointLight(
            0xffc99d,
            5.0,
            14
        );


    topLight.position.set(
        0,
        5,
        2
    );


    scene.add(
        topLight
    );


    const rimLight =
        new THREE.PointLight(
            0x9f214b,
            7.0,
            12
        );


    rimLight.position.set(
        4,
        2,
        -4
    );


    scene.add(
        rimLight
    );


    const sideWarmLight =
        new THREE.PointLight(
            0xffbd8c,
            4.5,
            10
        );


    sideWarmLight.position.set(
        -4,
        1,
        1
    );


    scene.add(
        sideWarmLight
    );


    /* ========================================================
       RETÍCULA PRINCIPAL
    ======================================================== */

    const grid =
        new THREE.GridHelper(
            12,
            24,
            0x7c1739,
            0x32121d
        );


    grid.position.y =
        -1.55;


    if (Array.isArray(grid.material)) {

        grid.material.forEach(
            material => {

                material.transparent =
                    true;

                material.opacity =
                    0.30;

            }
        );

    } else {

        grid.material.transparent =
            true;

        grid.material.opacity =
            0.30;

    }


    scene.add(
        grid
    );


    /* ========================================================
       RETÍCULA FINA
    ======================================================== */

    const gridFine =
        new THREE.GridHelper(
            12,
            48,
            0x501027,
            0x210d15
        );


    gridFine.position.y =
        -1.54;


    if (Array.isArray(gridFine.material)) {

        gridFine.material.forEach(
            material => {

                material.transparent =
                    true;

                material.opacity =
                    0.16;

            }
        );

    } else {

        gridFine.material.transparent =
            true;

        gridFine.material.opacity =
            0.16;

    }


    scene.add(
        gridFine
    );


    /* ========================================================
       EJE CENTRAL
    ======================================================== */

    const axisMaterial =
        new THREE.LineBasicMaterial({

            color:
                0xa62950,

            transparent:
                true,

            opacity:
                0.25

        });


    const axisGeometry =
        new THREE.BufferGeometry()
            .setFromPoints([

                new THREE.Vector3(
                    -6,
                    -1.52,
                    0
                ),

                new THREE.Vector3(
                    6,
                    -1.52,
                    0
                )

            ]);


    const axis =
        new THREE.Line(
            axisGeometry,
            axisMaterial
        );


    scene.add(
        axis
    );


    /* ========================================================
       GRUPO DEL MODELO
    ======================================================== */

    const modelGroup =
        new THREE.Group();


    scene.add(
        modelGroup
    );


    /* ========================================================
       CARGADOR GLB
    ======================================================== */

    const loader =
        new GLTFLoader();


    loader.load(

        MODEL_PATH,

        function (gltf) {

            console.log(
                "✓ TIPPMANN GLB CARGADO"
            );


            const model =
                gltf.scene;


            /* ================================================
               CALCULAR DIMENSIONES
            ================================================ */

            const box =
                new THREE.Box3()
                    .setFromObject(
                        model
                    );


            const size =
                box.getSize(
                    new THREE.Vector3()
                );


            const center =
                box.getCenter(
                    new THREE.Vector3()
                );


            /* ================================================
               CENTRAR MODELO
            ================================================ */

            model.position.sub(
                center
            );


            const maxDimension =
                Math.max(
                    size.x,
                    size.y,
                    size.z
                );


            if (
                !Number.isFinite(
                    maxDimension
                ) ||
                maxDimension <= 0
            ) {

                console.error(
                    "✕ El modelo GLB tiene dimensiones inválidas."
                );

                return;

            }


            /* ================================================
               ESCALA FINAL
            ================================================ */

            const desiredSize =
                3.35;


            const finalScale =
                desiredSize /
                maxDimension;


            /* ================================================
               POSICIÓN
            ================================================ */

            model.position.x =
                0.25;


            model.position.y =
                0;


            model.position.z =
                0;


            /* ================================================
               ROTACIÓN
            ================================================ */

            model.rotation.y =
                -0.55;


            model.rotation.x =
                0.02;


            /* ================================================
               MATERIALES
            ================================================ */

            model.traverse(

                function (child) {

                    if (
                        child.isMesh
                    ) {

                        child.castShadow =
                            false;


                        child.receiveShadow =
                            false;


                        if (
                            child.material
                        ) {

                            const materials =
                                Array.isArray(
                                    child.material
                                )
                                    ? child.material
                                    : [
                                        child.material
                                    ];


                            materials.forEach(
                                material => {

                                    material.needsUpdate =
                                        true;


                                    if (
                                        "roughness"
                                        in material
                                    ) {

                                        material.roughness =
                                            Math.min(
                                                Number(
                                                    material.roughness
                                                ) || 0.7,
                                                0.7
                                            );

                                    }


                                    if (
                                        "metalness"
                                        in material
                                    ) {

                                        material.metalness =
                                            Math.max(
                                                Number(
                                                    material.metalness
                                                ) || 0,
                                                0.05
                                            );

                                    }

                                }
                            );

                        }

                    }

                }

            );


            /* ================================================
               AGREGAR MODELO
            ================================================ */

            modelGroup.add(
                model
            );


            /* ================================================
               ANIMACIÓN DE ENTRADA
            ================================================ */

            const initialScale =
                finalScale;


            model.scale.setScalar(
                initialScale * 0.001
            );


            const start =
                performance.now();


            const duration =
                1000;


            function intro(
                now
            ) {

                const progress =
                    Math.min(
                        (
                            now - start
                        ) /
                        duration,
                        1
                    );


                const eased =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );


                model.scale.setScalar(
                    initialScale *
                    Math.max(
                        eased,
                        0.001
                    )
                );


                if (
                    progress < 1
                ) {

                    requestAnimationFrame(
                        intro
                    );

                } else {

                    model.scale.setScalar(
                        initialScale
                    );

                }

            }


            requestAnimationFrame(
                intro
            );


            console.log(
                "✓ MODELO 3D LISTO"
            );

        },

        function (progress) {

            if (
                progress &&
                progress.total
            ) {

                const percent =
                    (
                        progress.loaded /
                        progress.total
                    ) *
                    100;


                console.log(
                    `Modelo: ${percent.toFixed(0)}%`
                );

            }

        },

        function (error) {

            console.error(
                "✕ ERROR CARGANDO GLB:",
                error
            );

        }

    );


    /* ========================================================
       RESIZE
    ======================================================== */

    function resize() {

        const width =
            container.clientWidth;


        const height =
            container.clientHeight;


        if (
            width <= 0 ||
            height <= 0
        ) {

            return;

        }


        camera.aspect =
            width / height;


        camera.updateProjectionMatrix();


        renderer.setSize(
            width,
            height,
            false
        );


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );

    }


    window.addEventListener(
        "resize",
        resize
    );


    /* ========================================================
       ANIMACIÓN
    ======================================================== */

    const clock =
        new THREE.Clock();


    function animate() {

        requestAnimationFrame(
            animate
        );


        const elapsed =
            clock.getElapsedTime();


        if (
            modelGroup.children.length
        ) {

            const model =
                modelGroup.children[0];


            model.position.y =
                Math.sin(
                    elapsed * 0.6
                ) *
                0.012;

        }


        grid.position.z =
            (
                elapsed * 0.015
            ) % 0.5;


        gridFine.position.z =
            (
                elapsed * 0.02
            ) % 0.25;


        controls.update();


        renderer.render(
            scene,
            camera
        );

    }


    animate();


    console.log(
        "JFRII TACTICAL TECH — 3D SYSTEM ONLINE"
    );

}


/* ============================================================
   SISTEMA DE TICKETS
   JFRII TACTICAL TECH
============================================================ */


/* ============================================================
   DATOS DEL TALLER
============================================================ */

const SHOP_DATA = {

    name:
        "JFRII TACTICAL TECH",

    service:
        "SERVICIO TÉCNICO PAINTBALL",

    city:
        "Soacha - Ciudad Verde",

    address:
        "Calle 33 # 37 - 161",

    residential:
        "Conjunto Residencial Azucena",

    phone:
        "324 732 5473",

    email:
        "jfriitacticaltech@gmail.com",

    whatsapp:
        "573247325473"

};


/* ============================================================
   ELEMENTOS
============================================================ */

const ticketModal =
    document.getElementById(
        "ticket-modal"
    );


const openTicketButton =
    document.getElementById(
        "open-ticket"
    );


const closeTicketButton =
    document.getElementById(
        "close-ticket"
    );


const ticketOverlay =
    document.getElementById(
        "ticket-overlay"
    );


const ticketForm =
    document.getElementById(
        "ticket-form"
    );


const ticketStatus =
    document.getElementById(
        "ticket-status"
    );


const printTicket =
    document.getElementById(
        "print-ticket"
    );


const trackingForm =
    document.getElementById(
        "tracking-form"
    );


const trackingTicketInput =
    document.getElementById(
        "tracking-ticket"
    );


const trackingStatus =
    document.getElementById(
        "tracking-status"
    );


/* ============================================================
   UTILIDADES
============================================================ */

function getElementValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return "";

    }


    return String(
        element.value || ""
    ).trim();

}


/* ============================================================
   ABRIR MODAL
============================================================ */

function openTicketModal() {

    if (!ticketModal) {

        console.warn(
            "No existe #ticket-modal"
        );

        return;

    }


    ticketModal.classList.add(
        "active"
    );


    ticketModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    const firstInput =
        ticketModal.querySelector(
            "input, select, textarea"
        );


    if (firstInput) {

        setTimeout(
            () => firstInput.focus(),
            100
        );

    }

}


/* ============================================================
   CERRAR MODAL
============================================================ */

function closeTicketModal() {

    if (!ticketModal) {

        return;

    }


    ticketModal.classList.remove(
        "active"
    );


    ticketModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* ============================================================
   EVENTOS DEL MODAL
============================================================ */

if (
    openTicketButton
) {

    openTicketButton.addEventListener(
        "click",
        openTicketModal
    );

}


if (
    closeTicketButton
) {

    closeTicketButton.addEventListener(
        "click",
        closeTicketModal
    );

}


if (
    ticketOverlay
) {

    ticketOverlay.addEventListener(
        "click",
        closeTicketModal
    );

}


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeTicketModal();

        }

    }
);


/* ============================================================
   LIMPIAR HTML
============================================================ */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   FORMATEAR DINERO
============================================================ */

function formatMoney(
    value
) {

    const amount =
        Number(value) || 0;


    return new Intl.NumberFormat(
        "es-CO",
        {
            maximumFractionDigits: 0
        }
    ).format(
        amount
    );

}


/* ============================================================
   NORMALIZAR TICKET
============================================================ */

function normalizeTicket(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toUpperCase();

}


/* ============================================================
   CREAR TICKET PARA IMPRESIÓN
============================================================ */

function buildPrintableTicket(
    data
) {

    if (!printTicket) {

        return;

    }


    printTicket.innerHTML = `

        <div class="print-ticket-container">

            <div class="print-brand">
                ${escapeHTML(
                    SHOP_DATA.name
                )}
            </div>

            <div class="print-subtitle">
                ${escapeHTML(
                    SHOP_DATA.service
                )}
            </div>

            <div class="print-ticket-number">
                TICKET ${escapeHTML(
                    data.ticket
                )}
            </div>


            <div class="print-section">

                <div class="print-section-title">
                    CLIENTE
                </div>

                <div class="print-line">
                    <strong>Nombre:</strong>
                    ${escapeHTML(data.name)}
                </div>

                <div class="print-line">
                    <strong>Teléfono:</strong>
                    ${escapeHTML(data.phone)}
                </div>

                <div class="print-line">
                    <strong>WhatsApp:</strong>
                    ${escapeHTML(data.whatsapp)}
                </div>

                <div class="print-line">
                    <strong>Correo:</strong>
                    ${escapeHTML(data.email)}
                </div>

            </div>


            <div class="print-section">

                <div class="print-section-title">
                    EQUIPO
                </div>

                <div class="print-line">
                    <strong>Marca:</strong>
                    ${escapeHTML(data.brand)}
                </div>

                <div class="print-line">
                    <strong>Modelo:</strong>
                    ${escapeHTML(data.model)}
                </div>

                <div class="print-line">
                    <strong>Servicio:</strong>
                    ${escapeHTML(data.service)}
                </div>

                <div class="print-line">
                    <strong>Descripción:</strong>
                    ${escapeHTML(data.description)}
                </div>

            </div>


            <div class="print-section">

                <div class="print-section-title">
                    TRANSPORTADORA
                </div>

                <div class="print-line">
                    ${escapeHTML(data.carrier)}
                </div>

            </div>


            <div class="print-section">

                <div class="print-section-title">
                    DATOS PARA RETORNO
                </div>

                <div class="print-line">
                    <strong>Nombre:</strong>
                    ${escapeHTML(data.name)}
                </div>

                <div class="print-line">
                    <strong>Dirección:</strong>
                    ${escapeHTML(data.address)}
                </div>

                <div class="print-line">
                    <strong>Ciudad:</strong>
                    ${escapeHTML(data.city)}
                </div>

                <div class="print-line">
                    <strong>Barrio:</strong>
                    ${escapeHTML(
                        data.neighborhood ||
                        "No indicado"
                    )}
                </div>

                <div class="print-line">
                    <strong>WhatsApp:</strong>
                    ${escapeHTML(data.whatsapp)}
                </div>

            </div>


            <div class="print-section">

                <div class="print-section-title">
                    DESTINO DEL EQUIPO
                </div>

                <div class="print-line">
                    <strong>
                        ${escapeHTML(
                            SHOP_DATA.name
                        )}
                    </strong>
                </div>

                <div class="print-line">
                    ${escapeHTML(
                        SHOP_DATA.city
                    )}
                </div>

                <div class="print-line">
                    ${escapeHTML(
                        SHOP_DATA.address
                    )}
                </div>

                <div class="print-line">
                    ${escapeHTML(
                        SHOP_DATA.residential
                    )}
                </div>

                <div class="print-line">
                    Tel. ${escapeHTML(
                        SHOP_DATA.phone
                    )}
                </div>

            </div>


            <div class="print-section">

                <div class="print-line">

                    <strong>
                        Fecha de creación:
                    </strong>

                    ${escapeHTML(
                        data.date
                    )}

                </div>

            </div>


            <div class="print-warning">

                PEGAR ESTE TICKET EN LA PARTE
                EXTERIOR DEL PAQUETE

            </div>

        </div>

    `;

}


/* ============================================================
   MOSTRAR TICKET GENERADO
============================================================ */

function showGeneratedTicket(
    data
) {

    if (!ticketStatus) {

        return;

    }


    ticketStatus.innerHTML = `

        <div class="generated-ticket">

            <div class="generated-ticket-header">

                <div class="generated-ticket-brand">
                    ${escapeHTML(
                        SHOP_DATA.name
                    )}
                </div>

                <div class="generated-ticket-subtitle">
                    ${escapeHTML(
                        SHOP_DATA.service
                    )}
                </div>

            </div>


            <div class="generated-ticket-number">
                ${escapeHTML(
                    data.ticket
                )}
            </div>


            <div class="generated-ticket-row">

                <span>CLIENTE</span>

                <span>
                    ${escapeHTML(
                        data.name
                    )}
                </span>

            </div>


            <div class="generated-ticket-row">

                <span>EQUIPO</span>

                <span>
                    ${escapeHTML(data.brand)}
                    ${escapeHTML(data.model)}
                </span>

            </div>


            <div class="generated-ticket-row">

                <span>SERVICIO</span>

                <span>
                    ${escapeHTML(
                        data.service
                    )}
                </span>

            </div>


            <div class="generated-ticket-row">

                <span>TRANSPORTADORA</span>

                <span>
                    ${escapeHTML(
                        data.carrier
                    )}
                </span>

            </div>


            <div class="generated-ticket-actions">

                <button
                    type="button"
                    class="primary-button"
                    id="print-generated-ticket"
                >
                    IMPRIMIR TICKET
                </button>


                <a
                    href="#seguimiento"
                    class="secondary-button"
                    id="track-generated-ticket"
                >
                    CONSULTAR TICKET
                </a>


                <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="secondary-button"
                    id="whatsapp-ticket"
                >
                    AVISAR POR WHATSAPP
                </a>

            </div>

        </div>

    `;


    buildPrintableTicket(
        data
    );


    const printButton =
        document.getElementById(
            "print-generated-ticket"
        );


    const whatsappButton =
        document.getElementById(
            "whatsapp-ticket"
        );


    const trackButton =
        document.getElementById(
            "track-generated-ticket"
        );


    /* ========================================================
       IMPRIMIR
    ======================================================== */

    if (printButton) {

        printButton.addEventListener(
            "click",
            function () {

                window.print();

            }
        );

    }


    /* ========================================================
       CONSULTAR
    ======================================================== */

    if (trackButton) {

        trackButton.addEventListener(
            "click",
            function () {

                if (
                    trackingTicketInput
                ) {

                    trackingTicketInput.value =
                        data.ticket;

                }


                const trackingSection =
                    document.getElementById(
                        "seguimiento"
                    );


                if (
                    trackingSection
                ) {

                    trackingSection.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start"
                    });

                }


                loadTrackingTicket(
                    data.ticket
                );

            }
        );

    }


    /* ========================================================
       WHATSAPP
    ======================================================== */

    if (whatsappButton) {

        const message =

            `Hola ${SHOP_DATA.name}, ` +

            `acabo de generar el ticket ` +

            `${data.ticket} para enviar mi ` +

            `marcadora por ${data.carrier}. ` +

            `Equipo: ${data.brand} ${data.model}.`;


        whatsappButton.href =

            "https://wa.me/" +

            SHOP_DATA.whatsapp +

            "?text=" +

            encodeURIComponent(
                message
            );

    }

}


/* ============================================================
   RENDERIZAR SEGUIMIENTO
============================================================ */

function renderTrackingTicket(
    ticket
) {

    if (!trackingStatus) {

        return;

    }


    const history =
        Array.isArray(
            ticket.history
        )
            ? ticket.history
            : [];


    const quoteItems =
        Array.isArray(
            ticket.quoteItems
        )
            ? ticket.quoteItems
            : [];


    /* ========================================================
       PRESUPUESTO
    ======================================================== */

    const quoteRows =
        quoteItems.length

            ? quoteItems
                .map(
                    item => `

                        <div class="tracking-quote-row">

                            <span>
                                ${escapeHTML(
                                    item.concept
                                )}
                            </span>

                            <strong>
                                $${formatMoney(
                                    item.price
                                )}
                            </strong>

                        </div>

                    `
                )
                .join("")

            : `

                <div class="tracking-empty">

                    El presupuesto todavía
                    no ha sido generado.

                </div>

            `;


    /* ========================================================
       HISTORIAL
    ======================================================== */

    const historyRows =
        history.length

            ? [...history]
                .reverse()
                .map(
                    item => `

                        <div class="tracking-history-item">

                            <span
                                class="tracking-history-dot"
                            ></span>

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        item.status
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        item.date
                                    )}
                                </small>

                                ${
                                    item.note
                                        ? `
                                            <p>
                                                ${escapeHTML(
                                                    item.note
                                                )}
                                            </p>
                                        `
                                        : ""
                                }

                            </div>

                        </div>

                    `
                )
                .join("")

            : `

                <div class="tracking-empty">

                    Sin movimientos registrados.

                </div>

            `;


    /* ========================================================
       AUTORIZACIÓN
    ======================================================== */

    const authorizationPending =

        ticket.authorization &&

        ticket.authorization.status ===
        "pending";


    /* ========================================================
       PAGO
    ======================================================== */

    const paymentPending =

        ticket.payment &&

        ticket.payment.status ===
        "pending" &&

        ticket.payment.link;


    let actionHtml =
        "";


    if (
        authorizationPending
    ) {

        actionHtml = `

            <div class="tracking-actions">

                <button
                    type="button"
                    class="primary-button"
                    id="authorize-service"
                >
                    AUTORIZAR SERVICIO
                </button>


                <button
                    type="button"
                    class="secondary-button tracking-danger"
                    id="decline-service"
                >
                    NO DESEO CONTINUAR
                </button>

            </div>

        `;

    }

    else if (
        paymentPending
    ) {

        actionHtml = `

            <div class="tracking-actions">

                <a
                    class="primary-button"
                    href="${escapeHTML(
                        ticket.payment.link
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    REALIZAR PAGO
                </a>

            </div>

        `;

    }


    /* ========================================================
       HTML DEL RESULTADO
    ======================================================== */

    trackingStatus.innerHTML = `

        <article class="tracking-result">


            <div class="tracking-result-head">

                <div>

                    <span class="tracking-label">
                        TICKET
                    </span>

                    <strong
                        class="tracking-number"
                    >
                        ${escapeHTML(
                            ticket.ticket
                        )}
                    </strong>

                </div>


                <div class="tracking-current-status">

                    <span>
                        ESTADO ACTUAL
                    </span>

                    <strong>
                        ${escapeHTML(
                            ticket.status
                        )}
                    </strong>

                </div>

            </div>


            <div class="tracking-equipment">


                <div>

                    <span>
                        EQUIPO
                    </span>

                    <strong>
                        ${escapeHTML(
                            ticket.brand
                        )}
                        ${escapeHTML(
                            ticket.model
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        SERVICIO SOLICITADO
                    </span>

                    <strong>
                        ${escapeHTML(
                            ticket.service
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        CLIENTE
                    </span>

                    <strong>
                        ${escapeHTML(
                            ticket.name
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        FECHA DE RECEPCIÓN
                    </span>

                    <strong>
                        ${escapeHTML(
                            ticket.date
                        )}
                    </strong>

                </div>


            </div>


            <div class="tracking-grid">


                <section
                    class="tracking-card tracking-diagnosis"
                >

                    <span
                        class="tracking-card-kicker"
                    >
                        DIAGNÓSTICO TÉCNICO
                    </span>


                    <p>

                        ${
                            ticket.diagnosis

                                ? escapeHTML(
                                    ticket.diagnosis
                                )

                                : `
                                    El diagnóstico estará
                                    disponible una vez
                                    finalice la revisión
                                    técnica.
                                `
                        }

                    </p>

                </section>


                <section
                    class="tracking-card"
                >

                    <span
                        class="tracking-card-kicker"
                    >
                        PRESUPUESTO
                    </span>


                    <div
                        class="tracking-quote"
                    >

                        ${quoteRows}


                        <div
                            class="tracking-quote-total"
                        >

                            <span>
                                TOTAL SERVICIO
                            </span>

                            <strong>
                                $${formatMoney(
                                    ticket.quoteTotal
                                )}
                            </strong>

                        </div>

                    </div>


                    ${
                        ticket.diagnosticPrice

                            ? `

                                <p
                                    class="tracking-note"
                                >

                                    Valor de diagnóstico
                                    registrado:
                                    $${formatMoney(
                                        ticket.diagnosticPrice
                                    )}.

                                </p>

                            `

                            : ""
                    }

                </section>


            </div>


            ${actionHtml}


            <section
                class="tracking-card tracking-history"
            >

                <span
                    class="tracking-card-kicker"
                >
                    HISTORIAL DEL SERVICIO
                </span>


                <div
                    class="tracking-history-list"
                >

                    ${historyRows}

                </div>

            </section>


            <div
                class="tracking-result-footer"
            >

                <span>
                    ¿Necesitas ayuda?
                </span>


                <a
                    href="https://wa.me/${SHOP_DATA.whatsapp}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    CONTACTAR POR WHATSAPP
                </a>

            </div>


        </article>

    `;


    /* ========================================================
       BOTONES
    ======================================================== */

    const authorizeButton =
        document.getElementById(
            "authorize-service"
        );


    const declineButton =
        document.getElementById(
            "decline-service"
        );


    if (
        authorizeButton
    ) {

        authorizeButton.addEventListener(
            "click",
            () => {

                updateTicketDecision(
                    ticket.ticket,
                    "authorize"
                );

            }
        );

    }


    if (
        declineButton
    ) {

        declineButton.addEventListener(
            "click",
            () => {

                updateTicketDecision(
                    ticket.ticket,
                    "decline"
                );

            }
        );

    }

}


/* ============================================================
   AUTORIZAR / RECHAZAR SERVICIO
============================================================ */

async function updateTicketDecision(
    ticketNumber,
    action
) {

    const normalizedTicket =
        normalizeTicket(
            ticketNumber
        );


    if (!normalizedTicket) {

        return;

    }


    const endpoint =

        action === "authorize"

            ? `/api/tickets/${encodeURIComponent(
                normalizedTicket
            )}/authorize`

            : `/api/tickets/${encodeURIComponent(
                normalizedTicket
            )}/decline`;


    const confirmation =

        action === "authorize"

            ? "¿Confirmas que autorizas el servicio y el presupuesto mostrado?"

            : "¿Confirmas que no deseas continuar con el servicio?";


    if (
        !window.confirm(
            confirmation
        )
    ) {

        return;

    }


    if (
        trackingStatus
    ) {

        trackingStatus.insertAdjacentHTML(

            "afterbegin",

            `

                <div class="tracking-loading">

                    ACTUALIZANDO SERVICIO...

                </div>

            `

        );

    }


    try {

        const response =
            await fetch(
                endpoint,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    }

                }
            );


        let result;


        try {

            result =
                await response.json();

        }

        catch {

            throw new Error(
                "El servidor devolvió una respuesta inválida."
            );

        }


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(

                result.message ||

                "No fue posible actualizar el servicio."

            );

        }


        await loadTrackingTicket(
            normalizedTicket
        );


    }

    catch (
        error
    ) {

        console.error(
            "Error actualizando ticket:",
            error
        );


        if (
            trackingStatus
        ) {

            trackingStatus.insertAdjacentHTML(

                "afterbegin",

                `

                    <div
                        class="tracking-error"
                    >

                        ${escapeHTML(
                            error.message
                        )}

                    </div>

                `

            );

        }

    }

}


/* ============================================================
   CONSULTAR TICKET
============================================================ */

async function loadTrackingTicket(
    value
) {

    const ticketNumber =
        normalizeTicket(
            value
        );


    if (!ticketNumber) {

        if (
            trackingStatus
        ) {

            trackingStatus.innerHTML = `

                <div
                    class="tracking-error"
                >

                    <strong>
                        INGRESA UN NÚMERO DE TICKET
                    </strong>

                </div>

            `;

        }

        return;

    }


    if (
        trackingStatus
    ) {

        trackingStatus.innerHTML = `

            <div
                class="tracking-loading"
            >

                CONSULTANDO TICKET
                ${escapeHTML(
                    ticketNumber
                )}...

            </div>

        `;

    }


    try {

        const response =
            await fetch(

                `/api/tickets/${encodeURIComponent(
                    ticketNumber
                )}`,

                {

                    method:
                        "GET",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }

            );


        let result;


        try {

            result =
                await response.json();

        }

        catch {

            throw new Error(
                "El servidor devolvió una respuesta inválida."
            );

        }


        if (
            !response.ok ||
            !result.success ||
            !result.ticket
        ) {

            throw new Error(

                result.message ||

                "No encontramos ese número de ticket."

            );

        }


        renderTrackingTicket(
            result.ticket
        );


        if (
            window.history &&
            window.history.replaceState
        ) {

            window.history.replaceState(

                null,

                "",

                `#seguimiento-${encodeURIComponent(
                    ticketNumber
                )}`

            );

        }


    }

    catch (
        error
    ) {

        console.error(
            "Error consultando ticket:",
            error
        );


        if (
            trackingStatus
        ) {

            trackingStatus.innerHTML = `

                <div
                    class="tracking-error"
                >

                    <strong>
                        NO FUE POSIBLE CONSULTAR EL TICKET
                    </strong>

                    <span>
                        ${escapeHTML(
                            error.message
                        )}
                    </span>

                </div>

            `;

        }

    }

}


/* ============================================================
   FORMULARIO DE SEGUIMIENTO
============================================================ */

if (
    trackingForm
) {

    trackingForm.addEventListener(

        "submit",

        function (event) {

            event.preventDefault();


            loadTrackingTicket(

                trackingTicketInput

                    ? trackingTicketInput.value

                    : ""

            );

        }

    );

}


/* ============================================================
   LEER TICKET DESDE URL
============================================================ */

function loadTicketFromHash() {

    const hash =
        window.location.hash;


    if (
        !hash
    ) {

        return;

    }


    if (
        hash.startsWith(
            "#seguimiento-"
        )
    ) {

        const ticket =
            decodeURIComponent(
                hash.substring(
                    "#seguimiento-".length
                )
            );


        if (
            trackingTicketInput
        ) {

            trackingTicketInput.value =
                ticket;

        }


        setTimeout(
            () => {

                loadTrackingTicket(
                    ticket
                );

            },
            300
        );

    }

}


window.addEventListener(
    "hashchange",
    loadTicketFromHash
);


loadTicketFromHash();


/* ============================================================
   FORMULARIO DE RECEPCIÓN
============================================================ */

if (
    ticketForm
) {

    ticketForm.addEventListener(

        "submit",

        async function (event) {

            event.preventDefault();


            /* ================================================
               BOTÓN
            ================================================ */

            const submitButton =
                ticketForm.querySelector(
                    ".ticket-submit"
                );


            const originalText =
                submitButton
                    ? submitButton.textContent
                    : "GENERAR TICKET";


            if (
                submitButton
            ) {

                submitButton.disabled =
                    true;


                submitButton.textContent =
                    "GENERANDO TICKET...";

            }


            if (
                ticketStatus
            ) {

                ticketStatus.innerHTML = `

                    <div
                        class="ticket-loading"
                    >

                        PROCESANDO SOLICITUD...

                    </div>

                `;

            }


            /* ================================================
               DATOS
            ================================================ */

            const data = {

                name:
                    getElementValue(
                        "client-name"
                    ),


                phone:
                    getElementValue(
                        "client-phone"
                    ),


                whatsapp:
                    getElementValue(
                        "client-whatsapp"
                    ),


                email:
                    getElementValue(
                        "client-email"
                    ),


                address:
                    getElementValue(
                        "return-address"
                    ),


                city:
                    getElementValue(
                        "return-city"
                    ),


                neighborhood:
                    getElementValue(
                        "return-neighborhood"
                    ),


                brand:
                    getElementValue(
                        "equipment-brand"
                    ),


                model:
                    getElementValue(
                        "equipment-model"
                    ),


                service:
                    getElementValue(
                        "service-type"
                    ),


                carrier:
                    getElementValue(
                        "carrier"
                    ),


                description:
                    getElementValue(
                        "equipment-description"
                    )

            };


            /* ================================================
               VALIDACIÓN FRONTEND
            ================================================ */

            const requiredFields = [

                [
                    "Nombre del cliente",
                    data.name
                ],

                [
                    "Teléfono",
                    data.phone
                ],

                [
                    "WhatsApp",
                    data.whatsapp
                ],

                [
                    "Marca",
                    data.brand
                ],

                [
                    "Modelo",
                    data.model
                ],

                [
                    "Servicio",
                    data.service
                ],

                [
                    "Transportadora",
                    data.carrier
                ],

                [
                    "Descripción",
                    data.description
                ]

            ];


            const missingFields =
                requiredFields
                    .filter(
                        field =>
                            !field[1]
                    )
                    .map(
                        field =>
                            field[0]
                    );


            if (
                missingFields.length
            ) {

                const message =

                    "Completa los siguientes campos: " +

                    missingFields.join(
                        ", "
                    );


                if (
                    ticketStatus
                ) {

                    ticketStatus.innerHTML = `

                        <div
                            class="ticket-error-message"
                        >

                            ✕ DATOS INCOMPLETOS

                            <br><br>

                            ${escapeHTML(
                                message
                            )}

                        </div>

                    `;

                }


                if (
                    submitButton
                ) {

                    submitButton.disabled =
                        false;


                    submitButton.textContent =
                        originalText;

                }


                return;

            }


            /* ================================================
               ENVIAR AL SERVIDOR
            ================================================ */

            try {

                const response =
                    await fetch(

                        "/api/tickets",

                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    data
                                )

                        }

                    );


                let result;


                try {

                    result =
                        await response.json();

                }

                catch {

                    throw new Error(
                        "El servidor devolvió una respuesta inválida."
                    );

                }


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(

                        result.message ||

                        "No fue posible generar el ticket."

                    );

                }


                /* ============================================
                   RESPUESTA SERVIDOR
                ============================================ */

                data.ticket =
                    result.ticket;


                data.date =
                    result.date ||
                    new Date()
                        .toLocaleString(
                            "es-CO"
                        );


                /* ============================================
                   MOSTRAR TICKET
                ============================================ */

                showGeneratedTicket(
                    data
                );


                console.log(
                    "✓ TICKET GENERADO:",
                    data
                );


                /* ============================================
                   MENSAJE ÉXITO
                ============================================ */

                if (
                    ticketStatus
                ) {

                    ticketStatus.insertAdjacentHTML(

                        "afterbegin",

                        `

                            <div
                                class="ticket-success-message"
                            >

                                ✓ TICKET GENERADO CORRECTAMENTE

                                <br>

                                <strong>
                                    ${escapeHTML(
                                        data.ticket
                                    )}
                                </strong>

                                <br>

                                <small>

                                    Confirmación enviada
                                    por correo electrónico.

                                </small>

                            </div>

                        `

                    );

                }


            }

            catch (
                error
            ) {

                console.error(
                    "ERROR GENERANDO TICKET:",
                    error
                );


                if (
                    ticketStatus
                ) {

                    ticketStatus.innerHTML = `

                        <div
                            class="ticket-error-message"
                        >

                            ✕ NO FUE POSIBLE
                            GENERAR EL TICKET

                            <br><br>

                            ${escapeHTML(
                                error.message
                            )}

                            <br><br>

                            Verifica que el servidor
                            esté ejecutándose.

                        </div>

                    `;

                }

            }


            finally {

                if (
                    submitButton
                ) {

                    submitButton.disabled =
                        false;


                    submitButton.textContent =
                        originalText;

                }

            }

        }

    );

}


/* ============================================================
   SISTEMA ONLINE
============================================================ */

console.log(
    "JFRII TACTICAL TECH — TICKET SYSTEM ONLINE"
);

console.log(
    "JFRII TACTICAL TECH — FRONTEND READY"
);