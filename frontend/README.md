# FabricIO Frontend

FabricIO Frontend là giao diện người dùng của hệ thống FabricIO, được xây dựng bằng React + Vite. Frontend kết nối với Backend API để thực hiện các chức năng như đăng ký, đăng nhập, xem danh sách game, xem chi tiết game, đăng bài viết, bình luận, đánh giá game, quản lý hồ sơ cá nhân, upload game và quản trị hệ thống.

## 1. Công nghệ sử dụng

- React
- Vite
- JavaScript / JSX
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React
- Sonner / Toast notification

## 2. Yêu cầu trước khi chạy

Trước khi chạy frontend, cần đảm bảo đã cài đặt:

- Node.js
- npm
- Backend API đã chạy thành công
- Database đã được cấu hình và kết nối với backend
- MinIO hoặc dịch vụ lưu trữ file đã được cấu hình nếu hệ thống có sử dụng upload ảnh/file game

## 3. Cài đặt thư viện

Tại thư mục frontend, chạy lệnh:

```bash
npm install
```

## 4. Cấu hình môi trường

Tạo file `.env` ở thư mục gốc của frontend nếu chưa có.

Ví dụ:

```env
VITE_API_URL=http://localhost:5000/api
```

Trong đó:

- `VITE_API_URL` là đường dẫn đến Backend API.
- Nếu backend chạy ở port khác, cần sửa lại cho đúng với port backend đang sử dụng.

Ví dụ backend chạy ở `http://localhost:5000` thì frontend sẽ gọi API qua:

```env
VITE_API_URL=http://localhost:5000/api
```

## 5. Chạy frontend ở môi trường development

Sau khi cài đặt thư viện và cấu hình `.env`, chạy lệnh:

```bash
npm run dev
```

Sau đó mở đường dẫn được hiển thị trong terminal, thường là:

```bash
http://localhost:5173
```

## 6. Build frontend

Để build dự án cho môi trường production, chạy:

```bash
npm run build
```

Sau khi build thành công, thư mục `dist` sẽ được tạo ra.

## 7. Preview bản build

Để chạy thử bản build production trên máy local:

```bash
npm run preview
```

## 8. Tạo dữ liệu mẫu cho hệ thống

Frontend có cung cấp file seed dữ liệu mẫu tại:

```bash
src/utils/seedFullSystem.js
```

File này dùng để tạo dữ liệu mẫu cho database thông qua Backend API, ví dụ:

- Tài khoản người dùng mẫu
- Game mẫu
- Bài viết mẫu
- Bình luận mẫu
- Đánh giá game
- Dữ liệu tương tác khác trong hệ thống

### Lưu ý trước khi chạy file seed

Trước khi chạy file seed, cần đảm bảo:

- Backend API đang chạy.
- Database đã kết nối thành công với backend.
- File `.env` của frontend đã cấu hình đúng `VITE_API_URL`.
- Nếu seed có upload ảnh hoặc file game, cần đảm bảo các file mẫu còn tồn tại đúng đường dẫn trong source.
- MinIO hoặc storage service đã chạy nếu backend yêu cầu lưu file.

### Lệnh chạy seed dữ liệu

Tại thư mục gốc của frontend, chạy:

```bash
node src/utils/seedFullSystem.js
```

Sau khi chạy thành công, dữ liệu mẫu sẽ được insert vào database thông qua API backend.

### Trường hợp chạy seed bị lỗi

Một số lỗi thường gặp:

#### 1. Backend chưa chạy

Nếu backend chưa chạy, seed sẽ không gọi được API.

Cách xử lý:

```bash
# Chạy backend trước, sau đó chạy lại seed
node src/utils/seedFullSystem.js
```

#### 2. Sai đường dẫn API

Kiểm tra lại file `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Đảm bảo port và domain đúng với backend đang chạy.

#### 3. Database chưa kết nối

Nếu backend báo lỗi database, cần kiểm tra lại connection string ở backend.

#### 4. Thiếu file ảnh hoặc file game mẫu

Nếu seed có upload file nhưng báo lỗi không tìm thấy file, cần kiểm tra lại đường dẫn file trong `seedFullSystem.js`.

Ví dụ lỗi thường gặp:

```bash
ENOENT: no such file or directory
```

Cách xử lý là bổ sung file bị thiếu hoặc sửa lại đường dẫn file trong script seed.

## 9. Quy trình chạy hệ thống đầy đủ

Thứ tự chạy khuyến nghị:

```bash
# 1. Chạy database và storage nếu có
# Ví dụ: PostgreSQL, MinIO

# 2. Chạy backend API
# Ví dụ backend chạy tại http://localhost:5000

# 3. Cài đặt thư viện frontend
npm install

# 4. Chạy seed dữ liệu mẫu
node src/utils/seedFullSystem.js

# 5. Chạy frontend
npm run dev
```

Sau đó truy cập:

```bash
http://localhost:5173
```

## 10. Ghi chú

- Chỉ cần chạy file seed khi muốn tạo dữ liệu mẫu ban đầu.
- Không nên chạy seed nhiều lần nếu script không có xử lý chống trùng dữ liệu.
- Nếu database đã có dữ liệu, việc chạy lại seed có thể tạo thêm dữ liệu trùng.
- Khi deploy production, không nên chạy seed nếu không có nhu cầu tạo dữ liệu mẫu.
