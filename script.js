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