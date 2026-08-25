const state = {
    password: sessionStorage.getItem("jfrii_admin_password") || "",
    tickets: [],
    selectedTicket: null,
    statuses: []
};

const $ = (selector) => document.querySelector(selector);


/* =========================
   UTILIDADES
========================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function money(value) {
    return (Number(value) || 0).toLocaleString("es-CO");
}


function showToast(message) {
    const toast = $("#toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


function setLoginError(message = "") {
    const el = $("#loginError");

    el.textContent = message;

    el.classList.toggle(
        "hidden",
        !message
    );
}


/* =========================
   API
========================= */

async function api(url, options = {}) {

    const headers = {
        ...(options.headers || {}),
        "x-admin-password": state.password,
        "Content-Type": "application/json"
    };

    const response = await fetch(
        url,
        {
            ...options,
            headers
        }
    );

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {
            success: false,
            message: "Respuesta inválida del servidor."
        };
    }

    if (response.status === 401) {
        logout();

        throw new Error(
            "Sesión administrativa no autorizada."
        );
    }

    if (!response.ok || data.success === false) {

        throw new Error(
            data.message ||
            `Error HTTP ${response.status}`
        );
    }

    return data;
}


/* =========================
   ESTADOS
========================= */

function statusClass(status) {

    const s =
        String(status || "")
            .toLowerCase();

    if (
        s.includes("pago") ||
        s.includes("autorización") ||
        s.includes("presupuesto")
    ) {
        return "yellow";
    }

    if (
        s.includes("finalizado") ||
        s.includes("enviado") ||
        s.includes("listo")
    ) {
        return "green";
    }

    if (
        s.includes("cancelado") ||
        s.includes("no autoriza")
    ) {
        return "red";
    }

    return "wine";
}


function formatDate(value) {
    if (!value) return "—";

    return String(value);
}


/* =========================
   ESTADÍSTICAS
========================= */

function renderStats() {

    const tickets = state.tickets;

    $("#statTotal").textContent =
        tickets.length;

    $("#statDiagnosis").textContent =
        tickets.filter(
            t => t.status === "En diagnóstico"
        ).length;

    $("#statAuthorization").textContent =
        tickets.filter(
            t => t.status === "Esperando autorización"
        ).length;

    $("#statRepair").textContent =
        tickets.filter(
            t => t.status === "En reparación"
        ).length;

    $("#statPayment").textContent =
        tickets.filter(
            t => t.status === "Pago pendiente"
        ).length;

    $("#statDelivery").textContent =
        tickets.filter(t =>
            [
                "Listo para despacho",
                "Enviado",
                "Retorno del equipo"
            ].includes(t.status)
        ).length;
}


/* =========================
   FILTRO ESTADOS
========================= */

function renderStatusFilter() {

    const select = $("#statusFilter");

    const current = select.value;

    const statuses =
        state.statuses.length
            ? state.statuses
            : [
                ...new Set(
                    state.tickets
                        .map(t => t.status)
                        .filter(Boolean)
                )
            ];

    select.innerHTML =
        `<option value="">Todos los estados</option>` +
        statuses
            .map(status =>
                `<option value="${escapeHTML(status)}">
                    ${escapeHTML(status)}
                </option>`
            )
            .join("");

    if (statuses.includes(current)) {
        select.value = current;
    }
}


/* =========================
   FILTRAR TICKETS
========================= */

function filteredTickets() {

    const search =
        $("#searchInput")
            .value
            .trim()
            .toLowerCase();

    const status =
        $("#statusFilter").value;

    return state.tickets.filter(ticket => {

        const haystack = [
            ticket.ticket,
            ticket.name,
            ticket.brand,
            ticket.model,
            ticket.service,
            ticket.description,
            ticket.status
        ]
            .join(" ")
            .toLowerCase();

        return (
            (!search ||
                haystack.includes(search)) &&
            (!status ||
                ticket.status === status)
        );
    });
}


/* =========================
   LISTA DE TICKETS
========================= */

