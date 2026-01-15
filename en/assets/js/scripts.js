// Sticky header position on page scrolling up
const header = document.querySelector('.js-header');
const stickyClass = 'sticky';
let lastScrollTop = 0;
let isWaiting = false;

window.addEventListener('scroll', () => {
    if (!isWaiting) {
        window.requestAnimationFrame(() => {
            let currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

            if (currentScroll > lastScrollTop) {
                header.classList.remove(stickyClass);
            } else if (currentScroll < lastScrollTop && currentScroll > 0) {
                header.classList.add(stickyClass);
            } else if (currentScroll <= 0) {
                header.classList.remove(stickyClass);
            }

            lastScrollTop = currentScroll;
            isWaiting = false;
        });
        isWaiting = true;
    }
}, false);

// Dropdown menu
(function (menuConfig) {
    /**
     * Merge default config with the theme overrided ones
     */
    var defaultConfig = {
        // behaviour
        mobileMenuMode: 'overlay',
        animationSpeed: 300,
        submenuWidth: 300,
        doubleClickTime: 500,
        mobileMenuExpandableSubmenus: false,
        isHoverMenu: true,
        // selectors
        wrapperSelector: '.navbar',
        buttonSelector: '.navbar__toggle',
        menuSelector: '.navbar__menu',
        submenuSelector: '.navbar__submenu',
        mobileMenuSidebarLogoSelector: null,
        mobileMenuSidebarLogoUrl: null,
        relatedContainerForOverlayMenuSelector: null,
        // attributes 
        ariaButtonAttribute: 'aria-haspopup',
        // CSS classes
        separatorItemClass: 'is-separator',
        parentItemClass: 'has-submenu',
        submenuLeftPositionClass: 'is-left-submenu',
        submenuRightPositionClass: 'is-right-submenu',
        mobileMenuOverlayClass: 'navbar_mobile_overlay',
        mobileMenuSubmenuWrapperClass: 'navbar__submenu_wrapper',
        mobileMenuSidebarClass: 'navbar_mobile_sidebar',
        mobileMenuSidebarOverlayClass: 'navbar_mobile_sidebar__overlay',
        hiddenElementClass: 'is-hidden',
        openedMenuClass: 'is-active',
        noScrollClass: 'no-scroll',
        relatedContainerForOverlayMenuClass: 'is-visible'
    };

    var config = {};

    Object.keys(defaultConfig).forEach(function (key) {
        config[key] = defaultConfig[key];
    });

    if (typeof menuConfig === 'object') {
        Object.keys(menuConfig).forEach(function (key) {
            config[key] = menuConfig[key];
        });
    }

    /**
     * Menu initializer
     */
    function init() {
        if (!document.querySelectorAll(config.wrapperSelector).length) {
            return;
        }

        initSubmenuPositions();

        if (config.mobileMenuMode === 'overlay') {
            initMobileMenuOverlay();
        } else if (config.mobileMenuMode === 'sidebar') {
            initMobileMenuSidebar();
        }

        initClosingMenuOnClickLink();

        if (!config.isHoverMenu) {
            initAriaAttributes();
        }
    };

    /**
     * Function responsible for the submenu positions
     */
    function initSubmenuPositions() {
        var submenuParents = document.querySelectorAll(config.wrapperSelector + ' .' + config.parentItemClass);

        for (var i = 0; i < submenuParents.length; i++) {
            var eventTrigger = config.isHoverMenu ? 'mouseenter' : 'click';

            submenuParents[i].addEventListener(eventTrigger, function () {
                var submenu = this.querySelector(config.submenuSelector);
                var itemPosition = this.getBoundingClientRect().left;
                var widthMultiplier = 2;

                if (this.parentNode === document.querySelector(config.menuSelector)) {
                    widthMultiplier = 1;
                }

                if (config.submenuWidth !== 'auto') {
                    var submenuPotentialPosition = itemPosition + (config.submenuWidth * widthMultiplier);

                    if (window.innerWidth < submenuPotentialPosition) {
                        submenu.classList.remove(config.submenuLeftPositionClass);
                        submenu.classList.add(config.submenuRightPositionClass);
                    } else {
                        submenu.classList.remove(config.submenuRightPositionClass);
                        submenu.classList.add(config.submenuLeftPositionClass);
                    }
                } else {
                    var submenuPotentialPosition = 0;
                    var submenuPosition = 0;

                    if (widthMultiplier === 1) {
                        submenuPotentialPosition = itemPosition + submenu.clientWidth;
                    } else {
                        submenuPotentialPosition = itemPosition + this.clientWidth + submenu.clientWidth;
                    }

                    if (window.innerWidth < submenuPotentialPosition) {
                        submenu.classList.remove(config.submenuLeftPositionClass);
                        submenu.classList.add(config.submenuRightPositionClass);
                        submenuPosition = -1 * submenu.clientWidth;
                        submenu.removeAttribute('style');

                        if (widthMultiplier === 1) {
                            submenuPosition = 0;
                            submenu.style.right = submenuPosition + 'px';
                        } else {
                            submenu.style.right = this.clientWidth + 'px';
                        }
                    } else {
                        submenu.classList.remove(config.submenuRightPositionClass);
                        submenu.classList.add(config.submenuLeftPositionClass);
                        submenuPosition = this.clientWidth;

                        if (widthMultiplier === 1) {
                            submenuPosition = 0;
                        }

                        submenu.removeAttribute('style');
                        submenu.style.left = submenuPosition + 'px';
                    }
                }

                submenu.setAttribute('aria-hidden', false);
            });

            if (config.isHoverMenu) {
                submenuParents[i].addEventListener('mouseleave', function () {
                    var submenu = this.querySelector(config.submenuSelector);
                    submenu.removeAttribute('style');
                    submenu.setAttribute('aria-hidden', true);
                });
            }
        }
    }

    /**
     * Function used to init mobile menu - overlay mode
     */
    function initMobileMenuOverlay() {
        var menuWrapper = document.createElement('div');
        menuWrapper.classList.add(config.mobileMenuOverlayClass);
        menuWrapper.classList.add(config.hiddenElementClass);
        var menuContentHTML = document.querySelector(config.menuSelector).outerHTML;
        menuWrapper.innerHTML = menuContentHTML;
        document.body.appendChild(menuWrapper);

        // Init toggle submenus
        if (config.mobileMenuExpandableSubmenus) {
            wrapSubmenusIntoContainer(menuWrapper);
            initToggleSubmenu(menuWrapper);
        } else {
            setAriaForSubmenus(menuWrapper);
        }

        // Init button events
        var button = document.querySelector(config.buttonSelector);

        button.addEventListener('click', function () {
            var relatedContainer = document.querySelector(config.relatedContainerForOverlayMenuSelector);
            menuWrapper.classList.toggle(config.hiddenElementClass);
            button.classList.toggle(config.openedMenuClass);
            button.setAttribute(config.ariaButtonAttribute, button.classList.contains(config.openedMenuClass));

            if (button.classList.contains(config.openedMenuClass)) {
                document.documentElement.classList.add(config.noScrollClass);

                if (relatedContainer) {
                    relatedContainer.classList.add(config.relatedContainerForOverlayMenuClass);
                }
            } else {
                document.documentElement.classList.remove(config.noScrollClass);

                if (relatedContainer) {
                    relatedContainer.classList.remove(config.relatedContainerForOverlayMenuClass);
                }
            }
        });
    }

    /**
     * Function used to init mobile menu - sidebar mode
     */
    function initMobileMenuSidebar() {
        // Create menu structure
        var menuWrapper = document.createElement('div');
        menuWrapper.classList.add(config.mobileMenuSidebarClass);
        menuWrapper.classList.add(config.hiddenElementClass);
        var menuContentHTML = '';

        if (config.mobileMenuSidebarLogoSelector !== null) {
            menuContentHTML = document.querySelector(config.mobileMenuSidebarLogoSelector).outerHTML;
        } else if (config.mobileMenuSidebarLogoUrl !== null) {
            menuContentHTML = '<img src="' + config.mobileMenuSidebarLogoUrl + '" alt="" />';
        }

        menuContentHTML += document.querySelector(config.menuSelector).outerHTML;
        menuWrapper.innerHTML = menuContentHTML;

        var menuOverlay = document.createElement('div');
        menuOverlay.classList.add(config.mobileMenuSidebarOverlayClass);
        menuOverlay.classList.add(config.hiddenElementClass);

        document.body.appendChild(menuOverlay);
        document.body.appendChild(menuWrapper);

        // Init toggle submenus
        if (config.mobileMenuExpandableSubmenus) {
            wrapSubmenusIntoContainer(menuWrapper);
            initToggleSubmenu(menuWrapper);
        } else {
            setAriaForSubmenus(menuWrapper);
        }

        // Menu events
        menuWrapper.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        menuOverlay.addEventListener('click', function () {
            menuWrapper.classList.add(config.hiddenElementClass);
            menuOverlay.classList.add(config.hiddenElementClass);
            button.classList.remove(config.openedMenuClass);
            button.setAttribute(config.ariaButtonAttribute, false);
            document.documentElement.classList.remove(config.noScrollClass);
        });

        // Init button events
        var button = document.querySelector(config.buttonSelector);

        button.addEventListener('click', function () {
            menuWrapper.classList.toggle(config.hiddenElementClass);
            menuOverlay.classList.toggle(config.hiddenElementClass);
            button.classList.toggle(config.openedMenuClass);
            button.setAttribute(config.ariaButtonAttribute, button.classList.contains(config.openedMenuClass));
            document.documentElement.classList.toggle(config.noScrollClass);
        });
    }

    /**
     * Set aria-hidden="false" for submenus
     */
    function setAriaForSubmenus(menuWrapper) {
        var submenus = menuWrapper.querySelectorAll(config.submenuSelector);

        for (var i = 0; i < submenus.length; i++) {
            submenus[i].setAttribute('aria-hidden', false);
        }
    }

    /**
     * Wrap all submenus into div wrappers
     */
    function wrapSubmenusIntoContainer(menuWrapper) {
        var submenus = menuWrapper.querySelectorAll(config.submenuSelector);

        for (var i = 0; i < submenus.length; i++) {
            var submenuWrapper = document.createElement('div');
            submenuWrapper.classList.add(config.mobileMenuSubmenuWrapperClass);
            submenus[i].parentNode.insertBefore(submenuWrapper, submenus[i]);
            submenuWrapper.appendChild(submenus[i]);
        }
    }

    /**
     * Initialize submenu toggle events
     */
    function initToggleSubmenu(menuWrapper) {
        // Init parent menu item events
        var parents = menuWrapper.querySelectorAll('.' + config.parentItemClass);

        for (var i = 0; i < parents.length; i++) {
            // Add toggle events
            parents[i].addEventListener('click', function (e) {
                e.stopPropagation();
                var submenu = this.querySelector('.' + config.mobileMenuSubmenuWrapperClass);
                var content = submenu.firstElementChild;

                if (submenu.classList.contains(config.openedMenuClass)) {
                    var height = content.clientHeight;
                    submenu.style.height = height + 'px';

                    setTimeout(function () {
                        submenu.style.height = '0px';
                    }, 0);

                    setTimeout(function () {
                        submenu.removeAttribute('style');
                        submenu.classList.remove(config.openedMenuClass);
                    }, config.animationSpeed);

                    content.setAttribute('aria-hidden', true);
                    content.parentNode.firstElementChild.setAttribute('aria-expanded', false);
                } else {
                    var height = content.clientHeight;
                    submenu.classList.add(config.openedMenuClass);
                    submenu.style.height = '0px';

                    setTimeout(function () {
                        submenu.style.height = height + 'px';
                    }, 0);

                    setTimeout(function () {
                        submenu.removeAttribute('style');
                    }, config.animationSpeed);

                    content.setAttribute('aria-hidden', false);
                    content.parentNode.firstElementChild.setAttribute('aria-expanded', true);
                }
            });

            // Block links
            var childNodes = parents[i].children;

            for (var j = 0; j < childNodes.length; j++) {
                if (childNodes[j].tagName === 'A') {
                    childNodes[j].addEventListener('click', function (e) {
                        var lastClick = parseInt(this.getAttribute('data-last-click'), 10);
                        var currentTime = +new Date();

                        if (isNaN(lastClick)) {
                            e.preventDefault();
                            this.setAttribute('data-last-click', currentTime);
                        } else if (lastClick + config.doubleClickTime <= currentTime) {
                            e.preventDefault();
                            this.setAttribute('data-last-click', currentTime);
                        } else if (lastClick + config.doubleClickTime > currentTime) {
                            e.stopPropagation();
                            closeMenu(this, true);
                        }
                    });
                }
            }
        }
    }

    /**
     * Set aria-* attributes according to the current activity state
     */
    function initAriaAttributes() {
        var allAriaElements = document.querySelectorAll(config.wrapperSelector + ' ' + '*[aria-hidden]');

        for (var i = 0; i < allAriaElements.length; i++) {
            var ariaElement = allAriaElements[i];

            if (
                ariaElement.parentNode.classList.contains('active') ||
                ariaElement.parentNode.classList.contains('active-parent')
            ) {
                ariaElement.setAttribute('aria-hidden', 'false');
                ariaElement.parentNode.firstElementChild.setAttribute('aria-expanded', true);
            } else {
                ariaElement.setAttribute('aria-hidden', 'true');
                ariaElement.parentNode.firstElementChild.setAttribute('aria-expanded', false);
            }
        }
    }

    /**
     * Close menu on click link
     */
    function initClosingMenuOnClickLink() {
        var links = document.querySelectorAll(config.menuSelector + ' a');

        for (var i = 0; i < links.length; i++) {
            if (links[i].parentNode.classList.contains(config.parentItemClass)) {
                continue;
            }

            links[i].addEventListener('click', function (e) {
                closeMenu(this, false);
            });
        }
    }

    /**
     * Close menu
     */
    function closeMenu(clickedLink, forceClose) {
        if (forceClose === false) {
            if (clickedLink.parentNode.classList.contains(config.parentItemClass)) {
                return;
            }
        }

        var relatedContainer = document.querySelector(config.relatedContainerForOverlayMenuSelector);
        var button = document.querySelector(config.buttonSelector);
        var menuWrapper = document.querySelector('.' + config.mobileMenuOverlayClass);

        if (!menuWrapper) {
            menuWrapper = document.querySelector('.' + config.mobileMenuSidebarClass);
        }

        menuWrapper.classList.add(config.hiddenElementClass);
        button.classList.remove(config.openedMenuClass);
        button.setAttribute(config.ariaButtonAttribute, false);
        document.documentElement.classList.remove(config.noScrollClass);

        if (relatedContainer) {
            relatedContainer.classList.remove(config.relatedContainerForOverlayMenuClass);
        }

        var menuOverlay = document.querySelector('.' + config.mobileMenuSidebarOverlayClass);

        if (menuOverlay) {
            menuOverlay.classList.add(config.hiddenElementClass);
        }
    }

    /**
     * Run menu scripts 
     */
    init();
})(window.publiiThemeMenuConfig);

