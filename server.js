const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = 3000;

require("dotenv").config();



/* ============================================================
   JFRII THACTICAL TECH
   SISTEMA COMPLETO DE TICKETS
============================================================ */


/* ============================================================
   CONFIGURACIÓN DEL NEGOCIO
============================================================ */

const SHOP_DATA = {

    name:
        "JFRII THACTICAL TECH",

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
        "573247325473",

    /*
        PON AQUÍ TU LINK DE BRE-B

        Ejemplo:

        breb:
            "https://..."

        Si todavía no lo tienes,
        déjalo vacío.
    */

    breb:
        "",

    /*
        Costo base del diagnóstico.

        Puedes cambiarlo cuando quieras.
    */

    diagnosticPrice:
        30000

};


/* ============================================================
   CONFIGURACIÓN DEL CORREO
============================================================ */

/*
    RECOMENDACIÓN:

    NO uses tu contraseña normal de Gmail.

    Utiliza una contraseña de aplicación.

    También puedes colocar estas variables
    directamente en el código.

    IMPORTANTE:
    La contraseña que compartiste anteriormente
    debe ser REVOCADA y reemplazada.
*/

const EMAIL_USER =
    process.env.EMAIL_USER ||
    "jfriitacticaltech@gmail.com";

const EMAIL_PASSWORD =
    process.env.EMAIL_PASSWORD ||
    "";


/* ============================================================
   CONFIGURACIÓN ADMIN
============================================================ */

/*
    Esta contraseña protege las operaciones
    administrativas.

    CAMBIALA.
*/

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD ||
    "JFRII_ADMIN_2026";


/* ============================================================
   CONFIGURACIÓN WHATSAPP
============================================================ */

/*
    MODO ACTUAL:

    El sistema genera enlaces wa.me.

    Para envío automático real:

    WhatsApp Cloud API
    o
    Twilio WhatsApp API.

    Estas variables quedan preparadas.
*/

const WHATSAPP_MODE =
    process.env.WHATSAPP_MODE ||
    "LINK";


const WHATSAPP_TOKEN =
    process.env.WHATSAPP_TOKEN ||
    "";


const WHATSAPP_PHONE_ID =
    process.env.WHATSAPP_PHONE_ID ||
    "";


/* ============================================================
   MIDDLEWARE
============================================================ */

app.use(
    express.json({
        limit: "2mb"
    })
);


app.use(
    express.urlencoded({
        extended: true,
        limit: "2mb"
    })
);


app.use(
    express.static(
        path.join(__dirname)
    )
);


/* ============================================================
   ARCHIVOS DE DATOS
============================================================ */

const COUNTER_FILE =
    path.join(
        __dirname,
        "ticket-counter.json"
    );


const TICKETS_FILE =
    path.join(
        __dirname,
        "tickets.json"
    );


/* ============================================================
   CREAR ARCHIVOS SI NO EXISTEN
============================================================ */

function ensureDataFiles() {

    if (
        !fs.existsSync(
            COUNTER_FILE
        )
    ) {

        fs.writeFileSync(

            COUNTER_FILE,

            JSON.stringify(
                {
                    counter: 0
                },
                null,
                2
            )

        );

    }


    if (
        !fs.existsSync(
            TICKETS_FILE
        )
    ) {

        fs.writeFileSync(

            TICKETS_FILE,

            JSON.stringify(
                [],
                null,
                2
            )

        );

    }

}


ensureDataFiles();


/* ============================================================
   LEER TICKETS
============================================================ */

function readTickets() {

    try {

        const data =
            fs.readFileSync(
                TICKETS_FILE,
                "utf8"
            );


        const tickets =
            JSON.parse(
                data
            );


        if (
            Array.isArray(
                tickets
            )
        ) {

            return tickets;

        }


        return [];

    }

    catch (error) {

        console.error(
            "ERROR LEYENDO TICKETS:",
            error.message
        );

        return [];

    }

}


/* ============================================================
   GUARDAR TICKETS
============================================================ */

function saveTickets(
    tickets
) {

    fs.writeFileSync(

        TICKETS_FILE,

        JSON.stringify(
            tickets,
            null,
            2
        )

    );

}


/* ============================================================
   SIGUIENTE TICKET
============================================================ */

function getNextTicketNumber() {

    let counter = 0;


    try {

        if (
            fs.existsSync(
                COUNTER_FILE
            )
        ) {

            const data =
                JSON.parse(

                    fs.readFileSync(
                        COUNTER_FILE,
                        "utf8"
                    )

                );


            counter =
                Number(
                    data.counter
                ) || 0;

        }

    }

    catch (error) {

        console.error(
            "ERROR LEYENDO CONTADOR:",
            error.message
        );

    }


    const current =
        counter;


    const next =
        counter + 1;


    fs.writeFileSync(

        COUNTER_FILE,

        JSON.stringify(
            {
                counter:
                    next
            },
            null,
            2
        )

    );


    return current;

}


/* ============================================================
   FORMATO TICKET
============================================================ */

function formatTicketNumber(
    number
) {

    return (

        "JFR-" +

        String(
            number
        ).padStart(
            5,
            "0"
        )

    );

}


/* ============================================================
   LIMPIAR TEXTO
============================================================ */

function cleanText(
    value
) {

    return String(
        value || ""
    ).trim();

}


/* ============================================================
   ESCAPAR HTML
============================================================ */