function renderTicketList() {

    const tickets =
        filteredTickets();

    $("#ticketCount").textContent =
        `${tickets.length} registro${
            tickets.length === 1
                ? ""
                : "s"
        }`;

    if (!tickets.length) {

        $("#ticketList").innerHTML =
            `<div class="empty-state">
                No hay tickets que coincidan con la búsqueda.
            </div>`;

        return;
    }

    $("#ticketList").innerHTML =
        tickets.map(ticket => `

            <button
                class="ticket-row ${
                    state.selectedTicket?.ticket === ticket.ticket
                        ? "active"
                        : ""
                }"
                data-ticket="${escapeHTML(ticket.ticket)}"
            >

                <div class="ticket-number">
                    ${escapeHTML(ticket.ticket)}
                </div>

                <div class="ticket-name">
                    ${escapeHTML(
                        ticket.name ||
                        "Sin nombre"
                    )}
                </div>

                <div class="ticket-meta">
                    ${escapeHTML(ticket.brand || "")}
                    ${escapeHTML(ticket.model || "")}
                </div>

                <span
                    class="status-pill ${statusClass(ticket.status)}"
                >
                    ${escapeHTML(
                        ticket.status ||
                        "Sin estado"
                    )}
                </span>

            </button>

        `).join("");

    document
        .querySelectorAll(".ticket-row")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    selectTicket(
                        button.dataset.ticket
                    )
            );

        });
}


/* =========================
   DETALLE
========================= */