// Load search input area
const searchButton = document.querySelector('.js-search-btn');
const searchOverlay = document.querySelector('.js-search-overlay');
const searchInput = document.querySelector('input[type="search"]');

if (searchButton && searchOverlay && searchInput) {
    searchButton.addEventListener('click', (event) => {
        event.stopPropagation();
        searchOverlay.classList.toggle('expanded');

        if (searchOverlay.classList.contains('expanded')) {
            setTimeout(() => {
                searchInput.focus();
            }, 60);
        }
    });

    searchOverlay.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    document.body.addEventListener('click', () => {
        searchOverlay.classList.remove('expanded');
    });
}


// Share buttons pop-up
(function () {
    // share popup
    const shareButton = document.querySelector('.js-content__share-button');
    const sharePopup = document.querySelector('.js-content__share-popup');

    if (shareButton && sharePopup) {
        sharePopup.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        shareButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            sharePopup.classList.toggle('is-visible');
        });

        document.body.addEventListener('click', function () {
            sharePopup.classList.remove('is-visible');
        });
    }

    // link selector and pop-up window size
    const Config = {
        Link: ".js-share",
        Width: 500,
        Height: 500
    };

    // add handler to links
    const shareLinks = document.querySelectorAll(Config.Link);
    shareLinks.forEach(link => {
        link.addEventListener('click', PopupHandler);
    });

    // create popup
    function PopupHandler(e) {
        e.preventDefault();

        const target = e.target.closest(Config.Link);
        if (!target) return;

        // hide share popup
        if (sharePopup) {
            sharePopup.classList.remove('is-visible');
        }

        // popup position
        const px = Math.floor((window.innerWidth - Config.Width) / 2);
        const py = Math.floor((window.innerHeight - Config.Height) / 2);

        // open popup
        const linkHref = target.href;
        const popup = window.open(linkHref, "social", `
            width=${Config.Width},
            height=${Config.Height},
            left=${px},
            top=${py},
            location=0,
            menubar=0,
            toolbar=0,
            status=0,
            scrollbars=1,
            resizable=1
        `);

        if (popup) {
            popup.focus();
        }
    }
})();