function escapeHTML(
    value
) {

    return cleanText(
        value
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
   VALIDAR TRANSPORTADORA
============================================================ */

function validateCarrier(
    carrier
) {

    const allowed = [

        "Servientrega",

        "Coordinadora",

        "Interrapidísimo"

    ];


    return allowed.includes(
        carrier
    );

}


/* ============================================================
   NORMALIZAR WHATSAPP
============================================================ */

function normalizeWhatsapp(
    number
) {

    let value =
        cleanText(
            number
        );


    value =
        value.replace(
            /\D/g,
            ""
        );


    /*
        Colombia:

        3001234567

        se convierte en:

        573001234567
    */

    if (
        value.length === 10 &&
        value.startsWith("3")
    ) {

        value =
            "57" +
            value;

    }


    return value;

}


/* ============================================================
   ESTADOS
============================================================ */

const TICKET_STATES = {

    RECEIVED:
        "Equipo recibido",

    DIAGNOSIS:
        "En diagnóstico",

    QUOTE_PENDING:
        "Presupuesto pendiente",

    AWAITING_AUTHORIZATION:
        "Esperando autorización",

    AUTHORIZED:
        "Servicio autorizado",

    REPAIR:
        "En reparación",

    PAYMENT_PENDING:
        "Pago pendiente",

    READY:
        "Listo para despacho",

    SHIPPING:
        "Enviado",

    COMPLETED:
        "Servicio finalizado",

    DECLINED:
        "Cliente no autoriza",

    RETURNING:
        "Retorno del equipo",

    CANCELLED:
        "Servicio cancelado"

};


/* ============================================================
   CORREO
============================================================ */

let transporter =
    null;


if (
    EMAIL_USER &&
    EMAIL_PASSWORD
) {

    transporter =
        nodemailer.createTransport({

            service:
                "gmail",

            auth: {

                user:
                    EMAIL_USER,

                pass:
                    EMAIL_PASSWORD

            }

        });


    transporter.verify(

        function (
            error
        ) {

            if (error) {

                console.error(
                    "ERROR DE CORREO:",
                    error.message
                );

            }

            else {

                console.log(
                    "✓ SERVICIO DE CORREO CONECTADO"
                );

            }

        }

    );

}

else {

    console.log(
        "⚠ CORREO NO CONFIGURADO"
    );

}


/* ============================================================
   ENVÍO DE CORREO
============================================================ */

async function sendEmail(
    mailOptions
) {

    if (!transporter) {

        console.log(
            "⚠ Correo omitido: SMTP no configurado."
        );

        return false;

    }


    try {

        await transporter.sendMail(
            mailOptions
        );

        return true;

    }

    catch (error) {

        console.error(
            "ERROR ENVIANDO CORREO:",
            error.message
        );

        return false;

    }

}


/* ============================================================
   CREAR LINK WHATSAPP
============================================================ */

function createWhatsAppLink(
    phone,
    message
) {

    const normalized =
        normalizeWhatsapp(
            phone
        );


    return (

        "https://wa.me/" +

        normalized +

        "?text=" +

        encodeURIComponent(
            message
        )

    );

}


/* ============================================================
   MENSAJE DE ESTADO
============================================================ */

function buildStatusMessage(
    ticket
) {

    let message =

        `Hola ${ticket.name}. ` +

        `Somos ${SHOP_DATA.name}.%0A%0A`;


    message =

        `Hola ${ticket.name}. ` +
        `Somos ${SHOP_DATA.name}.\n\n` +

        `🎫 Ticket: ${ticket.ticket}\n` +

        `📦 Equipo: ${ticket.brand} ${ticket.model}\n\n` +

        `📌 Estado actual:\n` +

        `${ticket.status}\n\n`;


    if (
        ticket.status ===
        TICKET_STATES.AWAITING_AUTHORIZATION
    ) {

        message +=

            `⚠️ Necesitamos tu autorización ` +
            `para continuar con el servicio.\n\n` +

            `💰 Total presupuesto: ` +

            `$${formatMoney(ticket.quoteTotal)}\n\n` +

            `Consulta tu ticket para autorizar ` +
            `o indicar que no deseas continuar.\n`;

    }


    else if (
        ticket.status ===
        TICKET_STATES.PAYMENT_PENDING
    ) {

        message +=

            `💳 El servicio está pendiente ` +
            `de pago.\n\n` +

            `Valor: $${formatMoney(ticket.quoteTotal)}\n\n` +

            `Puedes realizar el pago mediante ` +
            `Bre-B desde el enlace indicado ` +
            `en tu ticket.\n`;

    }


    else {

        message +=

            `Puedes consultar el detalle ` +
            `y seguimiento de tu servicio ` +
            `desde la página de consulta de tickets.\n`;

    }


    return message;

}


/* ============================================================
   FORMATO DINERO
============================================================ */

function formatMoney(
    value
) {

    const number =
        Number(
            value
        ) || 0;


    return number.toLocaleString(
        "es-CO"
    );

}


/* ============================================================
   NOTIFICAR WHATSAPP
============================================================ */

async function notifyWhatsApp(
    ticket
) {

    const phone =
        normalizeWhatsapp(
            ticket.whatsapp
        );


    if (!phone) {

        return {

            success:
                false,

            mode:
                "none"

        };

    }


    const message =
        buildStatusMessage(
            ticket
        );


    /*
        MODO LINK

        No envía automáticamente.

        Genera un enlace preparado.
    */

    if (
        WHATSAPP_MODE ===
        "LINK"
    ) {

        return {

            success:
                true,

            mode:
                "link",

            link:
                createWhatsAppLink(
                    phone,
                    message
                )

        };

    }


    /*
        MODO API

        Aquí se deja preparado
        para WhatsApp Cloud API.

        Requiere configurar:

        WHATSAPP_TOKEN
        WHATSAPP_PHONE_ID
    */

    if (
        WHATSAPP_MODE ===
        "CLOUD_API"
    ) {

        if (
            !WHATSAPP_TOKEN ||
            !WHATSAPP_PHONE_ID
        ) {

            return {

                success:
                    false,

                mode:
                    "cloud_api",

                error:
                    "WhatsApp Cloud API no configurada."

            };

        }


        /*
            Para utilizar la API oficial
            necesitamos realizar la llamada
            HTTP correspondiente.

            Si no está configurada,
            no se realiza ningún envío.
        */

        return {

            success:
                false,

            mode:
                "cloud_api",

            error:
                "Configura WhatsApp Cloud API antes de activar este modo."

        };

    }


    return {

        success:
            false,

        mode:
            "unknown"

    };

}


/* ============================================================
   PLANTILLA DE CORREO DEL TICKET
============================================================ */

function buildTicketEmail(
    ticket
) {

    return `

<!DOCTYPE html>

<html lang="es">

<head>

<meta charset="UTF-8">

<style>

body {

    margin: 0;

    padding: 0;

    background: #111;

    font-family:
        Arial,
        Helvetica,
        sans-serif;

}

.container {

    max-width: 700px;

    margin: 30px auto;

    background: #ffffff;

    border-radius: 10px;

    overflow: hidden;

}

.header {

    background: #160b10;

    color: #ffffff;

    padding: 30px;

    border-bottom:
        4px solid #a62950;

}

.brand {

    font-size: 24px;

    font-weight: bold;

}

.subtitle {

    margin-top: 8px;

    color: #d7a6b7;

}

.ticket {

    display: inline-block;

    margin-top: 20px;

    padding: 10px 18px;

    background: #a62950;

    color: #ffffff;

    border-radius: 5px;

    font-size: 20px;

    font-weight: bold;

}

.content {

    padding: 30px;

}

.section {

    margin-bottom: 25px;

    border:
        1px solid #ddd;

    border-radius: 7px;

    overflow: hidden;

}

.section-title {

    background: #f4f4f4;

    padding: 12px 15px;

    font-weight: bold;

    color: #8c2044;

}

.row {

    padding: 10px 15px;

    border-top:
        1px solid #eee;

}

.destination {

    background: #fff4f7;

    border-left:
        5px solid #a62950;

    padding: 20px;

}

.footer {

    background: #160b10;

    color: #bbb;

    padding: 20px 30px;

    font-size: 12px;

}

</style>

</head>

<body>

<div class="container">

<div class="header">

<div class="brand">

${escapeHTML(
    SHOP_DATA.name
)}

</div>

<div class="subtitle">

${escapeHTML(
    SHOP_DATA.service
)}

</div>

<div class="ticket">

TICKET ${escapeHTML(
    ticket.ticket
)}

</div>

</div>

<div class="content">

<div class="section">

<div class="section-title">

DATOS DEL CLIENTE

</div>

<div class="row">

<strong>
Nombre:
</strong>

${escapeHTML(
    ticket.name
)}

</div>

<div class="row">

<strong>
Teléfono:
</strong>

${escapeHTML(
    ticket.phone
)}

</div>

<div class="row">

<strong>
WhatsApp:
</strong>

${escapeHTML(
    ticket.whatsapp
)}

</div>

<div class="row">

<strong>
Correo:
</strong>

${escapeHTML(
    ticket.email
)}

</div>

</div>


<div class="section">

<div class="section-title">

EQUIPO

</div>

<div class="row">

<strong>
Marca:
</strong>

${escapeHTML(
    ticket.brand
)}

</div>

<div class="row">

<strong>
Modelo:
</strong>

${escapeHTML(
    ticket.model
)}

</div>

<div class="row">

<strong>
Servicio solicitado:
</strong>

${escapeHTML(
    ticket.service
)}

</div>

<div class="row">

<strong>
Transportadora:
</strong>

${escapeHTML(
    ticket.carrier
)}

</div>

<div class="row">

<strong>
Descripción:
</strong>

<br><br>

${escapeHTML(
    ticket.description
)}

</div>

</div>


<div class="section">

<div class="section-title">

DIRECCIÓN PARA RETORNO

</div>

<div class="row">

<strong>
Dirección:
</strong>

${escapeHTML(
    ticket.address
)}

</div>

<div class="row">

<strong>
Ciudad:
</strong>

${escapeHTML(
    ticket.city
)}

</div>

<div class="row">

<strong>
Barrio:
</strong>

${escapeHTML(
    ticket.neighborhood ||
    "No indicado"
)}

</div>

</div>


<div class="destination">

<strong>

DESTINO DEL EQUIPO

</strong>

<br><br>

${escapeHTML(
    SHOP_DATA.name
)}

<br>

${escapeHTML(
    SHOP_DATA.city
)}

<br>

${escapeHTML(
    SHOP_DATA.address
)}

<br>

${escapeHTML(
    SHOP_DATA.residential
)}

<br>

Tel.
${escapeHTML(
    SHOP_DATA.phone
)}

</div>


<br>

<strong>
Fecha:
</strong>

${escapeHTML(
    ticket.date
)}

</div>


<div class="footer">

Sistema automático de tickets.

${escapeHTML(
    SHOP_DATA.name
)}

</div>

</div>

</body>

</html>

`;

}


/* ============================================================
   API CREAR TICKET
============================================================ */

app.post(
    "/api/tickets",
    async function (
        req,
        res
    ) {

        try {

            const {

                name,

                phone,

                whatsapp,

                email,

                address,

                city,

                neighborhood,

                brand,

                model,

                service,

                carrier,

                description

            } = req.body;


            /* =================================================
               VALIDACIÓN
            ================================================= */

            if (

                !name ||

                !phone ||

                !whatsapp ||

                !email ||

                !address ||

                !city ||

                !brand ||

                !model ||

                !service ||

                !carrier ||

                !description

            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Todos los campos obligatorios deben estar completos."

                });

            }


            if (
                !validateCarrier(
                    carrier
                )
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Transportadora no válida."

                });

            }


            /* =================================================
               GENERAR TICKET
            ================================================= */

            const number =
                getNextTicketNumber();


            const ticketNumber =
                formatTicketNumber(
                    number
                );


            const date =
                new Date().toLocaleString(
                    "es-CO",
                    {

                        dateStyle:
                            "full",

                        timeStyle:
                            "short"

                    }
                );


            const ticket = {

                ticket:
                    ticketNumber,

                number:
                    number,

                date:
                    date,

                createdAt:
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString(),


                name:
                    cleanText(
                        name
                    ),

                phone:
                    cleanText(
                        phone
                    ),

                whatsapp:
                    cleanText(
                        whatsapp
                    ),

                email:
                    cleanText(
                        email
                    ),


                address:
                    cleanText(
                        address
                    ),

                city:
                    cleanText(
                        city
                    ),

                neighborhood:
                    cleanText(
                        neighborhood
                    ),


                brand:
                    cleanText(
                        brand
                    ),

                model:
                    cleanText(
                        model
                    ),

                service:
                    cleanText(
                        service
                    ),

                carrier:
                    cleanText(
                        carrier
                    ),

                description:
                    cleanText(
                        description
                    ),


                status:
                    TICKET_STATES.RECEIVED,


                diagnosis:
                    "",


                quoteItems:
                    [],


                quoteTotal:
                    0,


                diagnosticPrice:
                    SHOP_DATA.diagnosticPrice,


                authorization:
                    null,


                payment:
                    {

                        status:
                            "pending",

                        link:
                            SHOP_DATA.breb

                    },


                history:
                    [

                        {

                            status:
                                TICKET_STATES.RECEIVED,

                            date:
                                date

                        }

                    ]

            };


            /* =================================================
               GUARDAR
            ================================================= */

            const tickets =
                readTickets();


            tickets.push(
                ticket
            );


            saveTickets(
                tickets
            );


            /* =================================================
               CORREO EMPRESA
            ================================================= */

            const companyEmail = {

                from:
                    `"${SHOP_DATA.name}" <${EMAIL_USER}>`,

                to:
                    SHOP_DATA.email,

                replyTo:
                    ticket.email,

                subject:
                    `🎫 NUEVO TICKET ${ticket.ticket} | ${ticket.brand} ${ticket.model}`,

                html:
                    buildTicketEmail(
                        ticket
                    )

            };


            /* =================================================
               CORREO CLIENTE
            ================================================= */

            const clientEmail = {

                from:
                    `"${SHOP_DATA.name}" <${EMAIL_USER}>`,

                to:
                    ticket.email,

                subject:
                    `🎫 Confirmación ${ticket.ticket} | ${SHOP_DATA.name}`,

                html: `

<div style="
font-family:Arial;
max-width:650px;
margin:auto;
">

<h2>
${escapeHTML(
    SHOP_DATA.name
)}
</h2>

<p>

Hola
<strong>
${escapeHTML(
    ticket.name
)}
</strong>.

</p>

<p>

Hemos recibido correctamente
tu solicitud.

</p>

<div style="
background:#f4f4f4;
padding:20px;
border-left:5px solid #a62950;
">

<h2 style="
color:#a62950;
">

${escapeHTML(
    ticket.ticket
)}

</h2>

<strong>
Estado:
</strong>

${escapeHTML(
    ticket.status
)}

<br><br>

<strong>
Marcadora:
</strong>

${escapeHTML(
    ticket.brand
)}

${escapeHTML(
    ticket.model
)}

<br><br>

<strong>
Servicio solicitado:
</strong>

${escapeHTML(
    ticket.service
)}

</div>

<p>

Guarda tu número:

<strong>
${escapeHTML(
    ticket.ticket
)}
</strong>

</p>

<p>

Este número será utilizado
para consultar el proceso
de tu equipo.

</p>

<p>

Cuando cambie el estado
del servicio recibirás
una notificación.

</p>

<p>

Gracias por confiar en
${escapeHTML(
    SHOP_DATA.name
)}.

</p>

</div>

`

            };


            await sendEmail(
                companyEmail
            );


            await sendEmail(
                clientEmail
            );


            /* =================================================
               WHATSAPP
            ================================================= */

            const whatsappResult =
                await notifyWhatsApp(
                    ticket
                );


            /* =================================================
               RESPUESTA
            ================================================= */

            return res.json({

                success:
                    true,

                ticket:
                    ticket.ticket,

                date:
                    ticket.date,

                status:
                    ticket.status,

                whatsapp:
                    whatsappResult,

                message:
                    "Ticket creado correctamente."

            });

        }

        catch (error) {

            console.error(
                "ERROR CREANDO TICKET:",
                error
            );


            return res.status(
                500
            ).json({

                success:
                    false,

                message:
                    "No fue posible crear el ticket.",

                error:
                    error.message

            });

        }

    }

);


