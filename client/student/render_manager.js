const RenderManager = {
    timerInterval: null,

    async initView(isDetail = false) {
        console.log("RenderManager: Khởi tạo View...");
        
        // CHỈNH SỬA: Chọn container dựa trên trang hiện tại
        const selector = isDetail ? '.webp-placeholder' : '.webp-container';
        const container = document.querySelector(selector);
        
        if (!container) {
            console.error(`LỖI: Không tìm thấy selector '${selector}'`);
            return;
        }

        const webpData = await StorageManager.getWebP();

        if (webpData && webpData.length > 0) {
            container.innerHTML = ''; 
            const galleryWrapper = document.createElement('div');
            galleryWrapper.className = "pswp-gallery";
            galleryWrapper.id = isDetail ? "gallery-detail" : "gallery-exam";

            webpData.forEach((imgData) => {
                const imgUrl = imgData instanceof Blob ? URL.createObjectURL(imgData) : imgData;
                const a = document.createElement('a');
                a.href = imgUrl;
                a.setAttribute('data-pswp-width', '1500'); 
                a.setAttribute('data-pswp-height', '2000');
                
                const img = document.createElement('img');
                img.src = imgUrl;
                img.className = "webp-item";
                
                a.appendChild(img);
                galleryWrapper.appendChild(a);
            });
            
            container.appendChild(galleryWrapper);
            this.initPinchZoom(isDetail ? '#gallery-detail' : '#gallery-exam');
        } else {
            container.innerHTML = '<div class="error-msg">Không có dữ liệu ảnh đề thi.</div>';
        }
        
        if (!isDetail) {
            this.startCountdown();
            this.updateProgressHeader();
        }
    },

    initPinchZoom(galleryId) {
        const lightbox = new PhotoSwipeLightbox({
            gallery: galleryId,
            children: 'a',
            showHideAnimationType: 'zoom', 
            bgOpacity: 0.9,
            pswpModule: PhotoSwipe 
        });
        lightbox.init();
    },

    startCountdown() {
        const timerElement = document.getElementById('timer-text'); 
        const barTime = document.getElementById('bar-time');
        if (!timerElement) return;

        const meta = StorageManager.examData;
        let durationMins = parseInt(meta.duration) || 40;  
        let totalSeconds = durationMins * 60;
        let timeRemaining = totalSeconds;

        if (this.timerInterval) clearInterval(this.timerInterval);

        const updateDisplay = () => {
            if (timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                timerElement.innerText = "00:00";
                timerElement.classList.add('timer-timeout'); 
                if(barTime) barTime.style.width = '0%';
                return;
            }

            const m = Math.floor(timeRemaining / 60);
            const s = timeRemaining % 60;
            timerElement.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            
            // Tính % thanh thời gian thụt lùi
            if(barTime) {
                const percent = (timeRemaining / totalSeconds) * 100;
                barTime.style.width = `${percent}%`;
            }

            timeRemaining--;
        };

        updateDisplay();
        this.timerInterval = setInterval(updateDisplay, 1000);
    },
renderSmartSlides(activeIndex) {
    const isPC = window.innerWidth >= 768;
    const total = QuizController.totalQuestions;

    if (isPC) {
        // PC render hết luôn
        for (let i = 1; i <= total; i++) {
            QuizController.renderAnswerTemplate(i);
        }
    } else {
        // Mobile render lân cận để mượt
        for (let i = activeIndex; i <= activeIndex + 2; i++) {
            const qNum = i + 1;
            if (qNum <= total) QuizController.renderAnswerTemplate(qNum);
        }
    }
},
    updateProgressHeader() {
        const progressBar = document.getElementById('bar-progress');
        const progressText = document.getElementById('progress-text');
        const total = StorageManager.examData.totalQuestions || 0;
        
        // ĐẾM TRÊN stu_answer (Bài làm học sinh)
        const studentData = StorageManager.examData.stu_answer || [];
        const answeredCount = studentData.filter(a => a !== null && a !== "").length;
        
        if (progressText) progressText.innerText = `${answeredCount}/${total}`;
        
        if (progressBar && total > 0) {
            const percent = (answeredCount / total) * 100;
            progressBar.style.width = `${percent}%`;
            
            // Xanh đậm khi hoàn thành 100%
            progressBar.style.background = (answeredCount === total) ? '#27ae60' : 'rgba(46, 204, 113, 0.6)';
        }
    },

    updateAudioControl(questionNumber) {
        const playBtn = document.getElementById('audio-btn');
        if (!playBtn) return;

        const sections = Object.values(StorageManager.examData.sections || {});
        const currentSection = sections.find(sec => 
            questionNumber >= sec.range[0] && questionNumber <= sec.range[1]
        );

        if (currentSection && currentSection.audio) {
            playBtn.style.display = 'flex';
        } else {
            playBtn.style.display = 'none';
        }
    }
};