// Back to top
document.addEventListener('DOMContentLoaded', () => {
    const backToTopButton = document.getElementById('backToTop');

    if (backToTopButton) {
        const backToTopScrollFunction = () => {
            if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
                backToTopButton.classList.add('is-visible');
            } else {
                backToTopButton.classList.remove('is-visible');
            }
        };

        const backToTopFunction = () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };

        window.addEventListener('scroll', backToTopScrollFunction);
        backToTopButton.addEventListener('click', backToTopFunction);
    }
});


// Responsive embeds script
(function () {
    let wrappers = document.querySelectorAll('.post__video, .post__iframe');

    for (let i = 0; i < wrappers.length; i++) {
        let embed = wrappers[i].querySelector('iframe, embed, video, object');

        if (!embed) {
            continue;
        }

        if (embed.getAttribute('data-responsive') === 'false') {
            continue;
        }

        let w = embed.getAttribute('width');
        let h = embed.getAttribute('height');
        let ratio = false;

        if (!w || !h) {
            continue;
        }

        if (w.indexOf('%') > -1 && h.indexOf('%') > -1) { // percentage mode
            w = parseFloat(w.replace('%', ''));
            h = parseFloat(h.replace('%', ''));
            ratio = h / w;
        } else if (w.indexOf('%') === -1 && h.indexOf('%') === -1) { // pixels mode
            w = parseInt(w, 10);
            h = parseInt(h, 10);
            ratio = h / w;
        }

        if (ratio !== false) {
            let ratioValue = (ratio * 100) + '%';
            wrappers[i].setAttribute('style', '--embed-aspect-ratio:' + ratioValue);
        }
    }
})();

