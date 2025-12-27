// Code existant
const menuIcon = document.getElementById("menu-icon");
const navLinks = document.querySelector(".nav-links");

menuIcon.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// Ajout des animations au défilement
document.addEventListener("DOMContentLoaded", function() {
    // Configuration de base de ScrollReveal
    const sr = ScrollReveal({
        origin: 'bottom',
        distance: '60px',
        duration: 1000,
        delay: 200,
        reset: true, // Mettre à true si vous voulez que l'animation se répète à chaque fois
    });

    // Animations spécifiques pour chaque section
    sr.reveal('.hero-content', {});
    sr.reveal('.stats .card', { interval: 200 }); // Chaque carte apparaît avec un délai de 200ms
    sr.reveal('.about-text', { origin: 'left' });
    sr.reveal('.about-design', { origin: 'right', delay: 400 });
    sr.reveal('.skill', { interval: 200 });
    sr.reveal('.project-card', { interval: 300 });
});

// Ajoutez à votre script.js
const themeIcon = document.getElementById("theme-icon");
const body = document.body;

// Vérifier s'il y a un thème sauvegardé
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    enableLightMode();
}

themeIcon.addEventListener("click", () => {
    if (body.classList.contains("light-mode")) {
        enableDarkMode();
    } else {
        enableLightMode();
    }
});

function enableLightMode() {
    body.classList.add("light-mode");
    themeIcon.classList.remove('bx-moon');
    themeIcon.classList.add('bx-sun');
    localStorage.setItem('theme', 'light');
}

function enableDarkMode() {
    body.classList.remove("light-mode");
    themeIcon.classList.remove('bx-sun');
    themeIcon.classList.add('bx-moon');
    localStorage.setItem('theme', 'dark');
}
// Ajoutez ce code à votre script.js
document.addEventListener("DOMContentLoaded", function() {
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const submitBtn = document.getElementById('submit-btn');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Modifier le texte du bouton
            submitBtn.textContent = "Envoi en cours...";
            submitBtn.disabled = true;
            
            // Afficher un message de confirmation
            formMessage.className = 'form-message success';
            formMessage.textContent = "Votre message a été envoyé avec succès!";
            
            // Ne pas empêcher la soumission du formulaire pour que FormSubmit fonctionne
            // Mais retarder légèrement la redirection pour que l'utilisateur voie le message
            setTimeout(function() {
                // Le formulaire sera soumis automatiquement après ce délai
            }, 2000); // 2 secondes de délai
        });
    }
});

// Animation des compétences supplémentaires
ScrollReveal().reveal('.scroll', {
    origin: 'bottom',
    distance: '40px',
    duration: 800,
    interval: 200,
    delay: 200,
    reset: false
    
});

// Design Gallery Lightbox Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize design gallery lightbox
    const designCards = document.querySelectorAll('.design-card');
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img class="lightbox-image" src="" alt="">
            <div class="lightbox-nav">
                <span class="lightbox-prev">&larr;</span>
                <span class="lightbox-next">&rarr;</span>
            </div>
            <div class="lightbox-caption"></div>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    let currentIndex = 0;
    const designs = Array.from(designCards).map(card => ({
        image: card.querySelector('.design-image').src,
        title: card.querySelector('.design-title').textContent,
        description: card.querySelector('.design-description').textContent,
        tools: card.querySelector('.design-tools').textContent
    }));

    // Open lightbox when clicking on a design card
    designCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            currentIndex = index;
            updateLightbox();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close lightbox
    closeBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Navigate between images
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + designs.length) % designs.length;
        updateLightbox();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % designs.length;
        updateLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        } else if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + designs.length) % designs.length;
            updateLightbox();
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % designs.length;
            updateLightbox();
        }
    });

    // Update lightbox content
    function updateLightbox() {
        const design = designs[currentIndex];
        lightboxImage.src = design.image;
        lightboxImage.alt = design.title;
        lightboxCaption.innerHTML = `
            <h3>${design.title}</h3>
            <p>${design.description}</p>
            <small>${design.tools}</small>
        `;
    }

    // Close when clicking outside image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ScrollReveal for design gallery
    const sr = ScrollReveal({
        origin: 'bottom',
        distance: '60px',
        duration: 1000,
        delay: 100,
        reset: false,
        mobile: true
    });

    sr.reveal('.design-card', { 
        interval: 150,
        scale: 0.9
    });
});