# Zestest AI System Map
# Purpose: Highly dense, structured, and searchable context for LLMs/AI Assistants.
# Format: YAML-like markdown optimized for fast tokenization and retrieval.

system_info:
  name: "Zestest"
  architecture: "Client (Static HTML/JS) + Server (Cloudflare Workers/D1/R2)"

modules:
  auth_and_identity:
    description: "Handles user sessions, initial splash screen, and anonymous/registered identity."
    actions:
      - action_id: "init_app_splash"
        file: "client/static/js/splash/app.js"
        functions: ["App.init()"]
      - action_id: "login_and_identity"
        files: ["client/static/js/auth/identity_manager.js", "client/static/js/auth/auth.js"]
        functions: ["IdentityManager.init()", "Auth.login()"]
      - action_id: "local_storage_management"
        file: "client/static/js/storage/storage_manager.js"
        functions: ["StorageManager.save()", "StorageManager.load()"]
      - action_id: "backend_auth_validation"
        file: "server/src/routes/identity.ts"
        functions: ["identityRoutes.get('/me')", "getUserTier()"]

  dashboard_management:
    description: "Teacher/Admin interface for managing exams, starting wizard, and sharing."
    actions:
      - action_id: "render_dashboard_exams"
        files: ["client/static/js/dashboard/dashboard_ui.js", "client/static/js/dashboard/dashboard_render.js"]
        functions: ["DashboardUI.init()", "renderExamCards()"]
      - action_id: "manage_exam_state"
        file: "client/static/js/dashboard/dashboard_manager.js"
        functions: ["DashboardManager.toggleStatus()", "DashboardManager.deleteExam()"]
      - action_id: "start_create_exam_wizard"
        file: "client/static/js/dashboard/exam_wizard_logic.js"
        functions: ["ExamWizard.start()"]
      - action_id: "generate_share_link"
        file: "client/static/js/dashboard/referral_manager.js"
        functions: ["ReferralManager.generateLink()"]

  exam_creation_pipeline:
    description: "Step 1 (Input), Step 2 (Parsing/Audio), Step 3 (Formatting/Answers) -> Zip & Upload."
    actions:
      - action_id: "step1_parse_input_files"
        files: ["client/static/js/step1/step1_handler.js", "client/static/js/step1/input_handler/pdf_processor.js", "client/static/js/step1/input_handler/docx_processor.js"]
        functions: ["Step1Handler.processInput()"]
      - action_id: "step2_split_questions_and_audio"
        files: ["client/static/js/step2/step2_card_logic.js", "client/static/js/step2/audio_processor.js", "client/static/js/step2/preview_render.js"]
        functions: ["CardLogic.splitQuestions()", "AudioProcessor.slice()", "PreviewRender.render()"]
      - action_id: "step3_format_and_set_answers"
        files: ["client/static/js/step3/step3_controller.js", "client/static/js/step3/TypeChecker.js", "client/static/js/step3/UniversalNormalizer.js"]
        functions: ["Step3Controller.setupAnswers()", "TypeChecker.detect()", "UniversalNormalizer.clean()"]
      - action_id: "step3_ai_improve_text"
        file: "client/static/js/step3/improve.js"
        functions: ["ImproveHandler.autoFix()"]
      - action_id: "package_exam_to_zip"
        file: "client/static/js/dashboard/package_engine.js"
        functions: ["PackageEngine.zip()"]
      - action_id: "upload_exam_to_server"
        file: "client/static/js/dashboard/upload_handler.js"
        functions: ["UploadHandler.execute()"]

  student_exam_flow:
    description: "Logic for students taking the exam, UI rendering, real-time sync, and anti-cheat."
    actions:
      - action_id: "student_init_and_unzip"
        files: ["client/static/student/InitData.js", "client/static/student/ZestUnpackager.js"]
        functions: ["InitData.fetch()", "ZestUnpackager.extract()"]
      - action_id: "student_anti_cheat"
        file: "client/static/student/security_student.js"
        functions: ["SecurityMonitor.initBlurDetection()"]
      - action_id: "student_render_layout"
        file: "client/static/student/quiz_controller.js"
        functions: ["QuizController.init()", "QuizController._setupLayout()"]
      - action_id: "student_select_answer"
        file: "client/static/student/quiz_controller.js"
        functions: ["QuizController.save(qNum, val)"]
      - action_id: "student_play_audio"
        file: "client/static/student/quiz_controller.js"
        functions: ["AudioController.toggle()", "AudioController._loadAudio()"]
      - action_id: "student_view_grid_and_flag"
        files: ["client/static/student/stu_manager.js", "client/static/student/render_manager.js"]
        functions: ["StuManager.toggleFlag()", "RenderManager.update()"]
      - action_id: "student_submit_exam"
        files: ["client/static/student/submit_handler.js", "client/static/student/summary_manager.js"]
        functions: ["SubmitHandler.finish()", "SummaryManager.show()"]
      - action_id: "student_realtime_sync"
        file: "server/src/do/ExamRoom.ts"
        functions: ["ExamRoom.fetch()"]

  backend_server_api:
    description: "Cloudflare Workers routing, database operations (D1), object storage (R2)."
    actions:
      - action_id: "middleware_security_guard"
        file: "server/src/middlewares/guard.ts"
        functions: ["checkUserIdValid()"]
      - action_id: "api_exams_crud"
        file: "server/src/routes/exams.ts"
        functions: ["examsRoutes.post('/upload-package')", "examsRoutes.delete('/:exam_id')"]
      - action_id: "server_lazy_cleanup"
        file: "server/src/services/cleanup.ts"
        functions: ["cleanupExpiredExams()"]
      - action_id: "client_server_communication"
        files: ["client/static/js/server/server_comm.js", "client/static/js/server/receiver.js", "client/static/js/server/sender.js"]
        functions: ["ServerComm.post()", "Sender.wsSend()"]
