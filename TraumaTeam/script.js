function obterUsuarios() {

    const dados = localStorage.getItem("tt_users");

    if (!dados) {
        return [];
    }

    try {

        return JSON.parse(dados);

    } catch (erro) {

        console.error("Erro ao carregar usuários:", erro);

        return [];

    }

}


function salvarUsuarios(usuarios) {

    localStorage.setItem(
        "tt_users",
        JSON.stringify(usuarios)
    );

}


function obterSessao() {

    const dados =
        localStorage.getItem("tt_session");

    if (!dados) {
        return null;
    }

    try {

        return JSON.parse(dados);

    } catch (erro) {

        return null;

    }

}


/* =========================================================
   MODAIS
========================================================= */

let planoSelecionado = null;


function abrirModalPlano(nome, valor) {

    const sessao = obterSessao();


    /*
     * USUÁRIO NÃO LOGADO
     */

    if (!sessao || !sessao.ativo) {

        const modalElement =
            document.getElementById("loginRequiredModal");

        const modal =
            new bootstrap.Modal(modalElement);

        const destino =
            `auth.html?redirect=index.html%23planos`;

        document
            .getElementById("loginRequiredButton")
            .href = destino;

        modal.show();

        return;
    }


    /*
     * USUÁRIO LOGADO
     */

    planoSelecionado = {

        nome: nome,

        valor: valor

    };


    document
        .getElementById("modalPlanName")
        .textContent = nome.toUpperCase();


    document
        .getElementById("modalPlanPrice")
        .textContent =
        valor.toLocaleString("pt-BR");


    document
        .getElementById("modalUserName")
        .textContent =
        sessao.nome.toUpperCase();


    const modalElement =
        document.getElementById("purchaseModal");

    const modal =
        new bootstrap.Modal(modalElement);

    modal.show();

}


/* =========================================================
   FINALIZAR COMPRA
========================================================= */

function finalizarCompra() {

    const sessao = obterSessao();


    if (!sessao || !sessao.ativo) {
        return;
    }

    if (!planoSelecionado) {
        return;
    }


    const usuarios = obterUsuarios();


    const index =
        usuarios.findIndex(
            usuario =>
                usuario.id === sessao.usuarioId
        );


    if (index !== -1) {

        usuarios[index].plano = {

            nome: planoSelecionado.nome,

            valor: planoSelecionado.valor

        };

        salvarUsuarios(usuarios);

    }


    localStorage.setItem(
        "tt_subscription",
        JSON.stringify(planoSelecionado)
    );


    /*
     * FECHA MODAL DE COMPRA
     */

    const purchaseElement =
        document.getElementById("purchaseModal");

    const purchaseModal =
        bootstrap.Modal.getInstance(purchaseElement);

    if (purchaseModal) {
        purchaseModal.hide();
    }


    /*
     * PREENCHE MODAL DE SUCESSO
     */

    document
        .getElementById("successPlanName")
        .textContent =
        `${planoSelecionado.nome.toUpperCase()} — € ${planoSelecionado.valor.toLocaleString("pt-BR")} / MÊS`;


    /*
     * ABRE MODAL DE SUCESSO
     */

    setTimeout(() => {

        const successElement =
            document.getElementById("successModal");

        const successModal =
            new bootstrap.Modal(successElement);

        successModal.show();


        mostrarToast(
            "Plano ativado com sucesso."
        );

    }, 300);


    atualizarUsuario();

}


/* =========================================================
   ATUALIZA HEADER
========================================================= */

function atualizarUsuario() {

    const status =
        document.getElementById("statusUsuario");

    const botao =
        document.getElementById("btnConta");


    if (!status || !botao) {
        return;
    }


    const sessao = obterSessao();


    if (sessao && sessao.ativo) {

        status.innerHTML = `

            <span class="status-dot"></span>

            ${sessao.nome.toUpperCase()}

        `;


        botao.textContent =
            "MINHA CONTA";

        botao.href =
            "#";

        botao.onclick =
            function (evento) {

                evento.preventDefault();
                abrirModalPerfil();

            };


    } else {

        status.innerHTML = `

            <span class="status-dot"></span>

            VISITANTE

        `;


        botao.textContent =
            "ACESSAR CONTA";

        botao.href =
            "auth.html";

        botao.onclick = null;

    }

}


