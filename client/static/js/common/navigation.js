/**
 * FILE: js/navigation.js
 * Nhiệm vụ: Nhạc trưởng điều phối luồng trang, Onboarding và Sự kiện nút bấm.
 */

const Navigation = {
    // --- 1. QUẢN LÝ ONBOARDING (DÀNH CHO MẸ) ---
    closeStep2Intro(dontShowAgain) {
        const modal = document.getElementById('step2IntroModal');
        if (modal) modal.style.display = 'none';
        if (dontShowAgain) {
            localStorage.setItem('skipStep2Intro', 'true');
        }
    },

    checkStep2Onboarding() {
        const isSkipped = localStorage.getItem('skipStep2Intro');
        const modal = document.getElementById('step2IntroModal');
        if (!isSkipped && modal) {
            modal.style.display = 'flex';
        }
    },

    // --- 2. HÀM ĐIỀU HƯỚNG CHÍNH ---
    async showStep(stepNumber) {
        const stepPages = document.querySelectorAll(".step-page");
        
        // Load Meta để đảm bảo có data mới nhất trong RAM
        if (typeof StorageManager !== 'undefined') {
            await StorageManager.loadMeta();
        }

        // F5 Guard: Nếu chưa có tên đề mà đòi nhảy sang Bước 2/3 thì đẩy về Bước 1
        if (stepNumber > 1) {
            const hasName = StorageManager.examData && StorageManager.examData.name;
            if (!hasName) {
                console.warn("⚠️ [Navigation] Không tìm thấy tên đề trong RAM, thử nạp từ Disk...");
                await StorageManager.loadMeta();
                if (!StorageManager.examData || !StorageManager.examData.name) {
                    console.error("❌ [Navigation] Dữ liệu đề thi trống! Đang quay về Bước 1.");
                    stepNumber = 1; 
                }
            }
        }

        // Toggle UI hiển thị
        stepPages.forEach((page, index) => {
            const isActive = (index + 1 === stepNumber);
            page.style.display = isActive ? "block" : "none";
            isActive ? page.classList.add("active") : page.classList.remove("active");
        });

        // Lưu trạng thái bước hiện tại vào Session
        if (typeof SessionManager !== 'undefined') {
            SessionManager.setStep(stepNumber);
        }

        // Logic đặc biệt theo từng trang
        this.initStepLogic(stepNumber);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    initStepLogic(stepNumber) {
        switch (stepNumber) {
            case 1:
                const inputName = document.querySelector('#step1 .input-line[type="text"]');
                const inputTotal = document.querySelector('#step1 .input-line[type="number"]');
                if (inputName) inputName.value = StorageManager.examData.name || "";
                if (inputTotal) inputTotal.value = StorageManager.examData.totalQuestions || "";
                break;

            case 2:
                console.log("🛠️ [Navigation] Khởi tạo Bước 2...");
                if (typeof renderRangeList === "function") renderRangeList();
                if (typeof renderPreviewStep2 === "function") renderPreviewStep2();
                this.checkStep2Onboarding();
                break;

            case 3:
                console.log("🛠️ [Navigation] Khôi phục Bước 3...");
                if (typeof ABCD_ReadRange !== 'undefined') {
                    ABCD_ReadRange.renderInputs();
                }
                break;
        }
    },

    // --- 3. KHỞI TẠO SỰ KIỆN NÚT BẤM (GOM TỪ STEP HANDLERS) ---
initEventListeners() {
        // --- Nút Tiếp Bước 1 (Gán sự kiện từ Handler của Step 1) ---
        const btnNext1 = document.querySelector('.next1');
        if (btnNext1) {
            btnNext1.onclick = async (e) => {
                e.preventDefault();
                console.log("🖱️ [Navigation] Click Next Step 1");
                if (typeof Step1Handler !== 'undefined') {
                    const isDone = await Step1Handler.validateAndProcess();
                    if (isDone) this.showStep(2);
                }
            };
        }
        const btnCancel1 = document.querySelector('.prev1'); // Hoặc class nút Hủy của ông
        if (btnCancel1) {
            btnCancel1.onclick = (e) => {
                e.preventDefault();
            // Thay vì showStep(0) hay gì đó, ta mở luôn Modal xác nhận hủy
                if (typeof window.openCancelModal === 'function') {
                    window.openCancelModal();
                } else {
                    console.warn("⚠️ Không tìm thấy hàm openCancelModal");
                }
            };
        }

        // --- Các nút Bước 2 ---
        const btnPrev2 = document.querySelector('.prev2');
        const btnNext2 = document.querySelector('.next2');

        if (btnPrev2) btnPrev2.onclick = () => this.showStep(1);

        if (btnNext2) {
            btnNext2.onclick = async () => {
                const container = document.getElementById('abcd-fields-container');
                const preview = document.getElementById('abcd-preview-container');
                if (container) container.innerHTML = '';
                if (preview) preview.innerHTML = '';

                if (typeof ABCD_ReadRange !== 'undefined') {
                    await ABCD_ReadRange.renderInputs();
                }
                this.showStep(3);
            };
        }

        // --- Các nút Bước 3 ---
        const btnPrev3 = document.querySelector('.prev3');
        const btnNext3 = document.querySelector('.next3');
        if (btnPrev3) {
            btnPrev3.onclick = () => {
            console.log("🔙 [Navigation] Quay lại Bước 2 từ Bước 3");
            this.showStep(2);
            };
        }
        if (btnNext3) {
            btnNext3.onclick = async () => {
                if (typeof window.finishTest === 'function') {
                    const success = await window.finishTest();
                    if (success) {
                        // CHỖ NÀY QUAN TRỌNG: Không dùng window.location.href
                        // Gọi hàm show của bộ điều phối SPA (nằm trong index.html)
                        if (typeof window.showPage === 'function') {
                            window.showPage('dashboard-page'); 
                        } else {
                            // Backup nếu bạn đặt tên hàm khác trong index.html
                            document.getElementById('create-steps-page').style.display = 'none';
                            document.getElementById('dashboard-page').style.display = 'block';
                        }
                        
                        // Hiển thị thông báo thành công (Toast hoặc Alert)
                        console.log("✅ [System] Đã quay về Dashboard.");
                    }
                }
            };
        }
    },

    // --- 4. KHÔI PHỤC TRẠNG THÁI MODAL DỞ DANG ---
    restoreModalDraft() {
        const activeModalId = SessionManager.getActiveModal();
        if (activeModalId) {
            const draft = SessionManager.getModalDraft();
            if (draft) {
                const inputFrom = document.getElementById('input-from');
                const inputTo = document.getElementById('input-to');
                if(inputFrom) inputFrom.value = draft.fromQ;
                if(inputTo) inputTo.value = draft.toQ;
                
                if (typeof Step2CardLogic !== 'undefined') {
                    Step2CardLogic.editingId = draft.editingId;
                }

                const typeRadios = document.querySelectorAll('input[name="type"]');
                typeRadios.forEach(radio => {
                    const uiLabel = radio.nextElementSibling.innerText;
                    const currentKey = getSystemType(uiLabel);
                    if (currentKey === draft.typeKey) radio.checked = true;
                });

                if (activeModalId === 'answerInputModal' && typeof openAnswerInputModal === 'function') {
                    openAnswerInputModal(); 
                } else {
                    const modal = document.getElementById('typeSelectionModal');
                    if (modal) modal.style.display = 'flex';
                }
            }
        }
    }
};

// --- KHỞI CHẠY KHI TẢI TRANG ---
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Xác định bước khởi đầu
    let initialStep = 1;
    if (typeof SessionManager !== 'undefined') {
        initialStep = SessionManager.getStep();
    }

    // 3. Chạy điều hướng trang
    try {
        await Navigation.showStep(initialStep);
    } catch (e) {
        console.error("❌ [Navigation] Lỗi khi khôi phục bước:", e);
        await Navigation.showStep(1); // Fallback về Bước 1
    }

    // 4. Khôi phục Modal nếu có
    try { Navigation.restoreModalDraft(); } catch (e) {}

    // 5. Gán sự kiện cho các nút (QUAN TRỌNG: Luôn chạy cái này)
    Navigation.initEventListeners();
});

// Gán ra window để gọi từ HTML
window.closeStep2Intro = (val) => Navigation.closeStep2Intro(val);