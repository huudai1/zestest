const UIManager = {
    isMobile: false,

    init() {
        this.checkDevice();
        window.addEventListener('resize', () => this.checkDevice());
        this.initThemeWithAnimation();
    },

    checkDevice() {
        this.isMobile = window.innerWidth <= 768;
        // Dùng classList.toggle để không ảnh hưởng đến các class khác như dark-mode
        document.body.classList.toggle('is-mobile', this.isMobile);
        document.body.classList.toggle('is-pc', !this.isMobile);
    },

    initThemeWithAnimation() {
        const body = document.body;

        // 1. LUÔN LUÔN ÁP DỤNG THEME TỪ LOCALSTORAGE (Trang nào cũng phải chạy đoạn này)
        if (localStorage.getItem('theme') === 'dark') {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }

        // 2. Tìm nút gạt (Chỉ trang Dashboard mới có)
        const toggle = document.getElementById('mode-toggle');
        if (!toggle) return; // Trang create_screen không có nút gạt thì dừng ở đây là chuẩn

        // Đồng bộ cái nút gạt với trạng thái hiện tại
        toggle.checked = body.classList.contains('dark-mode');

        const toggleWrapper = document.querySelector('.switch-container-header');
        const overlay = document.getElementById('card-overlay');
        const card = document.getElementById('flying-card');

        // 3. Logic Animation (Giữ nguyên của ông)
        toggle.addEventListener('change', () => {
            toggleWrapper.style.opacity = '0';
            toggleWrapper.style.pointerEvents = 'none';
            overlay.classList.add('animate-active');

            const isDark = toggle.checked;
            const changePoint = 1000; 

            if (isDark) {
                body.classList.add('dark-mode-pending');
                card.classList.add('flipping-to-dark');
                setTimeout(() => {
                    body.classList.add('dark-mode');
                    localStorage.setItem('theme', 'dark');
                }, changePoint);
            } else {
                body.classList.add('light-mode-pending');
                card.classList.add('flipping-to-light');
                setTimeout(() => {
                    body.classList.remove('dark-mode');
                    localStorage.setItem('theme', 'light');
                }, changePoint);
            }

            setTimeout(() => {
                overlay.classList.remove('animate-active');
                card.classList.remove('flipping-to-dark', 'flipping-to-light');
                toggleWrapper.style.opacity = '1';
                toggleWrapper.style.pointerEvents = 'auto';
                body.classList.remove('dark-mode-pending', 'light-mode-pending');
            }, 1800);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => UIManager.init());