/* ============================================================
   CONSULTAR TICKET
============================================================ */

app.get(
    "/api/tickets/:ticket",
    function (
        req,
        res
    ) {

        const requested =
            cleanText(
                req.params.ticket
            ).toUpperCase();


        const tickets =
            readTickets();


        const ticket =
            tickets.find(

                item =>
                    item.ticket.toUpperCase() ===
                    requested

            );


        if (!ticket) {

            return res.status(
                404
            ).json({

                success:
                    false,

                message:
                    "No encontramos ese número de ticket."

            });

        }


        /*
            Para el cliente no enviamos
            información administrativa
            innecesaria.
        */

        return res.json({

            success:
                true,

            ticket: {

                ticket:
                    ticket.ticket,

                date:
                    ticket.date,

                status:
                    ticket.status,

                name:
                    ticket.name,

                brand:
                    ticket.brand,

                model:
                    ticket.model,

                service:
                    ticket.service,

                diagnosis:
                    ticket.diagnosis,

                quoteItems:
                    ticket.quoteItems,

                quoteTotal:
                    ticket.quoteTotal,

                diagnosticPrice:
                    ticket.diagnosticPrice,

                authorization:
                    ticket.authorization,

                payment:
                    ticket.payment,

                history:
                    ticket.history

            }

        });

    }

);


