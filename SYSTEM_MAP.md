# Zestest System Map

Tài liệu này cung cấp cái nhìn tổng quan về kiến trúc và cấu trúc thư mục của hệ thống Zestest để giúp việc tìm kiếm, phát triển và cập nhật mã nguồn dễ dàng hơn.

## Cấu trúc tổng quan

Hệ thống được chia thành 2 phần chính hoạt động độc lập (tương ứng với Frontend và Backend):
- **`client/`**: Ứng dụng Frontend (Giao diện người dùng).
- **`server/`**: Ứng dụng Backend (API sử dụng Cloudflare Workers & Durable Objects).

---

## 1. Client (Frontend)
Thư mục: `client/`

Đây là nơi chứa toàn bộ giao diện người dùng (HTML, CSS) và logic tương tác của ứng dụng (JavaScript).

### Các tệp tin gốc
- `index.html`: Giao diện chính của ứng dụng (Thường là trang khởi đầu hoặc Dashboard cho Teacher/Admin).
- `coi-serviceworker.js`: Service worker xử lý Cross-Origin Isolation (cần thiết cho các tính năng bảo mật hoặc SharedArrayBuffer).
- `_headers`, `_redirects`: Các tệp cấu hình routing và HTTP Headers dùng khi triển khai lên Cloudflare Pages.

### Thư mục `client/static/`
Chứa tất cả các tài nguyên và mã nguồn logic của giao diện:

#### 1.1 `css/` (Stylesheets)
Nơi tập trung giao diện:
- `zestest-main.css`, `style.css`: Chứa style chính cho hầu hết các layout.
- `splash.css`: Style cho màn hình chờ/khởi động.
- `loading.css`, `card.css`, `improve.css`: Style dùng riêng cho một số component tĩnh lẻ.

#### 1.2 `js/` (Logic nghiệp vụ)
Được chia thành các module chức năng (theo thư mục):
- `auth/`: Xử lý đăng nhập, đăng ký và xác thực phiên.
- `common/`: Chứa các hàm tiện ích sử dụng chung (Utils).
- `dashboard/`: Logic quản lý bảng điều khiển chính.
- `effect/`: Xử lý các hiệu ứng đồ họa, hoạt ảnh hoặc âm thanh.
- `language/`: Quản lý đa ngôn ngữ (i18n).
- `server/`: Đóng gói các hàm gọi API xuống backend (Fetch requests).
- `splash/`: Logic kiểm soát màn hình khởi động đầu tiên.
- `storage/`: Xử lý lưu trữ trên trình duyệt (LocalStorage/SessionStorage).
- `step1/`, `step2/`, `step3/`: Chia luồng nghiệp vụ tạo/quản lý bài thi thành các bước rõ ràng (Step-by-step logic).

#### 1.3 `student/` (Luồng học sinh)
Giao diện và logic dành riêng cho học sinh làm bài thi (độc lập với trang tạo bài/admin):
- `index.html`: Entry point của giao diện bài thi cho học sinh.
- **Logic thi**: `quiz_controller.js`, `stu_manager.js`, `detail_manager.js`, `submit_handler.js`, `render_manager.js`.
- **Bảo mật thi**: `security_student.js` (chống gian lận).
- **CSS riêng**: `stu_quizz.css`, `detail.css`, `summary.css`.

---

## 2. Server (Backend)
Thư mục: `server/`

Backend đóng vai trò API Server, xử lý dữ liệu tập trung, được thiết kế theo cấu trúc Serverless (Cloudflare Workers) kết hợp TypeScript và Cloudflare D1 Database.

### Các tệp tin gốc
- `wrangler.toml`: Cấu hình cực kỳ quan trọng cho Cloudflare Worker. Định nghĩa tên ứng dụng, database binding (D1, KV, DO), biến môi trường.
- `schema.sql`: Tệp khởi tạo cấu trúc bảng (Tables) cho Database D1.
- `package.json`, `tsconfig.json`: Khai báo thư viện NPM và cấu hình biên dịch TypeScript.

### Thư mục `server/src/`
Đây là nơi chứa toàn bộ mã nguồn xử lý backend.

#### Điểm khởi tạo
- `index.ts`: File entry point của toàn bộ Worker, chịu trách nhiệm nhận HTTP Request, điều hướng routing cơ bản và trả về Response.
- `types.ts`: Định nghĩa các kiểu dữ liệu, interface (Types) TypeScript dùng chung cho toàn bộ server.

#### 2.1 `routes/` (Định tuyến API)
Nơi tiếp nhận và xử lý logic cho các endpoint API tương ứng:
- `exams.ts`: Các API CRUD và nghiệp vụ thao tác với bài thi, đề thi.
- `gifts.ts`: Các API liên quan đến phần thưởng, quà.
- `identity.ts`: Các API định danh (Đăng nhập, thông tin tài khoản).

#### 2.2 `services/` (Tầng nghiệp vụ, Dịch vụ)
Chứa các logic giao tiếp cơ sở dữ liệu:
- `storage.ts`: Chứa code thao tác trực tiếp với Database D1 hoặc các hệ thống lưu trữ khác của hệ thống.
- `cleanup.ts`: Logic dọn dẹp tài nguyên rác (v.d. xóa session cũ, bài thi hết hạn).

#### 2.3 `do/` (Durable Objects)
Tận dụng tính năng Durable Object (DO) của Cloudflare để xử lý trạng thái nhất quán và realtime:
- `ExamRoom.ts`: Quản lý "phòng thi". Có thể dùng để điều phối bài thi theo thời gian thực (giám sát, bảng xếp hạng realtime, hoặc đồng bộ trạng thái giữa nhiều thí sinh).

#### 2.4 `middlewares/`
Các tác vụ kiểm duyệt HTTP Request trước khi đưa vào các `routes/`. Ví dụ: Xác thực Access Token, CORS, Rate Limit, hoặc Logging.