function abrirModalPerfil() {

    const sessao = obterSessao();

    const usuario = obterUsuarios().find(
        item => item.id === sessao?.usuarioId
    );

    const modalElement =
        document.getElementById("profileModal");


    if (!sessao || !sessao.ativo || !modalElement) {
        return;
    }


    const nome =
        usuario?.nome || sessao.nome || "Cliente";

    const email =
        usuario?.email || "Não informado";

    const plano =
        usuario?.plano?.nome || "Nenhum";


    document.getElementById("profileName").textContent =
        nome.toUpperCase();

    document.getElementById("profileInitials").textContent =
        obterIniciais(nome);

    document.getElementById("profileEmail").textContent =
        email;

    document.getElementById("profileId").textContent =
        usuario?.id || sessao.usuarioId || "—";

    document.getElementById("profilePlan").textContent =
        plano.toUpperCase();


    new bootstrap.Modal(modalElement).show();

}


function obterIniciais(nome) {

    return nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(parte => parte.charAt(0))
        .join("")
        .toUpperCase() || "TT";

}


function configurarPerfil() {

    const botaoLogout =
        document.getElementById("profileLogoutButton");


    if (!botaoLogout) {
        return;
    }


    botaoLogout.addEventListener(
        "click",
        function () {

            const modalElement =
                document.getElementById("profileModal");

            const modal =
                bootstrap.Modal.getInstance(modalElement);


            if (modal) {
                modal.hide();
            }


            logout();

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem("tt_session");

    mostrarToast(
        "Sessão encerrada."
    );

    atualizarUsuario();

}


/* =========================================================
   TEMA
========================================================= */

function carregarTema() {

    const tema =
        localStorage.getItem("tt_theme");


    document.body.classList.toggle(
        "dark-theme",
        tema === "dark"
    );

}


function alternarTema() {

    document.body.classList.toggle(
        "dark-theme"
    );


    const temaAtual =
        document.body.classList.contains(
            "dark-theme"
        )
            ? "dark"
            : "light";


    localStorage.setItem(
        "tt_theme",
        temaAtual
    );


    mostrarToast(
        temaAtual === "dark"
            ? "Modo escuro ativado."
            : "Modo claro ativado.",
        true
    );

}


/* =========================================================
   ABAS DE AUTENTICAÇÃO
========================================================= */

function mostrarLogin() {

    const formLogin = document.getElementById("formLogin");
    const formRegistro = document.getElementById("formRegistro");
    const tabLogin = document.getElementById("tabLogin");
    const tabRegistro = document.getElementById("tabRegistro");


    if (!formLogin || !formRegistro || !tabLogin || !tabRegistro) {
        return;
    }


    formLogin.style.display = "block";
    formRegistro.style.display = "none";
    tabLogin.classList.add("active");
    tabRegistro.classList.remove("active");
}


function mostrarRegistro() {

    const formLogin = document.getElementById("formLogin");
    const formRegistro = document.getElementById("formRegistro");
    const tabLogin = document.getElementById("tabLogin");
    const tabRegistro = document.getElementById("tabRegistro");


    if (!formLogin || !formRegistro || !tabLogin || !tabRegistro) {
        return;
    }


    formLogin.style.display = "none";
    formRegistro.style.display = "block";
    tabLogin.classList.remove("active");
    tabRegistro.classList.add("active");
}


/* =========================================================
   VALIDAÇÃO DE AUTENTICAÇÃO
========================================================= */

function validarSenhaForte(senha) {

    return {
        length: senha.length >= 8,
        uppercase: /[A-Z]/.test(senha),
        lowercase: /[a-z]/.test(senha),
        number: /[0-9]/.test(senha),
        special: /[^A-Za-z0-9]/.test(senha)
    };

}


function atualizarChecklistSenha() {

    const campoSenha =
        document.getElementById("registroSenha");

    const checklist =
        document.querySelectorAll(
            "#senhaChecklist [data-password-rule]"
        );


    if (!campoSenha || !checklist.length) {
        return;
    }


    const regras =
        validarSenhaForte(campoSenha.value);


    checklist.forEach(item => {

        const regra =
            item.dataset.passwordRule;

        const atendida =
            regras[regra] === true;


        item.classList.toggle(
            "valid",
            atendida
        );

        item.setAttribute(
            "aria-label",
            `${item.textContent.trim()} — ${atendida ? "atendido" : "pendente"}`
        );

    });

}


function configurarChecklistSenha() {

    const campoSenha =
        document.getElementById("registroSenha");


    if (!campoSenha) {
        return;
    }


    campoSenha.addEventListener(
        "input",
        atualizarChecklistSenha
    );

    atualizarChecklistSenha();

}


function validarEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
        email.trim()
    );

}