/* ============================================================
   AUTENTICAR ADMIN
============================================================ */

function isAdmin(
    req
) {

    const password =
        req.headers[
            "x-admin-password"
        ];


    return (
        password ===
        ADMIN_PASSWORD
    );

}


/* ============================================================
   OBTENER TODOS LOS TICKETS - ADMIN
============================================================ */

app.get(
    "/api/admin/tickets",
    function (
        req,
        res
    ) {

        if (
            !isAdmin(
                req
            )
        ) {

            return res.status(
                401
            ).json({

                success:
                    false,

                message:
                    "No autorizado."

            });

        }


        return res.json({

            success:
                true,

            tickets:
                readTickets()

        });

    }

);


/* ============================================================
   OBTENER UN TICKET ADMIN
============================================================ */

app.get(
    "/api/admin/tickets/:ticket",
    function (
        req,
        res
    ) {

        if (
            !isAdmin(
                req
            )
        ) {

            return res.status(
                401
            ).json({

                success:
                    false,

                message:
                    "No autorizado."

            });

        }


        const requested =
            cleanText(
                req.params.ticket
            ).toUpperCase();


        const ticket =
            readTickets().find(

                item =>
                    item.ticket.toUpperCase() ===
                    requested

            );


        if (!ticket) {

            return res.status(
                404
            ).json({

                success:
                    false,

                message:
                    "Ticket no encontrado."

            });

        }


        return res.json({

            success:
                true,

            ticket:
                ticket

        });

    }

);


