# Coffeelytics - Dashboard Tài Chính & Vận Hành Quán Cà Phê ☕📊

Coffeelytics là một ứng dụng Web (One-page Dashboard) trực quan, giúp các chủ quán cà phê tương lai, nhà đầu tư tính toán bài toán tài chính, điểm hòa vốn, và mô phỏng các kịch bản kinh doanh trước khi quyết định xuống tiền.

## 🌟 Tính Năng Nổi Bật

- **Tính Toán Vốn Tự Động:** Nhập các thông số chi phí (cọc mặt bằng, decor, máy móc...), hệ thống sẽ tự động tính tổng vốn thiết lập và quỹ dự phòng cần thiết.
- **Quản Lý Cơ Cấu Cổ Đông:** Thêm, bớt cổ đông và số tiền góp vốn. Tự động chia tỷ lệ cổ phần, tính toán tiến độ giải ngân và chia cổ tức theo phần trăm đóng góp.
- **Phân Tích 3 Kịch Bản (Tốt - Trung Bình - Xấu):** Mô phỏng bức tranh tài chính với 3 kịch bản bán hàng (số ly/ngày). Biểu đồ quỹ dự phòng mô phỏng dòng tiền sau 12 tháng giúp cảnh báo nguy cơ phá sản ở kịch bản xấu.
- **Tính Điểm Hòa Vốn:** Biết chính xác mỗi ngày cần bán bao nhiêu ly nước để không bị lỗ, đủ bù đắp các định phí (nhân sự, mặt bằng, điện nước, khấu hao, lãi vay).
- **Phân Tích Độ Nhạy Lợi Nhuận (Sensitivity Analysis):** Bảng ma trận giúp bạn thấy lợi nhuận ròng thay đổi như thế nào nếu tăng/giảm giá bán và tăng/giảm tỷ lệ giá vốn nguyên vật liệu (Cost %).
- **Trình Bày Đẹp Mắt:** Hỗ trợ Light/Dark mode, layout khoa học (dạng Accordion) thuận tiện để chủ quán mang đi thuyết trình trực tiếp (pitching) với các nhà đầu tư.
- **Giải Thích Thông Số (Self-explanatory):** Tích hợp công cụ "Giải thích Số liệu" tự động sinh báo cáo bằng lời giải thích cho các con số toán học theo thời gian thực dựa trên input hiện tại.

## 🛠️ Công Nghệ Sử Dụng

- **HTML5 / CSS3:** Giao diện sử dụng Vanilla CSS, Glassmorphism, CSS Grid & Flexbox. Không phụ thuộc thư viện UI nào.
- **JavaScript (ES6):** Xử lý toán học, logic tài chính, DOM Manipulation theo thời gian thực.
- **Chart.js:** Thư viện vẽ biểu đồ phân tích cơ cấu vốn (Pie/Doughnut Chart) và biểu đồ so sánh dòng tiền (Bar/Line Chart).

## 🚀 Hướng Dẫn Sử Dụng

1. Tải toàn bộ source code về máy.
2. Mở file `index.html` bằng bất kỳ trình duyệt nào (Chrome, Edge, Safari...).
3. Không cần cài đặt server hay chạy `npm`, mọi logic hoàn toàn chạy phía Client-side.
4. Bắt đầu nhập các thông số bên trái và quan sát biểu đồ, kết quả cập nhật ngay lập tức bên phải.

---
*Dự án được thiết kế dành riêng cho mô hình kinh doanh F&B, đặc biệt là quán Cà Phê, Trà Sữa quy mô vừa và nhỏ.*