function mostrarMensagemAuth(mensagem) {

    const elemento =
        document.getElementById("authMensagem");


    if (!elemento) {
        return;
    }


    elemento.textContent = mensagem;
    elemento.style.display = "block";

}


function realizarRegistro(evento) {

    evento.preventDefault();


    const nome =
        document.getElementById("registroNome").value.trim();

    const email =
        document.getElementById("registroEmail").value.trim().toLowerCase();

    const senha =
        document.getElementById("registroSenha").value;

    const regras =
        validarSenhaForte(senha);


    if (!nome) {
        mostrarMensagemAuth("Informe seu nome completo.");
        return;
    }


    if (!validarEmail(email)) {
        mostrarMensagemAuth("Informe um e-mail válido.");
        return;
    }


    if (!Object.values(regras).every(Boolean)) {
        mostrarMensagemAuth("A senha ainda não atende a todos os requisitos.");
        atualizarChecklistSenha();
        return;
    }


    const usuarios = obterUsuarios();


    if (usuarios.some(usuario => usuario.email === email)) {
        mostrarMensagemAuth("Este e-mail já está cadastrado.");
        return;
    }


    const usuario = {
        id: Date.now(),
        nome: nome,
        email: email,
        senha: senha
    };


    usuarios.push(usuario);
    salvarUsuarios(usuarios);

    localStorage.setItem(
        "tt_session",
        JSON.stringify({
            usuarioId: usuario.id,
            nome: usuario.nome,
            ativo: true
        })
    );

    window.location.href = "index.html";

}


function realizarLogin(evento) {

    evento.preventDefault();


    const email =
        document.getElementById("loginEmail").value.trim().toLowerCase();

    const senha =
        document.getElementById("loginSenha").value;


    if (!validarEmail(email)) {
        mostrarMensagemAuth("Informe um e-mail válido.");
        return;
    }


    const usuario =
        obterUsuarios().find(
            item => item.email === email && item.senha === senha
        );


    if (!usuario) {
        mostrarMensagemAuth("E-mail ou senha incorretos.");
        return;
    }


    localStorage.setItem(
        "tt_session",
        JSON.stringify({
            usuarioId: usuario.id,
            nome: usuario.nome,
            ativo: true
        })
    );

    window.location.href = "index.html";

}


/* =========================================================
   TOAST
========================================================= */

function mostrarToast(mensagem, manterAberto = false) {

    const toastElement =
        document.getElementById("traumaToast");

    const mensagemElement =
        document.getElementById("toastMessage");


    if (!toastElement || !mensagemElement) {
        return;
    }


    mensagemElement.textContent =
        mensagem;


    const toast =
        new bootstrap.Toast(
            toastElement,
            {
                delay: 2500,
                autohide: !manterAberto
            }
        );


    toast.show();

}


/* =========================================================
   SCROLL SUAVE
========================================================= */