function renderTicketDetail(ticket) {

    if (!ticket) {

        $("#emptyDetail")
            .classList
            .remove("hidden");

        $("#ticketDetail")
            .classList
            .add("hidden");

        return;
    }

    $("#emptyDetail")
        .classList
        .add("hidden");

    $("#ticketDetail")
        .classList
        .remove("hidden");

    const items =
        Array.isArray(ticket.quoteItems)
            ? ticket.quoteItems
            : [];

    const history =
        Array.isArray(ticket.history)
            ? ticket.history
            : [];

    $("#ticketDetail").innerHTML = `

        <div class="detail-header">

            <div>

                <p class="eyebrow">
                    ORDEN DE SERVICIO
                </p>

                <h2>
                    ${escapeHTML(ticket.ticket)}
                </h2>

                <p class="muted">
                    ${escapeHTML(
                        ticket.name ||
                        "Sin nombre"
                    )}
                    ·
                    ${escapeHTML(
                        formatDate(ticket.date)
                    )}
                </p>

            </div>

            <span
                class="status-pill ${statusClass(ticket.status)}"
            >
                ${escapeHTML(
                    ticket.status ||
                    "Sin estado"
                )}
            </span>

        </div>


        <div class="detail-body">

            <div class="info-grid">

                <div class="info-card">
                    <span class="label">
                        CLIENTE
                    </span>

                    <strong>
                        ${escapeHTML(ticket.name)}
                    </strong>
                </div>

                <div class="info-card">
                    <span class="label">
                        EQUIPO
                    </span>

                    <strong>
                        ${escapeHTML(ticket.brand)}
                        ${escapeHTML(ticket.model)}
                    </strong>
                </div>

                <div class="info-card">
                    <span class="label">
                        SERVICIO SOLICITADO
                    </span>

                    <strong>
                        ${escapeHTML(ticket.service)}
                    </strong>
                </div>

                <div class="info-card">
                    <span class="label">
                        TELÉFONO
                    </span>

                    <strong>
                        ${escapeHTML(
                            ticket.phone || "—"
                        )}
                    </strong>
                </div>

                <div class="info-card">
                    <span class="label">
                        WHATSAPP
                    </span>

                    <strong>
                        ${escapeHTML(
                            ticket.whatsapp || "—"
                        )}
                    </strong>
                </div>

                <div class="info-card">
                    <span class="label">
                        CORREO
                    </span>

                    <strong>
                        ${escapeHTML(
                            ticket.email || "—"
                        )}
                    </strong>
                </div>

            </div>


            <!-- SOLICITUD -->

            <div class="admin-section">

                <div class="section-title">
                    <h3>
                        Solicitud del cliente
                    </h3>
                </div>

                <p class="muted">
                    ${escapeHTML(
                        ticket.description ||
                        "Sin descripción."
                    )}
                </p>

            </div>


            <!-- DIAGNÓSTICO -->

            <div class="admin-section">

                <div class="section-title">

                    <h3>
                        Diagnóstico técnico
                    </h3>

                    <span class="muted">
                        Guardar diagnóstico cambia el ticket
                        a “Presupuesto pendiente”.
                    </span>

                </div>

                <textarea
                    id="diagnosisInput"
                    placeholder="Escribe aquí el diagnóstico técnico..."
                >${escapeHTML(
                    ticket.diagnosis || ""
                )}</textarea>

                <div class="form-actions">

                    <button
                        id="saveDiagnosisButton"
                        class="action-button"
                    >
                        Guardar diagnóstico
                    </button>

                </div>

            </div>


            <!-- PRESUPUESTO -->

            <div class="admin-section">

                <div class="section-title">

                    <h3>
                        Presupuesto
                    </h3>

                    <span class="muted">
                        Los conceptos se suman automáticamente.
                    </span>

                </div>

                <div id="quoteItemsContainer">

                    ${items.map((item, index) => `

                        <div
                            class="quote-add-row quote-existing-row"
                            data-index="${index}"
                            style="margin-bottom:8px;"
                        >

                            <input
                                class="quote-concept"
                                value="${escapeHTML(item.concept)}"
                                placeholder="Concepto"
                            >

                            <input
                                class="quote-price"
                                type="number"
                                min="0"
                                step="1"
                                value="${Number(item.price) || 0}"
                                placeholder="Valor"
                            >

                            <button
                                type="button"
                                class="quote-remove"
                            >
                                Eliminar
                            </button>

                        </div>

                    `).join("")}

                </div>


                <div
                    class="quote-add-row"
                    style="margin-top:10px;"
                >

                    <input
                        id="newConcept"
                        placeholder="Ej. Mantenimiento completo"
                    >

                    <input
                        id="newPrice"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Valor"
                    >

                    <button
                        id="addQuoteButton"
                        class="action-button secondary"
                        type="button"
                    >
                        Agregar
                    </button>

                </div>


                <div class="quote-total">

                    <span>
                        Total:
                    </span>

                    <strong id="quoteTotalPreview">
                        $${money(ticket.quoteTotal)}
                    </strong>

                </div>


                <div class="form-actions">

                    <button
                        id="saveQuoteButton"
                        class="action-button"
                    >
                        Guardar presupuesto
                    </button>

                </div>

            </div>


            <!-- ESTADO -->

            <div class="admin-section">

                <div class="section-title">

                    <h3>
                        Estado del ticket
                    </h3>

                </div>

                <div class="form-actions">

                    <select id="statusInput">

                        ${state.statuses.map(status => `

                            <option
                                value="${escapeHTML(status)}"
                                ${
                                    status === ticket.status
                                        ? "selected"
                                        : ""
                                }
                            >
                                ${escapeHTML(status)}
                            </option>

                        `).join("")}

                    </select>


                    <button
                        id="saveStatusButton"
                        class="action-button"
                    >
                        Actualizar estado
                    </button>

                </div>

            </div>


            <!-- PAGO -->

            <div class="admin-section">

                <div class="section-title">

                    <h3>
                        Pago
                    </h3>

                    <span class="muted">
                        Estado actual:
                        ${escapeHTML(
                            ticket.payment?.status ||
                            "No configurado"
                        )}
                    </span>

                </div>


                <input
                    id="paymentLinkInput"
                    type="url"
                    placeholder="Enlace de pago"
                    value="${escapeHTML(
                        ticket.payment?.link ||
                        ""
                    )}"
                >


                <div class="form-actions">

                    <button
                        id="savePaymentLinkButton"
                        class="action-button secondary"
                    >
                        Guardar enlace de pago
                    </button>

                    <button
                        id="confirmPaymentButton"
                        class="action-button green"
                    >
                        Confirmar pago recibido
                    </button>

                </div>

            </div>


            <!-- HISTORIAL -->

            <div class="admin-section">

                <div class="section-title">

                    <h3>
                        Historial
                    </h3>

                </div>

                <div class="history">

                    ${
                        history.length
                            ? history
                                .slice()
                                .reverse()
                                .map(item => `

                                    <div class="history-item">

                                        <strong>
                                            ${escapeHTML(
                                                item.status ||
                                                "Actualización"
                                            )}
                                        </strong>

                                        <small>
                                            ${escapeHTML(
                                                item.date || ""
                                            )}
                                        </small>

                                        ${
                                            item.note
                                                ? `<div>
                                                    ${escapeHTML(item.note)}
                                                   </div>`
                                                : ""
                                        }

                                    </div>

                                `)
                                .join("")
                            : `
                                <div class="empty-state">
                                    Sin historial.
                                </div>
                            `
                    }

                </div>

            </div>

        </div>
    `;

    bindDetailActions();

    updateQuotePreview();
}


