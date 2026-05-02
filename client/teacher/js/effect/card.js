const toggle = document.getElementById('mode-toggle');
// Sửa lại: Lấy container của nút dựa theo class bạn đã đặt
const toggleWrapper = document.querySelector('.switch-container-header'); 
const overlay = document.getElementById('card-overlay');
const card = document.getElementById('flying-card');
const body = document.body;

toggle.addEventListener('change', function() {
    // 1. Ẩn nút gạt để tránh bấm trùng lặp
    toggleWrapper.style.opacity = '0';
    toggleWrapper.style.pointerEvents = 'none';

    // 2. Kích hoạt hiệu ứng
    overlay.classList.add('animate-active');
    
    const changePoint = 450; 

    if (this.checked) {
        body.classList.add('dark-mode-pending');
        card.classList.add('flipping-to-dark');
        
        setTimeout(() => {
            body.className = 'dark-mode'; 
        }, changePoint);
    } else {
        body.classList.add('light-mode-pending');
        card.classList.add('flipping-to-light');
        
        setTimeout(() => {
            body.className = 'light-mode';
        }, changePoint);
    }

    // 3. Kết thúc: Reset
    setTimeout(() => {
        overlay.classList.remove('animate-active');
        card.classList.remove('flipping-to-dark', 'flipping-to-light');
        toggleWrapper.style.opacity = '1';
        toggleWrapper.style.pointerEvents = 'auto';
        body.classList.remove('dark-mode-pending', 'light-mode-pending');
    }, 1800); 
});