document.addEventListener('DOMContentLoaded', function () {
    const loader = document.querySelector('.intro-loader');
    const logo = document.querySelector('.intro-logo');
    const path = window.location.pathname;
    const isHomePage = path.endsWith('/') || path.endsWith('/index.html');

    if (loader && logo && isHomePage) {
        document.body.classList.replace('loading-page-template', 'page-template');
        setTimeout(() => {
            logo.style.transition = 'all 0.6s ease';
            logo.style.transform = 'translateY(-50px)';
            logo.style.opacity = '0';

            setTimeout(() => {
                loader.style.transition = 'opacity 0.5s ease';
                loader.style.opacity = '0';

                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 600);
        }, 1000); 
    } else if (loader) {
        if (loader) loader.remove();
        setTimeout(() => {
            document.body.classList.replace('loading-page-template', 'page-template');
        }, 1);  
    }
});

/* barre d'avencement */

document.addEventListener('DOMContentLoaded', function () {
  var progressHeightMin = 50;

  var progressWrap = document.createElement('div');
  progressWrap.className = 'reading-progress fixed';

  var progressBar = document.createElement('div');
  progressBar.className = 'reading-progress__bar';
  progressWrap.appendChild(progressBar);

  document.body.appendChild(progressWrap);

  var ticking = false;

  function updateProgress() {
    var doc = document.documentElement;
    var scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    var scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    var clientHeight = window.innerHeight;
    var maxScroll = scrollHeight - clientHeight;

    if (maxScroll < progressHeightMin) {
      progressWrap.classList.add('hidden');
      progressBar.style.width = '0%';
      return;
    } else {
      progressWrap.classList.remove('hidden');
    }

    var percent = Math.min(100, (scrollTop / maxScroll) * 100);
    progressBar.style.width = percent + "%";

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateProgress);
  window.addEventListener('load', function () {
    setTimeout(updateProgress, 50);
  });

  updateProgress();
});

/**
 * Intégration du formulaire de contact avec l'API
 * Pour le site ISYmap
 *
 * À ajouter dans votre fichier HTML ou scripts.min.js
 */

// Configuration de l'API
const CONTACT_API_URL = "https://mailapi.isymap.com/";

// État du formulaire
let isSubmitting = false;

// Fonction d'initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        console.log('Formulaire de contact détecté - Initialisation...');

        // Empêcher le comportement par défaut du formulaire
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});