/* ============================================================
   ACTUALIZAR ESTADO
============================================================ */

app.put(
    "/api/admin/tickets/:ticket/status",
    async function (
        req,
        res
    ) {

        try {

            if (
                !isAdmin(
                    req
                )
            ) {

                return res.status(
                    401
                ).json({

                    success:
                        false,

                    message:
                        "No autorizado."

                });

            }


            const requested =
                cleanText(
                    req.params.ticket
                ).toUpperCase();


            const newStatus =
                cleanText(
                    req.body.status
                );


            if (
                !Object.values(
                    TICKET_STATES
                ).includes(
                    newStatus
                )
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Estado no válido."

                });

            }


            const tickets =
                readTickets();


            const ticket =
                tickets.find(

                    item =>
                        item.ticket.toUpperCase() ===
                        requested

                );


            if (!ticket) {

                return res.status(
                    404
                ).json({

                    success:
                        false,

                    message:
                        "Ticket no encontrado."

                });

            }


            const previousStatus =
                ticket.status;


            ticket.status =
                newStatus;


            ticket.updatedAt =
                new Date().toISOString();


            ticket.history.push({

                status:
                    newStatus,

                previousStatus:
                    previousStatus,

                date:
                    new Date().toLocaleString(
                        "es-CO"
                    )

            });


            saveTickets(
                tickets
            );


            /* =================================================
               CORREO
            ================================================= */

            await sendEmail({

                from:
                    `"${SHOP_DATA.name}" <${EMAIL_USER}>`,

                to:
                    ticket.email,

                subject:
                    `🔔 Actualización ${ticket.ticket} | ${newStatus}`,

                html: `

<div style="
font-family:Arial;
max-width:650px;
margin:auto;
">

<h2>
${escapeHTML(
    SHOP_DATA.name
)}
</h2>

<h3>
Actualización de tu servicio
</h3>

<p>

Ticket:

<strong>
${escapeHTML(
    ticket.ticket
)}
</strong>

</p>

<div style="
background:#f4f4f4;
padding:20px;
border-left:5px solid #a62950;
">

<strong>
Nuevo estado:
</strong>

<br>

<span style="
font-size:20px;
color:#a62950;
">

${escapeHTML(
    newStatus
)}

</span>

</div>

<p>

Puedes consultar el detalle
actualizado de tu ticket
desde la página de seguimiento.

</p>

</div>

`

            });


            /* =================================================
               WHATSAPP
            ================================================= */

            const whatsapp =
                await notifyWhatsApp(
                    ticket
                );


            return res.json({

                success:
                    true,

                ticket:
                    ticket.ticket,

                status:
                    ticket.status,

                whatsapp:
                    whatsapp,

                message:
                    "Estado actualizado."

            });

        }

        catch (error) {

            console.error(
                "ERROR ACTUALIZANDO ESTADO:",
                error
            );


            return res.status(
                500
            ).json({

                success:
                    false,

                message:
                    error.message

            });

        }

    }

);


/* ============================================================
   ACTUALIZAR DIAGNÓSTICO
============================================================ */

app.put(
    "/api/admin/tickets/:ticket/diagnosis",
    async function (
        req,
        res
    ) {

        try {

            if (
                !isAdmin(
                    req
                )
            ) {

                return res.status(
                    401
                ).json({

                    success:
                        false,

                    message:
                        "No autorizado."

                });

            }


            const requested =
                cleanText(
                    req.params.ticket
                ).toUpperCase();


            const diagnosis =
                cleanText(
                    req.body.diagnosis
                );


            if (!diagnosis) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Debes escribir el diagnóstico."

                });

            }


            const tickets =
                readTickets();


            const ticket =
                tickets.find(

                    item =>
                        item.ticket.toUpperCase() ===
                        requested

                );


            if (!ticket) {

                return res.status(
                    404
                ).json({

                    success:
                        false,

                    message:
                        "Ticket no encontrado."

                });

            }


            ticket.diagnosis =
                diagnosis;


            ticket.status =
                TICKET_STATES.QUOTE_PENDING;


            ticket.updatedAt =
                new Date().toISOString();


            ticket.history.push({

                status:
                    TICKET_STATES.QUOTE_PENDING,

                date:
                    new Date().toLocaleString(
                        "es-CO"
                    ),

                note:
                    "Diagnóstico registrado."

            });


            saveTickets(
                tickets
            );


            await sendEmail({

                from:
                    `"${SHOP_DATA.name}" <${EMAIL_USER}>`,

                to:
                    ticket.email,

                subject:
                    `🔧 Diagnóstico ${ticket.ticket} | ${SHOP_DATA.name}`,

                html: `

<div style="
font-family:Arial;
max-width:650px;
margin:auto;
">

<h2>
${escapeHTML(
    SHOP_DATA.name
)}
</h2>

<p>

Se ha completado el diagnóstico
de tu equipo.

</p>

<div style="
background:#f4f4f4;
padding:20px;
">

<strong>
Ticket:
</strong>

${escapeHTML(
    ticket.ticket
)}

<br><br>

<strong>
Diagnóstico:
</strong>

<br><br>

${escapeHTML(
    diagnosis
)}

</div>

<p>

El siguiente paso será
la presentación del presupuesto.

</p>

</div>

`

            });


            await notifyWhatsApp(
                ticket
            );


            return res.json({

                success:
                    true,

                message:
                    "Diagnóstico guardado.",

                ticket:
                    ticket

            });

        }

        catch (error) {

            console.error(
                error
            );


            return res.status(
                500
            ).json({

                success:
                    false,

                message:
                    error.message

            });

        }

    }

);