function configurarScroll() {

    const links =
        document.querySelectorAll(".js-scroll");


    links.forEach(link => {

        link.addEventListener(
            "click",
            function (event) {

                const destino =
                    this.getAttribute("href");


                if (
                    !destino ||
                    !destino.startsWith("#")
                ) {
                    return;
                }


                const elemento =
                    document.querySelector(destino);


                if (!elemento) {
                    return;
                }


                event.preventDefault();


                elemento.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });


                /*
                 * Fecha menu mobile
                 */

                const menu =
                    document.getElementById(
                        "mainNavigation"
                    );


                if (
                    menu &&
                    menu.classList.contains("show")
                ) {

                    const collapse =
                        bootstrap.Collapse
                            .getInstance(menu);

                    if (collapse) {
                        collapse.hide();
                    }

                }

            }
        );

    });

}


/* =========================================================
   NAVBAR DINÂMICA
========================================================= */

function configurarActiveSections() {

    const sections =
        document.querySelectorAll("main section[id]");

    const links =
        document.querySelectorAll(
            ".navigation-links .nav-link"
        );


    const observer =
        new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    links.forEach(link => {

                        link.classList.remove(
                            "active"
                        );

                    });


                    const linkAtivo =
                        document.querySelector(
                            `.navigation-links a[href="#${entry.target.id}"]`
                        );


                    if (linkAtivo) {

                        linkAtivo.classList.add(
                            "active"
                        );

                    }

                });

            },

            {
                threshold: 0.35
            }

        );


    sections.forEach(section => {

        observer.observe(section);

    });

}


/* =========================================================
   ANIMAÇÕES DE ENTRADA
========================================================= */

function configurarReveals() {

    const elementos =
        document.querySelectorAll(
            ".section-heading, .service-card, .plan-card, .about-image-placeholder, .about-section .col-lg-6, .contact-content"
        );


    elementos.forEach(elemento => {

        elemento.classList.add(
            "reveal"
        );

    });


    const observer =
        new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },

            {
                threshold: 0.12
            }

        );


    elementos.forEach(elemento => {

        observer.observe(elemento);

    });

}


/* =========================================================
   TOOLTIPS
========================================================= */

function configurarTooltips() {

    const tooltipElements =
        document.querySelectorAll(
            '[data-bs-toggle="tooltip"]'
        );


    tooltipElements.forEach(elemento => {

        new bootstrap.Tooltip(elemento);

    });

}


/* =========================================================
   INDICADORES DO CARROSSEL
========================================================= */

function configurarIndicadoresCarrossel() {

    const carrossel =
        document.getElementById("heroCarousel");

    const indicadores =
        document.querySelectorAll(
            ".hero-carousel-indicators button"
        );


    if (!carrossel || !indicadores.length) {
        return;
    }


    function atualizarIndicador(indiceAtivo) {

        indicadores.forEach((indicador, indice) => {

            indicador.classList.toggle(
                "active",
                indice === indiceAtivo
            );

        });

    }


    carrossel.addEventListener(
        "slide.bs.carousel",
        evento => {

            atualizarIndicador(evento.to);

        }
    );


    const slideInicial =
        carrossel.querySelector(
            ".carousel-item.active"
        );

    atualizarIndicador(
        [...carrossel.querySelectorAll(".carousel-item")]
            .indexOf(slideInicial)
    );

}


/* =========================================================
   BOTÃO DE COMPRA
========================================================= */

function configurarCompra() {

    const botao =
        document.getElementById(
            "confirmPurchaseButton"
        );


    if (!botao) {
        return;
    }


    botao.addEventListener(
        "click",
        finalizarCompra
    );

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        carregarTema();

        atualizarUsuario();

        configurarScroll();

        configurarActiveSections();

        configurarReveals();

        configurarTooltips();

        configurarIndicadoresCarrossel();

        configurarChecklistSenha();

        configurarPerfil();

        configurarCompra();


        /*
         * Botão de tema
         */

        const themeToggle =
            document.getElementById(
                "themeToggle"
            );


        if (themeToggle) {

            themeToggle.addEventListener(
                "click",
                alternarTema
            );

        }

    }
);