/* =========================
   PRESUPUESTO
========================= */

function collectQuoteItems() {

    return [
        ...document.querySelectorAll(
            ".quote-existing-row"
        )
    ]
        .map(row => ({
            concept:
                row
                    .querySelector(".quote-concept")
                    .value
                    .trim(),

            price:
                Number(
                    row
                        .querySelector(".quote-price")
                        .value
                ) || 0
        }))
        .filter(item => item.concept);
}


function updateQuotePreview() {

    const items =
        collectQuoteItems();

    const total =
        items.reduce(
            (sum, item) =>
                sum + item.price,
            0
        );

    const preview =
        $("#quoteTotalPreview");

    if (preview) {
        preview.textContent =
            `$${money(total)}`;
    }
}


/* =========================
   ACCIONES DETALLE
========================= */

function bindDetailActions() {

    document
        .querySelectorAll(".quote-remove")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const row =
                        button.closest(
                            ".quote-existing-row"
                        );

                    row.remove();

                    updateQuotePreview();
                }
            );

        });


    document
        .querySelectorAll(
            ".quote-price, .quote-concept"
        )
        .forEach(input => {

            input.addEventListener(
                "input",
                updateQuotePreview
            );

        });


    $("#addQuoteButton")
        .addEventListener(
            "click",
            () => {

                const concept =
                    $("#newConcept")
                        .value
                        .trim();

                const price =
                    Number(
                        $("#newPrice").value
                    ) || 0;

                if (!concept) {

                    showToast(
                        "Escribe el concepto del presupuesto."
                    );

                    return;
                }

                const row =
                    document.createElement("div");

                row.className =
                    "quote-add-row quote-existing-row";

                row.style.marginBottom =
                    "8px";

                row.innerHTML = `

                    <input
                        class="quote-concept"
                        value="${escapeHTML(concept)}"
                        placeholder="Concepto"
                    >

                    <input
                        class="quote-price"
                        type="number"
                        min="0"
                        step="1"
                        value="${price}"
                    >

                    <button
                        type="button"
                        class="quote-remove"
                    >
                        Eliminar
                    </button>

                `;

                $("#quoteItemsContainer")
                    .appendChild(row);


                row
                    .querySelector(".quote-remove")
                    .addEventListener(
                        "click",
                        () => {

                            row.remove();

                            updateQuotePreview();
                        }
                    );


                row
                    .querySelector(".quote-price")
                    .addEventListener(
                        "input",
                        updateQuotePreview
                    );


                row
                    .querySelector(".quote-concept")
                    .addEventListener(
                        "input",
                        updateQuotePreview
                    );


                $("#newConcept").value = "";

                $("#newPrice").value = "";

                updateQuotePreview();
            }
        );


    $("#saveDiagnosisButton")
        .addEventListener(
            "click",
            saveDiagnosis
        );


    $("#saveQuoteButton")
        .addEventListener(
            "click",
            saveQuote
        );


    $("#saveStatusButton")
        .addEventListener(
            "click",
            saveStatus
        );


    $("#savePaymentLinkButton")
        .addEventListener(
            "click",
            savePaymentLink
        );


    $("#confirmPaymentButton")
        .addEventListener(
            "click",
            confirmPayment
        );
}


