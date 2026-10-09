# BUDDY TRAINING HUB - HỆ THỐNG ĐIỂM DANH & NỘP BÀI TẬP
**Khách hàng:** Bệnh viện Đa khoa Phương Đông  
**Đơn vị thực hiện:** Công ty Buddy  

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **Giao diện Học viên (Mobile-First)**:
   - Thao tác siêu tốc dưới 10 giây.
   - Nhập mã định danh 6 ký tự (VD: `K7M4PX`), tự động nhận diện Họ tên, Chức danh, Khoa/Phòng.
   - Không cần tài khoản/mật khẩu, tự động ghi nhớ phiên.
   - Điểm danh Check-in đầu giờ & Check-out cuối giờ.
   - Trang cá nhân theo dõi tiến độ chuyên cần 4 buổi học.
   - Nộp bài tập tại lớp & sau đào tạo (qua Link Google Docs/Canva hoặc Tải file tài liệu).

2. **Giao diện Giảng viên & Hội trường (Projector Live Board)**:
   - Màn hình chiếu trực tiếp hiển thị mã QR kích thước lớn và mã buổi nhập tay.
   - Bộ đếm sĩ số realtime và danh sách học viên có mặt cập nhật liên tục.
   - Nút Mở/Đóng cổng Check-in và Check-out.
   - Điểm danh hộ / sửa điểm danh thủ công có lưu lý do và nhật ký Audit Log.

3. **Giao diện Quản trị & Chấm bài (Admin Dashboard)**:
   - Import danh sách học viên từ Excel (`.xlsx`), kiểm tra lỗi dòng và sinh mã tự động.
   - Cấp lại mã học viên khi bị quên/lộ.
   - Màn hình chấm bài (Split View) xem trực tiếp file/link, gửi nhận xét và xếp loại.
   - Xuất file Excel báo cáo tổng hợp chuyên cần và bài tập.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### 1. Cài đặt và khởi chạy:
```bash
# Cài đặt thư viện (nếu chưa có)
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```
Truy cập hệ thống tại: `http://localhost:3000`

---

## 🔑 TÀI KHOẢN & MÃ TRUY CẬP MẪU

### 1. Tài khoản Giảng viên / Quản trị viên (Admin):
* **URL:** `http://localhost:3000/admin/login`
* **Email:** `admin@buddy.edu.vn`
* **Mật khẩu:** `BuddyAdmin@2026`

### 2. Danh sách Mã Học viên mẫu (Dùng để thử nghiệm):
| Mã học viên | Họ và Tên | Chức danh & Khoa phòng | Cấp quản lý |
| :--- | :--- | :--- | :--- |
| `K7M4PX` | BS. CKII Nguyễn Văn An | Trưởng khoa Cấp cứu | Quản lý cấp cao |
| `W9N2RY` | BS. CKI Trần Thị Bích | Phó Trưởng khoa Khám bệnh | Quản lý cấp trung |
| `D4H8TJ` | TS. BS Phạm Hoàng Cường | Trưởng khoa Tim mạch | Quản lý cấp cao |
| `M3P6XQ` | ThS. BS Đỗ Thị Dung | Trưởng khoa Sản Phụ | Quản lý cấp cao |
| `C8T2VE` | BS. CKI Vũ Hải Đăng | Phó Trưởng khoa Ngoại TH | Quản lý cấp trung |
| `J5Y9NK` | ThS. BS Lê Hoàng Giang | Trưởng khoa Nhi | Quản lý cấp cao |

---

## 📁 CÁC ĐƯỜNG DẪN TRUY CẬP CHÍNH

* **Trang chủ**: `/`
* **Điểm danh Check-in**: `/checkin`
* **Điểm danh Check-out**: `/checkout`
* **Trang cá nhân học viên**: `/portal`
* **Màn hình Chiếu Live QR Buổi 1**: `/admin/sessions/[sessionId]/live`
* **Quản trị Học viên & Import Excel**: `/admin/students`
* **Quản lý Buổi học**: `/admin/sessions`
* **Studio Chấm bài & Nhận xét**: `/admin/assignments`
* **Trung tâm Báo cáo & Tải Excel**: `/admin/reports`
