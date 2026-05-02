function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    // Lưu lại lựa chọn của giáo viên vào localStorage để lần sau vào web nó tự nhớ
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Chạy ngay khi load trang
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});