/* =========================
   SELECCIONAR TICKET
========================= */

async function selectTicket(ticketNumber) {

    try {

        const data =
            await api(
                `/api/admin/tickets/${encodeURIComponent(ticketNumber)}`
            );

        state.selectedTicket =
            data.ticket;

        renderTicketList();

        renderTicketDetail(
            state.selectedTicket
        );

    } catch (error) {

        showToast(
            error.message
        );
    }
}


/* =========================
   CARGAR ESTADOS
========================= */

async function loadStatuses() {

    try {

        const response =
            await fetch(
                "/api/statuses"
            );

        const data =
            await response.json();

        state.statuses =
            Array.isArray(data.statuses)
                ? data.statuses
                : [];

    } catch {

        state.statuses = [];
    }
}


/* =========================
   CARGAR TICKETS
========================= */

async function loadTickets(
    preferredTicket = null
) {

    try {

        const data =
            await api(
                "/api/admin/tickets"
            );

        state.tickets =
            Array.isArray(data.tickets)
                ? data.tickets
                : [];

        renderStats();

        renderStatusFilter();

        renderTicketList();


        const target =
            preferredTicket ||
            state.selectedTicket?.ticket;


        if (
            target &&
            state.tickets.some(
                t => t.ticket === target
            )
        ) {

            await selectTicket(
                target
            );

        } else if (
            state.selectedTicket &&
            !state.tickets.some(
                t =>
                    t.ticket ===
                    state.selectedTicket.ticket
            )
        ) {

            state.selectedTicket =
                null;

            renderTicketDetail(null);
        }

    } catch (error) {

        showToast(
            error.message
        );
    }
}


/* =========================
   DIAGNÓSTICO
========================= */

async function saveDiagnosis() {

    const diagnosis =
        $("#diagnosisInput")
            .value
            .trim();

    if (!diagnosis) {

        showToast(
            "Escribe el diagnóstico antes de guardar."
        );

        return;
    }

    try {

        await api(
            `/api/admin/tickets/${encodeURIComponent(
                state.selectedTicket.ticket
            )}/diagnosis`,
            {
                method: "PUT",

                body:
                    JSON.stringify({
                        diagnosis
                    })
            }
        );

        showToast(
            "Diagnóstico guardado."
        );

        await loadTickets(
            state.selectedTicket.ticket
        );

    } catch (error) {

        showToast(
            error.message
        );
    }
}


/* =========================
   PRESUPUESTO
========================= */

async function saveQuote() {

    const items =
        collectQuoteItems();

    if (!items.length) {

        showToast(
            "Agrega al menos un concepto."
        );

        return;
    }

    if (
        items.some(
            item => item.price < 0
        )
    ) {

        showToast(
            "Los valores no pueden ser negativos."
        );

        return;
    }

    try {

        await api(
            `/api/admin/tickets/${encodeURIComponent(
                state.selectedTicket.ticket
            )}/quote`,
            {
                method: "PUT",

                body:
                    JSON.stringify({
                        items
                    })
            }
        );

        showToast(
            "Presupuesto guardado y enviado a autorización."
        );

        await loadTickets(
            state.selectedTicket.ticket
        );

    } catch (error) {

        showToast(
            error.message
        );
    }
}


/* =========================
   ESTADO
========================= */

async function saveStatus() {

    const status =
        $("#statusInput").value;

    if (!status) return;

    try {

        await api(
            `/api/admin/tickets/${encodeURIComponent(
                state.selectedTicket.ticket
            )}/status`,
            {
                method: "PUT",

                body:
                    JSON.stringify({
                        status
                    })
            }
        );

        showToast(
            "Estado actualizado."
        );

        await loadTickets(
            state.selectedTicket.ticket
        );

    } catch (error) {

        showToast(
            error.message
        );
    }
}


/* =========================
   ENLACE PAGO
========================= */