/* ============================================================
   ACTUALIZAR PRESUPUESTO
============================================================ */

app.put(
    "/api/admin/tickets/:ticket/quote",
    async function (
        req,
        res
    ) {

        try {

            if (
                !isAdmin(
                    req
                )
            ) {

                return res.status(
                    401
                ).json({

                    success:
                        false,

                    message:
                        "No autorizado."

                });

            }


            const requested =
                cleanText(
                    req.params.ticket
                ).toUpperCase();


            const items =
                Array.isArray(
                    req.body.items
                )
                    ? req.body.items
                    : [];


            if (
                items.length === 0
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Debes agregar al menos un concepto."

                });

            }


            let total = 0;


            const cleanItems =
                items.map(
                    item => {

                        const concept =
                            cleanText(
                                item.concept
                            );


                        const price =
                            Number(
                                item.price
                            ) || 0;


                        total +=
                            price;


                        return {

                            concept:
                                concept,

                            price:
                                price

                        };

                    }
                );


            const tickets =
                readTickets();


            const ticket =
                tickets.find(

                    item =>
                        item.ticket.toUpperCase() ===
                        requested

                );


            if (!ticket) {

                return res.status(
                    404
                ).json({

                    success:
                        false,

                    message:
                        "Ticket no encontrado."

                });

            }


            ticket.quoteItems =
                cleanItems;


            ticket.quoteTotal =
                total;


            ticket.status =
                TICKET_STATES.AWAITING_AUTHORIZATION;


            ticket.authorization =
                {

                    status:
                        "pending",

                    date:
                        new Date().toLocaleString(
                            "es-CO"
                        )

                };


            ticket.updatedAt =
                new Date().toISOString();


            ticket.history.push({

                status:
                    TICKET_STATES.AWAITING_AUTHORIZATION,

                date:
                    new Date().toLocaleString(
                        "es-CO"
                    ),

                note:
                    "Presupuesto generado."

            });


            saveTickets(
                tickets
            );


            await sendEmail({

                from:
                    `"${SHOP_DATA.name}" <${EMAIL_USER}>`,

                to:
                    ticket.email,

                subject:
                    `💰 Presupuesto disponible ${ticket.ticket}`,

                html: buildQuoteEmail(
                    ticket
                )

            });


            const whatsapp =
                await notifyWhatsApp(
                    ticket
                );


            return res.json({

                success:
                    true,

                ticket:
                    ticket,

                whatsapp:
                    whatsapp

            });

        }

        catch (error) {

            console.error(
                "ERROR PRESUPUESTO:",
                error
            );


            return res.status(
                500
            ).json({

                success:
                    false,

                message:
                    error.message

            });

        }

    }

);


/* ============================================================
   CORREO PRESUPUESTO
============================================================ */

function buildQuoteEmail(
    ticket
) {

    let rows = "";


    ticket.quoteItems.forEach(

        item => {

            rows += `

<tr>

<td style="
padding:10px;
border-bottom:1px solid #ddd;
">

${escapeHTML(
    item.concept
)}

</td>

<td style="
padding:10px;
border-bottom:1px solid #ddd;
text-align:right;
">

$${formatMoney(
    item.price
)}

</td>

</tr>

`;

        }

    );


    return `

<div style="
font-family:Arial;
max-width:700px;
margin:auto;
">

<h2>
${escapeHTML(
    SHOP_DATA.name
)}
</h2>

<h3>
Presupuesto de servicio
</h3>

<p>

Ticket:

<strong>
${escapeHTML(
    ticket.ticket
)}
</strong>

</p>

<p>

Marcadora:

<strong>
${escapeHTML(
    ticket.brand
)}
${escapeHTML(
    ticket.model
)}
</strong>

</p>

<div style="
background:#fff4f7;
padding:20px;
border-left:5px solid #a62950;
">

<strong>
DIAGNÓSTICO
</strong>

<p>

${escapeHTML(
    ticket.diagnosis
)}

</p>

</div>

<br>

<table width="100%" cellpadding="0" cellspacing="0">

${rows}

<tr>

<td style="
padding:15px;
font-weight:bold;
">

TOTAL

</td>

<td style="
padding:15px;
font-weight:bold;
text-align:right;
font-size:20px;
color:#a62950;
">

$${formatMoney(
    ticket.quoteTotal
)}

</td>

</tr>

</table>

<br>

<p>

Para continuar con el servicio
debes autorizar el presupuesto.

</p>

<p>

También podrás indicar que
<strong>
NO DESEAS CONTINUAR
</strong>
con el servicio.

</p>

</div>

`;

}


/* ============================================================
   AUTORIZAR SERVICIO
============================================================ */

