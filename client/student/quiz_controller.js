const QuizController = {
    currentQuestion: 1,
    swiper: null,
    totalQuestions: 0,
    isPC: false,
    _resizeTimer: null,
    _pcObserver: null,
    _resizeHandler: null,

    async init() {
        this.totalQuestions = StorageManager.examData.totalQuestions || 0;
        if (!StorageManager.examData.stu_answer) {
            StorageManager.examData.stu_answer = new Array(this.totalQuestions + 1).fill("");
        }

        this.isPC = window.innerWidth >= 768;
        this._setupLayout();
        this._listenResize();
    },

    // ====== RESIZE ======
    _listenResize() {
        // Bảo đảm chỉ register 1 lần duy nhất
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
        this._resizeHandler = () => {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(() => {
                const nowPC = window.innerWidth >= 768;
                if (nowPC === this.isPC) return;
                const savedQ = this.currentQuestion;
                this.isPC = nowPC;
                this._teardown();
                requestAnimationFrame(() => {
                    this._setupLayout();
                    this._restorePosition(savedQ);
                });
            }, 250);
        };
        window.addEventListener('resize', this._resizeHandler);
    },

    // ====== TEARDOWN ======
    _teardown() {
        // Hủy Swiper
        if (this.swiper) {
            this.swiper.destroy(true, true);
            this.swiper = null;
        }

        // Hủy IntersectionObserver
        if (this._pcObserver) {
            this._pcObserver.disconnect();
            this._pcObserver = null;
        }

        // Xóa PC list
        const pcList = document.getElementById('pc-answer-list');
        if (pcList) pcList.remove();

        // Xóa nội dung swiper wrapper + toàn bộ inline style Swiper để lại
        const wrapper = document.getElementById('main-wrapper');
        if (wrapper) {
            wrapper.innerHTML = '';
            wrapper.removeAttribute('style');
        }

        const swiperEl = document.querySelector('.answer-swiper');
        if (swiperEl) {
            swiperEl.removeAttribute('style');
            swiperEl.classList.remove(
                'swiper-initialized', 'swiper-horizontal',
                'swiper-vertical', 'swiper-backface-hidden'
            );
        }
    },

    // ====== APPLY STYLES — JS làm chủ hoàn toàn, không phụ thuộc CSS cascade ======
    _applyPCStyles() {
        const footer = document.querySelector('.fixed-footer');
        const swiperEl = document.querySelector('.answer-swiper');

        // Sidebar cuộn dọc
        if (footer) {
            footer.style.setProperty('flex', '0 0 380px', 'important');
            footer.style.setProperty('width', '380px', 'important');
            footer.style.setProperty('height', 'calc(100vh - 50px)', 'important');
            footer.style.setProperty('margin-top', '50px', 'important');
            footer.style.setProperty('overflow-y', 'auto', 'important');
            footer.style.setProperty('overflow-x', 'hidden', 'important');
            footer.style.setProperty('display', 'block', 'important');
            footer.style.setProperty('padding', '15px', 'important');
            footer.style.setProperty('box-sizing', 'border-box', 'important');
            footer.style.setProperty('background', '#121212', 'important');
            footer.style.setProperty('border-top', 'none', 'important');
            footer.style.setProperty('border-left', '1px solid #333', 'important');
        }

        // Ẩn Swiper
        if (swiperEl) swiperEl.style.setProperty('display', 'none', 'important');
    },

    _applyMobileStyles() {
        const footer = document.querySelector('.fixed-footer');
        const swiperEl = document.querySelector('.answer-swiper');

        // Thanh cố định dưới màn hình
        if (footer) {
            footer.style.setProperty('flex', '0 0 auto', 'important');
            footer.style.setProperty('width', '100%', 'important');
            footer.style.setProperty('height', '75px', 'important');
            footer.style.setProperty('margin-top', '0', 'important');
            footer.style.setProperty('overflow', 'hidden', 'important');
            footer.style.setProperty('display', 'block', 'important');
            footer.style.setProperty('padding', '0', 'important');
            footer.style.setProperty('box-sizing', 'border-box', 'important');
            footer.style.setProperty('background', 'rgba(18,18,18,0.85)', 'important');
            footer.style.setProperty('border-top', '1px solid rgba(255,255,255,0.05)', 'important');
            footer.style.setProperty('border-left', 'none', 'important');
        }

        // Hiện Swiper
        if (swiperEl) {
            swiperEl.style.removeProperty('display');
            swiperEl.style.setProperty('width', '100%', 'important');
            swiperEl.style.setProperty('height', '100%', 'important');
        }
    },

    // ====== SETUP LAYOUT ======
    _setupLayout() {
        if (this.isPC) {
            this._applyPCStyles();
            this._buildPCList();
        } else {
            this._applyMobileStyles();
            this._buildMobileSwiper();
        }

        for (let i = 1; i <= this.totalQuestions; i++) {
            this.renderAnswerTemplate(i);
        }
        this.updateUI(this.currentQuestion);
    },

    _buildPCList() {
        const footer = document.querySelector('.fixed-footer');
        let pcList = document.getElementById('pc-answer-list');
        if (!pcList) {
            pcList = document.createElement('div');
            pcList.id = 'pc-answer-list';
            pcList.className = 'pc-wrapper';
            footer.appendChild(pcList);
        }
        this.buildBlocks(pcList, 'pc-question-block');
        this._initPCObserver(footer);
    },

    _buildMobileSwiper() {
        const wrapper = document.getElementById('main-wrapper');
        if (wrapper) {
            this.buildBlocks(wrapper, 'swiper-slide');
            this._initSwiper();
        }
    },

    // ====== RESTORE ======
    _restorePosition(qNum) {
        if (this.isPC) {
            const block = document.querySelector(`.pc-question-block[data-qindex="${qNum}"]`);
            if (block) block.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            if (this.swiper) this.swiper.slideTo(qNum - 1, 0);
        }
        this.updateUI(qNum);
    },

    // ====== BUILD BLOCKS ======
    buildBlocks(container, className) {
        let html = '';
        for (let i = 1; i <= this.totalQuestions; i++) {
            const showLabel = this.isPC;
            // Thay đổi cấu trúc pc-q-label thành pc-q-header để chứa thêm nút Flag
            html += `<div class="${className}" data-qindex="${i}">
                <div class="pc-q-header" style="display:${showLabel ? 'flex' : 'none'};">
                    <div class="pc-q-label">Câu ${i}</div>
                    <button class="btn-flag-local" id="local-flag-${i}" onclick="StuManager.toggleFlag(${i})">🚩</button>
                </div>
                <div class="answer-area"></div>
            </div>`;
        }
        container.innerHTML = html;
    },

    // ====== RENDER ANSWERS ======
    renderAnswerTemplate(qNum) {
        const selector = this.isPC
            ? `#pc-answer-list .pc-question-block[data-qindex="${qNum}"] .answer-area`
            : `.swiper-slide[data-qindex="${qNum}"] .answer-area`;

        const container = document.querySelector(selector);
        if (!container) return;

        const sections = Object.values(StorageManager.examData.sections || {});
        const section = sections.find(sec => qNum >= sec.range[0] && qNum <= sec.range[1]);
        const type = section ? section.type.toLowerCase() : 'abcd';
        const studentAns = StorageManager.examData.stu_answer[qNum];

        let html = '';
        if (type === 'abcd') {
            html = `<div class="answer-grid grid-4">
                ${['A', 'B', 'C', 'D'].map(opt => `
                    <button class="ans-btn btn-${opt.toLowerCase()} ${studentAns === opt ? 'active' : ''}"
                            onclick="QuizController.save(${qNum}, '${opt}')">${opt}</button>
                `).join('')}
            </div>`;
        } else if (type === 'true_false') {
            html = `<div class="answer-grid grid-2">
                <button class="ans-btn btn-true ${studentAns === 'T' ? 'active' : ''}" onclick="QuizController.save(${qNum}, 'T')">T</button>
                <button class="ans-btn btn-false ${studentAns === 'F' ? 'active' : ''}" onclick="QuizController.save(${qNum}, 'F')">F</button>
            </div>`;
        } else {
            html = `<textarea class="essay-input" oninput="QuizController.save(${qNum}, this.value)" placeholder="Đáp án câu ${qNum}...">${studentAns || ''}</textarea>`;
        }
        container.innerHTML = html;
    },

    // ====== SAVE ======
    save(qNum, val) {
        StorageManager.examData.stu_answer[qNum] = val;
        StorageManager.saveMeta();
        if (typeof RenderManager !== 'undefined') RenderManager.updateProgressHeader();

        const selector = this.isPC
            ? `.pc-question-block[data-qindex="${qNum}"]`
            : `.swiper-slide[data-qindex="${qNum}"]`;
        const slide = document.querySelector(selector);
        if (slide) {
            slide.querySelectorAll('.ans-btn').forEach(btn => {
                btn.classList.toggle('active', btn.innerText.trim() === val);
            });
        }
    },

    // ====== PC SCROLL SYNC ======
    _initPCObserver(footer) {
        if (this._pcObserver) this._pcObserver.disconnect();
        this._pcObserver = new IntersectionObserver((entries) => {
            const visible = entries.find(e => e.isIntersecting && e.intersectionRatio >= 0.5);
            if (visible) {
                const qNum = parseInt(visible.target.dataset.qindex);
                if (qNum) this.updateUI(qNum);
            }
        }, { root: footer, threshold: 0.5 });
        document.querySelectorAll('.pc-question-block').forEach(b => this._pcObserver.observe(b));
    },

    // ====== SWIPER ======
    _initSwiper() {
        if (this.swiper) this.swiper.destroy(true, true);
        this.swiper = new Swiper('.answer-swiper', {
            touchEventsTarget: 'container',
            threshold: 5,
            touchRatio: 1,
            shortSwipes: true,
            longSwipesRatio: 0.3,
            followFinger: true,
            preventInteractionOnTransition: true,
            touchAngle: 45,
            on: {
                slideChange: () => this.updateUI(this.swiper.activeIndex + 1)
            }
        });
    },

    // ====== UPDATE UI ======
    updateUI(qNum) {
        this.currentQuestion = qNum;
        const view = document.getElementById('current-q-view');
        if (view) view.innerText = qNum;

        if (typeof RenderManager !== 'undefined') RenderManager.updateAudioControl(qNum);

        // THÊM DÒNG NÀY: Đồng bộ lại màu nút Header khi chuyển câu
        if (typeof StuManager !== 'undefined' && StuManager.syncFlagUI) {
            StuManager.syncFlagUI(qNum);
        }
    }
};

