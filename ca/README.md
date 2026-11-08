# Car Navi Launcher - Ứng Dụng Màn Hình Xe Hơi Android (Bản Đồ Đa Nguồn, YouTube & Nhạc Máy)

Ứng dụng Car Launcher thông minh dành cho màn hình Android xe hơi (Android Car Head Unit), máy tính bảng hoặc điện thoại gắn trên ô tô. Giao diện được thiết kế chuẩn xác 100% theo phong cách hiện đại với thanh Dock bên trái, widget đồng hồ - địa chỉ - thời tiết, bản đồ dẫn đường tương tác thời gian thực và khả năng **chia đôi màn hình (Split-Screen) để mở YouTube hoặc nghe nhạc lưu trong máy song song với bản đồ**.

---

## 🌟 Các Tính Năng Nổi Bật

### 1. Bản Đồ Dẫn Đường Tự Chọn Nguồn (Multi-Source Navigation Map)
- **OpenStreetMap / CartoDB 3D Vector**: Mặc định siêu mượt, không cần cấu hình API key, hiển thị khối nhà 3D, tuyến đường dẫn đường, tên đường tiếng Việt sắc nét.
- **Google Maps Live**: Dẫn đường trực tiếp qua Google Maps.
- **Vietmap Live Web**: Bản đồ giao thông Việt Nam.
- **Waze Traffic**: Báo kẹt xe, cảnh báo camera và chốt giao thông thời gian thực.
- **Custom Map URL**: Cho phép bạn nhập bất kỳ link web bản đồ dẫn đường nào bạn muốn vào cài đặt.
- **HUD trên bản đồ**:
  - **Biển báo giới hạn tốc độ**: Vòng tròn viền đỏ chữ số nổi bật (50, 60, 80, 90, 100, 120 km/h) - bấm vào biển báo để đổi giới hạn tốc độ nhanh.
  - **Đồng hồ tốc độ thực tế (Speedometer)**: Hiển thị vận tốc thực tế của xe theo GPS (km/h) kèm cảnh báo đổi màu đỏ khi vượt quá tốc độ giới hạn.
  - Nút Zoom `+` / `-` và nút Đưa xe về tâm bản đồ.

### 2. Mở YouTube Bên Cạnh Bản Đồ (Dual-Screen / Split View)
- Bấm vào icon **YouTube** màu đỏ trên thanh Dock bên trái: Màn hình chia đôi cạnh bản đồ.
- Bên trái phát video YouTube, bên phải bản đồ dẫn đường vẫn hoạt động liên tục.
- Tích hợp thanh tìm kiếm video nhanh và các nút chọn thể loại: *Remix Xe Hơi, Lofi Lái Xe, Bolero, Tin Tức*.
- Có nút Phóng to toàn màn hình hoặc Thu nhỏ về dạng chia đôi.

### 3. Nghe Nhạc Lưu Trong Máy (Local Music Player)
- Bấm vào icon **Đĩa Than (Vinyl)** trên thanh Dock hoặc tab Nhạc Trong Máy.
- Tự động quét toàn bộ bài hát `.mp3`, `.m4a`, `.wav` có sẵn trong thẻ nhớ / bộ nhớ máy thông qua `MediaStore` của Android.
- Đồng bộ mượt mà với **Widget Mini Player** ở cột trái: Album Art, tên bài hát, ca sĩ, thanh tiến trình seekbar, nút Previous, Play/Pause, Next.

### 4. Hệ Thống Widget Tiện Ích Trực Quan
- **Đồng hồ số cỡ lớn**: Hiển thị giờ phút to rõ dễ nhìn khi đang lái xe (`15:40`).
- **Địa chỉ & Vị trí**: Tự động cập nhật tên đường, phường, thành phố theo vị trí xe (`Đường Trần Trọng Kim, Phường Thạnh Mỹ Tây, TP. Hồ Chí Minh`).
- **Thời tiết hiện tại**: Nhiệt độ và mô tả thời tiết (`34°C Có Mây`).
- **Thông tin hành trình**: Thời gian dự kiến và quãng đường (`4 phút | 3.1km`).

### 5. Cài Đặt & Tuỳ Biến
- Hỗ trợ đổi giao diện **Sáng (Light Mode)** và **Tối (Dark Mode)** cho lái xe ban đêm không chói mắt.
- Tự động giữ màn hình luôn sáng khi đang mở ứng dụng.
- Chế độ chạy ẩn hoặc làm Launcher mặc định của xe.

---

## 🚀 Hướng Dẫn Build File APK Cài Lên Xe Hoặc Điện Thoại

### Cách 1: Tự Động Build APK Qua GitHub Actions (Khuyên dùng - Không cần cài Android Studio)
1. Tải toàn bộ thư mục `CarNaviLauncher` lên một repository mới trên GitHub (Private hoặc Public đều được).
2. GitHub sẽ tự động nhận diện file `.github/workflows/build-apk.yml` và tiến hành build APK.
3. Vào tab **Actions** trên GitHub, chờ khoảng 2 phút.
4. Tải file artifact **CarNaviLauncher-Debug-APK** về, giải nén ra sẽ có file `app-debug.apk` để cài đặt trực tiếp lên ô tô hoặc điện thoại!

---

### Cách 2: Build Bằng Android Studio
1. Mở **Android Studio**, chọn **Open** và trỏ đến thư mục:
   `C:\Users\Dell\.gemini\antigravity\scratch\CarNaviLauncher`
2. Chờ Gradle đồng bộ (Sync) xong.
3. Chọn menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
4. Nhấn **locate** ở góc dưới bên phải để lấy file `app-debug.apk`.

---

### Cách 3: Trải Nghiệm Thử Ngay Trên Máy Tính (Không cần cài APK)
Chạy file:
`run-preview.bat`
Hoặc gõ lệnh:
```bash
cd app/src/main/assets
python -m http.server 8080
```
Sau đó mở trình duyệt tại: `http://localhost:8080` để trải nghiệm đầy đủ giao diện, bản đồ, YouTube và nghe nhạc ngay lập tức!