/**
 * Gestion de la soumission du formulaire
 */
async function handleFormSubmit(event) {
    event.preventDefault(); // Empêcher le rechargement de la page

    // Éviter les doubles soumissions
    if (isSubmitting) {
        console.log('Soumission déjà en cours...');
        return;
    }

    const form = event.target;
    const submitButton = form.querySelector('.contact-from-envoyer');
    const originalButtonText = submitButton.textContent;
    // ---- reCAPTCHA v3 ----
    const recaptchaToken = await grecaptcha.execute('6Lek4CAsAAAAAMJmjs-21-JBevAZTk21Jy35f5aP', { action: 'contact' });

    // Récupérer les données du formulaire
    const formData = {
        name: form.nom.value.trim(),
        email: form.email.value.trim(),
        subject: `Contact depuis le site ISYmap`,
        message: constructMessage(form),
        // Ajouter dans les données envoyées
        recaptcha_token : recaptchaToken
    };

    // Validation côté client
    if (!validateForm(formData)) {
        return;
    }

    // Désactiver le bouton et afficher un loader
    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours...';
    submitButton.classList.add('loading');

    try {
        // Envoi de la requête à l'API
        const response = await fetch(`${CONTACT_API_URL}contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Succès
            showSuccessMessage();
            form.reset();
        } else {
            // Erreur de validation ou contenu suspect
            if (response.status === 400) {
                showErrorMessage('Votre message n\'a pas pu être envoyé. Veuillez vérifier le contenu et réessayer.');
            } else if (response.status === 422) {
                showErrorMessage('Certains champs ne sont pas correctement remplis. Veuillez vérifier vos informations.');
            } else {
                showErrorMessage('Une erreur est survenue lors de l\'envoi. Veuillez réessayer plus tard.');
            }
            console.error('Erreur API:', data);
        }

    } catch (error) {
        // Erreur réseau ou autre
        console.error('Erreur lors de l\'envoi:', error);
        showErrorMessage('Impossible de contacter le serveur. Veuillez vérifier votre connexion internet et réessayer.');
    } finally {
        // Réactiver le bouton
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        submitButton.classList.remove('loading');
    }
}

/**
 * Construire le message complet avec tous les champs
 */
function constructMessage(form) {
    const nom = form.nom.value.trim();
    const prenom = form.prenom.value.trim();
    const societe = form.societe.value.trim();
    const message = form.message.value.trim();

    let fullMessage = '';

    // Informations de contact
    if (nom || prenom) {
        fullMessage += `Nom complet: ${nom}${prenom ? ' ' + prenom : ''}\n`;
    }

    if (societe) {
        fullMessage += `Société: ${societe}\n`;
    }

    fullMessage += '\n--- Message ---\n\n';
    fullMessage += message;

    return fullMessage;
}

/**
 * Validation côté client
 */
function validateForm(formData) {
    // Vérifier que les champs requis sont remplis
    if (!formData.name || formData.name.length < 2) {
        showErrorMessage('Le nom doit contenir au moins 2 caractères.');
        return false;
    }

    if (!formData.email || !isValidEmail(formData.email)) {
        showErrorMessage('Veuillez entrer une adresse email valide.');
        return false;
    }

    if (!formData.message || formData.message.length < 10) {
        showErrorMessage('Le message doit contenir au moins 10 caractères.');
        return false;
    }

    return true;
}

/**
 * Validation du format email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Afficher un message de succès
 */
function showSuccessMessage() {
    const form = document.getElementById('contact-form');
    const formContainer = form.closest('.contact-form-container');

    // Créer le message de succès
    const successMessage = document.createElement('div');
    successMessage.className = 'contact-success-message';
    successMessage.innerHTML = `
        <div class="alert alert-success" role="alert">
            <h4>✅ Message envoyé avec succès !</h4>
            <p>Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.</p>
        </div>
    `;

    // Insérer le message avant le formulaire
    formContainer.insertBefore(successMessage, form);

    // Faire défiler vers le message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Masquer le formulaire temporairement
    form.style.opacity = '0.5';

    // Supprimer le message après 10 secondes
    setTimeout(() => {
        successMessage.remove();
        form.style.opacity = '1';
    }, 10000);
}

/**
 * Afficher un message d'erreur
 */
function showErrorMessage(message) {
    const form = document.getElementById('contact-form');
    const formContainer = form.closest('.contact-form-container');

    // Supprimer les anciens messages d'erreur
    const oldErrors = formContainer.querySelectorAll('.contact-error-message');
    oldErrors.forEach(error => error.remove());

    // Créer le message d'erreur
    const errorMessage = document.createElement('div');
    errorMessage.className = 'contact-error-message';
    errorMessage.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <h4>❌ Erreur</h4>
            <p>${message}</p>
        </div>
    `;

    // Insérer le message avant le formulaire
    formContainer.insertBefore(errorMessage, form);

    // Faire défiler vers le message
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Supprimer le message après 8 secondes
    setTimeout(() => {
        errorMessage.remove();
    }, 8000);
}

/**
 * Vérifier la disponibilité de l'API (optionnel)
 */
async function checkAPIHealth() {
    try {
        const response = await fetch(`${CONTACT_API_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            console.log('✅ API de contact disponible');
            return true;
        } else {
            console.warn('⚠️ API de contact ne répond pas correctement');
            return false;
        }
    } catch (error) {
        console.error('❌ API de contact inaccessible:', error);
        return false;
    }
}

// Vérifier l'API au chargement (optionnel - pour debug)
// checkAPIHealth();

// Arret fenetre modal

$('#exampleModal').on('hidden.bs.modal', function () {
  $('#youtubeVideo').attr('src', '');
});

$('#exampleModal').on('show.bs.modal', function () {
  $('#youtubeVideo').attr('src', $('#youtubeVideo').data('src'));
});

modal.addEventListener('hidden.bs.modal', () => {
  console.log('MODALE FERMÉE');
});