// ====== AUDIO CONTROLLER ======
const AudioController = {
    _audio: null,
    _panelOpen: false,

    // Bấm nút ▶ lần đầu → mở panel + play; sau đó toggle play/pause
    async toggle() {
        if (!this._panelOpen) {
            await this._openPanel();
        } else {
            this._togglePlayPause();
        }
    },

    async _openPanel() {
        this._panelOpen = true;

        // CẬP NHẬT: Chỉ ẩn nút play audio màu cam, giữ nguyên nút Thư mục và Nộp
        const audioBtn = document.getElementById('audio-btn');
        const panel = document.getElementById('audio-panel');

        if (audioBtn) audioBtn.style.display = 'none';
        if (panel) panel.classList.add('active');

        // Load audio nếu chưa có
        if (!this._audio) {
            await this._loadAudio();
        }

        // Bắt đầu phát ngay
        if (this._audio) {
            this._audio.play();
            const icon = document.getElementById('audio-panel-icon');
            if (icon) icon.innerHTML = '&#9646;&#9646;'; // ⏸
        }
    },

    collapse() {
        this._panelOpen = false;

        // CẬP NHẬT: Trả lại nút play audio màu cam khi đóng panel
        const audioBtn = document.getElementById('audio-btn');
        const panel = document.getElementById('audio-panel');

        if (panel) panel.classList.remove('active');
        if (audioBtn) audioBtn.style.display = '';

        if (this._audio) this._audio.pause();
    },

    _togglePlayPause() {
        if (!this._audio) return;
        const icon = document.getElementById('audio-panel-icon');
        if (this._audio.paused) {
            this._audio.play();
            if (icon) icon.innerHTML = '&#9646;&#9646;'; // ⏸
        } else {
            this._audio.pause();
            if (icon) icon.textContent = '▶';
        }
    },

    async _loadAudio() {
        const blob = await StorageManager.getAudio();
        if (!blob) return;

        if (this._audio) { this._audio.pause(); this._audio.src = ''; }

        this._audio = new Audio(URL.createObjectURL(blob));
        this._audio.preload = 'metadata';

        const seek = document.getElementById('audio-seek');
        const timeEl = document.getElementById('audio-time');

        this._audio.addEventListener('timeupdate', () => {
            if (!this._audio.duration) return;
            const pct = (this._audio.currentTime / this._audio.duration) * 100;
            if (seek) seek.value = pct;
            if (timeEl) timeEl.textContent = this._fmt(this._audio.currentTime);
        });

        this._audio.addEventListener('ended', () => {
            const icon = document.getElementById('audio-panel-icon');
            if (icon) icon.textContent = '▶';
        });
    },

    seek(pct) {
        if (!this._audio || !this._audio.duration) return;
        this._audio.currentTime = (pct / 100) * this._audio.duration;
    },

    _fmt(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    },

    onSectionChange(hasAudio) {
        if (!hasAudio && this._panelOpen) this.collapse();
    }
};