app.post(
    "/api/tickets/:ticket/authorize",
    async function (
        req,
        res
    ) {

        try {

            const requested =
                cleanText(
                    req.params.ticket
                ).toUpperCase();


            const tickets =
                readTickets();


            const ticket =
                tickets.find(

                    item =>
                        item.ticket.toUpperCase() ===
                        requested

                );


            if (!ticket) {

                return res.status(
                    404
                ).json({

                    success:
                        false,

                    message:
                        "Ticket no encontrado."

                });

            }


            if (
                ticket.status !==
                TICKET_STATES.AWAITING_AUTHORIZATION
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Este ticket no está pendiente de autorización."

                });

            }


            ticket.authorization =
                {

                    status:
                        "authorized",

                    date:
                        new Date().toLocaleString(
                            "es-CO"
                        )

                };


            ticket.status =
                TICKET_STATES.AUTHORIZED;


            ticket.updatedAt =
                new Date().toISOString();


            ticket.history.push({

                status:
                    TICKET_STATES.AUTHORIZED,

                date:
                    new Date().toLocaleString(
                        "es-CO"
                    ),

                note:
                    "Cliente autorizó el servicio."

            });


            saveTickets(
                tickets
            );


            await sendEmail({

                from:
                    `"${SHOP_DATA.name}" <${EMAIL_USER}>`,

                to:
                    SHOP_DATA.email,

                replyTo:
                    ticket.email,

                subject:
                    `✅ SERVICIO AUTORIZADO ${ticket.ticket}`,

                html: `

<h2>
SERVICIO AUTORIZADO
</h2>

<p>

Ticket:

<strong>
${escapeHTML(
    ticket.ticket
)}
</strong>

</p>

<p>

Cliente:

<strong>
${escapeHTML(
    ticket.name
)}
</strong>

</p>

<p>

El cliente autorizó
el presupuesto por:

<strong>
$${formatMoney(
    ticket.quoteTotal
)}
</strong>

</p>

`

            });


            await sendEmail({

                from:
                    `"${SHOP_DATA.name}" <${EMAIL_USER}>`,

                to:
                    ticket.email,

                subject:
                    `✅ Servicio autorizado ${ticket.ticket}`,

                html: `

<div style="
font-family:Arial;
max-width:650px;
margin:auto;
">

<h2>
${escapeHTML(
    SHOP_DATA.name
)}
</h2>

<p>

Hemos recibido tu autorización.

</p>

<h3 style="
color:#a62950;
">

SERVICIO AUTORIZADO

</h3>

<p>

Ticket:

<strong>
${escapeHTML(
    ticket.ticket
)}
</strong>

</p>

<p>

Total autorizado:

<strong>
$${formatMoney(
    ticket.quoteTotal
)}
</strong>

</p>

<p>

Procederemos con el servicio
correspondiente.

</p>

</div>

`

            });


            const whatsapp =
                await notifyWhatsApp(
                    ticket
                );


            return res.json({

                success:
                    true,

                status:
                    ticket.status,

                whatsapp:
                    whatsapp,

                message:
                    "Servicio autorizado correctamente."

            });

        }

        catch (error) {

            console.error(
                error
            );


            return res.status(
                500
            ).json({

                success:
                    false,

                message:
                    error.message

            });

        }

    }

);


/* ============================================================
   NO DESEO CONTINUAR
============================================================ */

app.post(
    "/api/tickets/:ticket/decline",
    async function (
        req,
        res
    ) {

        try {

            const requested =
                cleanText(
                    req.params.ticket
                ).toUpperCase();


            const tickets =
                readTickets();


            const ticket =
                tickets.find(

                    item =>
                        item.ticket.toUpperCase() ===
                        requested

                );


            if (!ticket) {

                return res.status(
                    404
                ).json({

                    success:
                        false,

                    message:
                        "Ticket no encontrado."

                });

            }


            if (
                ticket.status !==
                TICKET_STATES.AWAITING_AUTHORIZATION
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Este ticket no está pendiente de autorización."

                });

            }


            ticket.authorization =
                {

                    status:
                        "declined",

                    date:
                        new Date().toLocaleString(
                            "es-CO"
                        )

                };


            ticket.status =
                TICKET_STATES.DECLINED;


            ticket.updatedAt =
                new Date().toISOString();


            ticket.returnProcess =
                {

                    diagnosticCharge:
                        ticket.diagnosticPrice,

                    returnShipping:
                        "Pendiente de coordinación",

                    paymentRequired:
                        true

                };


            ticket.history.push({

                status:
                    TICKET_STATES.DECLINED,

                date:
                    new Date().toLocaleString(
                        "es-CO"
                    ),

                note:
                    "Cliente no autorizó continuar."

            });


            saveTickets(
                tickets
            );


            await sendEmail({

                from:
                    `"${SHOP_DATA.name}" <${EMAIL_USER}>`,

                to:
                    SHOP_DATA.email,

                replyTo:
                    ticket.email,

                subject:
                    `⚠️ CLIENTE NO AUTORIZA ${ticket.ticket}`,

                html: `

<h2>
CLIENTE NO AUTORIZA
</h2>

<p>

Ticket:

<strong>
${escapeHTML(
    ticket.ticket
)}
</strong>

</p>

<p>

Cliente:

<strong>
${escapeHTML(
    ticket.name
)}
</strong>

</p>

<p>

El cliente decidió
no continuar con el servicio.

</p>

<p>

Diagnóstico a cobrar:

<strong>
$${formatMoney(
    ticket.diagnosticPrice
)}
</strong>

</p>

`

            });


            await sendEmail({

                from:
                    `"${SHOP_DATA.name}" <${EMAIL_USER}>`,

                to:
                    ticket.email,

                subject:
                    `Solicitud de retorno ${ticket.ticket}`,

                html: `

<div style="
font-family:Arial;
max-width:650px;
margin:auto;
">

<h2>
${escapeHTML(
    SHOP_DATA.name
)}
</h2>

<p>

Hemos registrado que
<strong>
no deseas continuar
</strong>
con el servicio.

</p>

<div style="
background:#fff4f7;
padding:20px;
border-left:5px solid #a62950;
">

<strong>
Diagnóstico:
</strong>

$${formatMoney(
    ticket.diagnosticPrice
)}

</div>

<p>

El equipo será preparado
para su retorno una vez
se gestione el pago del
diagnóstico y el envío
correspondiente.

</p>

</div>

`

            });


            const whatsapp =
                await notifyWhatsApp(
                    ticket
                );


            return res.json({

                success:
                    true,

                status:
                    ticket.status,

                diagnosticCharge:
                    ticket.diagnosticPrice,

                whatsapp:
                    whatsapp,

                message:
                    "Se registró que el cliente no desea continuar."

            });

        }

        catch (error) {

            console.error(
                error
            );


            return res.status(
                500
            ).json({

                success:
                    false,

                message:
                    error.message

            });

        }

    }

);