async function savePaymentLink() {

    const link =
        $("#paymentLinkInput")
            .value
            .trim();

    if (
        link &&
        !/^https?:\/\//i.test(link)
    ) {

        showToast(
            "El enlace debe comenzar con http:// o https://"
        );

        return;
    }

    try {

        await api(
            `/api/admin/tickets/${encodeURIComponent(
                state.selectedTicket.ticket
            )}/payment`,
            {
                method: "PUT",

                body:
                    JSON.stringify({
                        link
                    })
            }
        );

        showToast(
            "Enlace de pago guardado."
        );

        await loadTickets(
            state.selectedTicket.ticket
        );

    } catch (error) {

        showToast(
            error.message
        );
    }
}


/* =========================
   CONFIRMAR PAGO
========================= */

async function confirmPayment() {

    const ok =
        confirm(
            "¿Confirmas que el pago fue recibido?"
        );

    if (!ok) return;

    try {

        await api(
            `/api/admin/tickets/${encodeURIComponent(
                state.selectedTicket.ticket
            )}/payment-confirm`,
            {
                method: "POST",

                body:
                    JSON.stringify({})
            }
        );

        showToast(
            "Pago confirmado. El ticket pasó a reparación."
        );

        await loadTickets(
            state.selectedTicket.ticket
        );

    } catch (error) {

        showToast(
            error.message
        );
    }
}


/* =========================
   LOGIN
========================= */

function showAdmin() {

    $("#loginView")
        .classList
        .add("hidden");

    $("#adminView")
        .classList
        .remove("hidden");

    loadStatuses()
        .then(() =>
            loadTickets()
        );
}


function logout() {

    state.password = "";

    sessionStorage.removeItem(
        "jfrii_admin_password"
    );

    state.tickets = [];

    state.selectedTicket = null;

    $("#adminView")
        .classList
        .add("hidden");

    $("#loginView")
        .classList
        .remove("hidden");

    $("#adminPassword").value = "";

    setLoginError("");
}


async function testPassword(password) {

    const previous =
        state.password;

    state.password =
        password;

    try {

        const data =
            await api(
                "/api/admin/tickets"
            );

        return data.success !== false;

    } catch {

        state.password =
            previous;

        return false;
    }
}


/* =========================
   FORM LOGIN
========================= */

$("#loginForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            setLoginError("");

            const password =
                $("#adminPassword")
                    .value;

            if (!password) return;

            const button =
                event.submitter;

            if (button) {
                button.disabled = true;
            }

            const valid =
                await testPassword(
                    password
                );

            if (!valid) {

                state.password = "";

                setLoginError(
                    "Contraseña incorrecta o el servidor no autorizó el acceso."
                );

                if (button) {
                    button.disabled = false;
                }

                return;
            }

            state.password =
                password;

            sessionStorage.setItem(
                "jfrii_admin_password",
                password
            );

            if (button) {
                button.disabled = false;
            }

            showAdmin();
        }
    );


/* =========================
   MOSTRAR CONTRASEÑA
========================= */

$("#togglePassword")
    .addEventListener(
        "click",
        () => {

            const input =
                $("#adminPassword");

            const visible =
                input.type === "text";

            input.type =
                visible
                    ? "password"
                    : "text";

            $("#togglePassword")
                .textContent =
                    visible
                        ? "Mostrar"
                        : "Ocultar";
        }
    );


/* =========================
   BOTONES ADMIN
========================= */

$("#refreshButton")
    .addEventListener(
        "click",
        () => {

            loadTickets(
                state.selectedTicket?.ticket ||
                null
            );

        }
    );


$("#logoutButton")
    .addEventListener(
        "click",
        logout
    );


$("#searchInput")
    .addEventListener(
        "input",
        renderTicketList
    );


$("#statusFilter")
    .addEventListener(
        "change",
        renderTicketList
    );


$("#clearSearchButton")
    .addEventListener(
        "click",
        () => {

            $("#searchInput")
                .value = "";

            $("#statusFilter")
                .value = "";

            renderTicketList();
        }
    );


/* =========================
   SESIÓN EXISTENTE
========================= */

if (state.password) {
    showAdmin();
}   