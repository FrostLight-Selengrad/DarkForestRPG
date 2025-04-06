function toggleMenu() {
    const menu = document.getElementById('character-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Закрытие при клике вне меню
document.addEventListener('click', (e) => {
    if (!e.target.closest('#character-btn, #character-menu')) {
        document.getElementById('character-menu').style.display = 'none';
    }
});