/* ============================================================
   ACTUALIZAR LINK DE PAGO ADMIN
============================================================ */

app.put(
    "/api/admin/tickets/:ticket/payment",
    async function (
        req,
        res
    ) {

        try {

            if (
                !isAdmin(
                    req
                )
            ) {

                return res.status(
                    401
                ).json({

                    success:
                        false,

                    message:
                        "No autorizado."

                });

            }


            const requested =
                cleanText(
                    req.params.ticket
                ).toUpperCase();


            const link =
                cleanText(
                    req.body.link
                );


            const tickets =
                readTickets();


            const ticket =
                tickets.find(

                    item =>
                        item.ticket.toUpperCase() ===
                        requested

                );


            if (!ticket) {

                return res.status(
                    404
                ).json({

                    success:
                        false,

                    message:
                        "Ticket no encontrado."

                });

            }


            ticket.payment =
                {

                    status:
                        "pending",

                    link:
                        link

                };


            ticket.updatedAt =
                new Date().toISOString();


            saveTickets(
                tickets
            );


            return res.json({

                success:
                    true,

                ticket:
                    ticket

            });

        }

        catch (error) {

            return res.status(
                500
            ).json({

                success:
                    false,

                message:
                    error.message

            });

        }

    }

);


/* ============================================================
   MARCAR PAGO RECIBIDO
============================================================ */

app.post(
    "/api/admin/tickets/:ticket/payment-confirm",
    async function (
        req,
        res
    ) {

        try {

            if (
                !isAdmin(
                    req
                )
            ) {

                return res.status(
                    401
                ).json({

                    success:
                        false,

                    message:
                        "No autorizado."

                });

            }


            const requested =
                cleanText(
                    req.params.ticket
                ).toUpperCase();


            const tickets =
                readTickets();


            const ticket =
                tickets.find(

                    item =>
                        item.ticket.toUpperCase() ===
                        requested

                );


            if (!ticket) {

                return res.status(
                    404
                ).json({

                    success:
                        false,

                    message:
                        "Ticket no encontrado."

                });

            }


            ticket.payment.status =
                "paid";


            ticket.status =
                TICKET_STATES.REPAIR;


            ticket.updatedAt =
                new Date().toISOString();


            ticket.history.push({

                status:
                    TICKET_STATES.REPAIR,

                date:
                    new Date().toLocaleString(
                        "es-CO"
                    ),

                note:
                    "Pago confirmado. Servicio en proceso."

            });


            saveTickets(
                tickets
            );


            const whatsapp =
                await notifyWhatsApp(
                    ticket
                );


            return res.json({

                success:
                    true,

                status:
                    ticket.status,

                whatsapp:
                    whatsapp

            });

        }

        catch (error) {

            console.error(
                error
            );


            return res.status(
                500
            ).json({

                success:
                    false,

                message:
                    error.message

            });

        }

    }

);


/* ============================================================
   RUTA PARA OBTENER ESTADOS DISPONIBLES
============================================================ */

app.get(
    "/api/statuses",
    function (
        req,
        res
    ) {

        return res.json({

            success:
                true,

            statuses:
                Object.values(
                    TICKET_STATES
                )

        });

    }

);


/* ============================================================
   RUTA WHATSAPP PREPARADA
============================================================ */

app.get(
    "/api/tickets/:ticket/whatsapp",
    function (
        req,
        res
    ) {

        const requested =
            cleanText(
                req.params.ticket
            ).toUpperCase();


        const ticket =
            readTickets().find(

                item =>
                    item.ticket.toUpperCase() ===
                    requested

            );


        if (!ticket) {

            return res.status(
                404
            ).json({

                success:
                    false,

                message:
                    "Ticket no encontrado."

            });

        }


        const link =
            createWhatsAppLink(

                ticket.whatsapp,

                buildStatusMessage(
                    ticket
                )

            );


        return res.json({

            success:
                true,

            link:
                link

        });

    }

);


/* ============================================================
   PÁGINA PRINCIPAL
============================================================ */

app.get(
    "/",
    function (
        req,
        res
    ) {

        res.sendFile(

            path.join(
                __dirname,
                "index.html"
            )

        );

    }
);


/* ============================================================
   INICIO
============================================================ */

app.listen(

    PORT,

    function () {

        console.log("");

        console.log(
            "=========================================="
        );

        console.log(
            " JFRII THACTICAL TECH"
        );

        console.log(
            " SISTEMA COMPLETO DE TICKETS"
        );

        console.log(
            "=========================================="
        );

        console.log("");

        console.log(
            `Servidor: http://localhost:${PORT}`
        );

        console.log("");

        console.log(
            "✓ SISTEMA DE TICKETS ONLINE"
        );

        console.log("");

        if (
            transporter
        ) {

            console.log(
                "✓ CORREO CONFIGURADO"
            );

        }

        else {

            console.log(
                "⚠ CORREO NO CONFIGURADO"
            );

        }

        console.log("");

        console.log(
            "=========================================="
        );

        console.log(
            " ESTADOS DISPONIBLES"
        );

        console.log(
            "=========================================="
        );

        Object.values(
            TICKET_STATES
        ).forEach(

            status => {

                console.log(
                    "• " + status
                );

            }

        );

        console.log("");

    }

);