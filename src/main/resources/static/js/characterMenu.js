function toggleMenu() {
    console.log('toggleMenu called');
    var menu = document.getElementById('character-menu');
    menu.classList.toggle('visible');
}

// Закрытие при клике вне меню
document.addEventListener('click', (e) => {
    if (!e.target.closest('#character-btn, #character-menu')) {
        document.getElementById('character-menu').style.display = 'none';
    }
});