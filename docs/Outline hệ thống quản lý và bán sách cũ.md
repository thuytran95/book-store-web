# Outline hệ thống quản lý và bán sách cũ

Oct 30, 2026 · @Thuy Tran

## 1. Vai trò người dùng

Hệ thống có 3 vai trò, phân biệt theo việc đã đăng nhập hay chưa và quyền quản trị.

| Vai trò | Đăng nhập | Quyền chính |
| --- | --- | --- |
| Khách | Chưa | Xem và tìm sách, xem chi tiết |
| Người mua | Đã đăng ký | Mua sách, đặt sách, theo dõi đơn |
| Admin (chủ shop) | Tài khoản quản trị | Quản lý sách, danh mục, đơn hàng |

## 2. Phía người mua

Người mua cần 3 nhóm chức năng: tài khoản, duyệt và tìm sách, giỏ hàng và đặt mua sách.

**Tài khoản**

- Đăng ký, đăng nhập, đăng xuất
- Cập nhật hồ sơ (họ tên, số điện thoại)

**Duyệt và tìm sách**

- Danh sách sách có phân trang
- Lọc theo danh mục, khoảng giá, tình trạng sách (90%, 80%...)
- Tìm kiếm theo tên sách, tác giả
- Trang chi tiết: ảnh, giá, tình trạng, mô tả, số lượng còn

**Giỏ hàng, đặt mua và theo dõi đơn**

- Thêm, sửa, xóa sản phẩm trong giỏ
- Thanh toán (checkout): nhập người nhận, số điện thoại, địa chỉ giao hàng (điền sẵn từ hồ sơ), chọn phương thức (COD, chuyển khoản)
- Xác nhận đơn hàng, xem lịch sử và trạng thái đơn
- Hủy đơn khi còn ở trạng thái "chờ xác nhận"

## 3. Phía admin

Admin quản lý sách theo danh mục, theo dõi tồn kho và xử lý đơn hàng.

**Quản lý sách**

- Thêm, sửa, xóa (hoặc ẩn) sách
- Thông tin: tên, tác giả, NXB, năm xuất bản, giá bán, tình trạng, mô tả, ảnh, số lượng
- Bật/tắt hiển thị; sửa số lượng tồn (đặt 0 khi sách đã bán hết)
- Quản lý tác giả

**Quản lý danh mục**

- Thêm, sửa, xóa danh mục
- Chặn xóa danh mục đang có sách (hoặc yêu cầu chuyển sách sang danh mục khác)

**Quản lý đơn hàng**

- Danh sách đơn, lọc theo trạng thái
- Cập nhật trạng thái: chờ xác nhận → đã xác nhận → đang giao → hoàn thành / hủy
- Tự động trừ tồn kho khi xác nhận đơn, hoàn lại khi hủy

**Quản lý người dùng (tối thiểu)**

- Xem danh sách, khóa/mở tài khoản

**Theo dõi tồn kho**

- Tổng quan kho: số đầu sách, số bản, sách sắp hết / hết hàng, sách đang chờ xác nhận đơn

## 4. Yêu cầu hệ thống để chạy ổn định

Rủi ro lớn nhất là bán trùng, vì sách cũ thường chỉ có 1 bản.

- **Xác thực và phân quyền:** mật khẩu băm (bcrypt), JWT/session, chặn người dùng thường vào trang admin
- **Chống bán trùng:** kiểm tra và khóa tồn kho (transaction) khi hai người mua cùng lúc
- **Kiểm tra dữ liệu đầu vào** ở cả client và server
- **Upload ảnh:** giới hạn dung lượng, định dạng, nén ảnh
- **Giao diện responsive:** ưu tiên mobile vì đa số khách mua bằng điện thoại
- **Xử lý lỗi và log** cơ bản, **sao lưu database** định kỳ
- **Bảo mật:** HTTPS, chống SQL injection và XSS

## 5. Thực thể dữ liệu chính

Bản đầu cần 6 thực thể.

| Thực thể | Vai trò trong hệ thống |
| --- | --- |
| User | Tài khoản người mua và admin |
| Book | Sách, giá, tình trạng, tồn kho |
| Author | Tác giả của sách |
| Category | Danh mục sách |
| Cart / CartItem | Giỏ hàng và các dòng sản phẩm |
| Order / OrderItem | Đơn hàng (kèm thông tin giao hàng) và các dòng sản phẩm |

## 6. Chưa cần ở bản đầu (**Không implememnt**)

Các tính năng sau để mở rộng ở giai đoạn sau:

- Thanh toán online (VNPay/Momo)
- Mã giảm giá
- Đánh giá/bình luận, wishlist
- Thông báo qua email/Zalo
- Tích hợp vận chuyển (GHN/GHTK)
- Nhập sách hàng loạt bằng Excel
- Đặt giữ sách, yêu cầu tìm sách chưa có trong kho
- Quên mật khẩu qua email, sổ địa chỉ nhận hàng
- Báo cáo doanh thu / sách bán chạy, giá nhập
