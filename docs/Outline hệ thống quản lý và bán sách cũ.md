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

Người mua cần 4 nhóm chức năng: tài khoản, duyệt và tìm sách, giỏ hàng và mua sách, đặt sách.

**Tài khoản**

- Đăng ký, đăng nhập, đăng xuất, quên mật khẩu
- Cập nhật hồ sơ, địa chỉ nhận hàng

**Duyệt và tìm sách**

- Danh sách sách có phân trang
- Lọc theo danh mục, khoảng giá, tình trạng sách (90%, 80%...)
- Tìm kiếm theo tên sách, tác giả
- Trang chi tiết: ảnh, giá, tình trạng, mô tả, số lượng còn

**Giỏ hàng và mua sách**

- Thêm, sửa, xóa sản phẩm trong giỏ
- Thanh toán (checkout): nhập địa chỉ, chọn phương thức (COD, chuyển khoản)
- Xác nhận đơn hàng, xem lịch sử đơn
- Hủy đơn khi còn ở trạng thái "chờ xác nhận"

**Đặt sách (pre-order / yêu cầu sách)**

- Đặt giữ sách đang còn hàng (giữ trong X ngày)
- Gửi yêu cầu tìm sách chưa có trong kho (tên sách, tác giả, ghi chú)
- Xem trạng thái yêu cầu: chờ xử lý / đã có sách / từ chối

## 3. Phía admin

Admin quản lý sách và danh mục, xử lý đơn và yêu cầu đặt sách, đồng thời xem thống kê cơ bản.

**Quản lý sách**

- Thêm, sửa, xóa (hoặc ẩn) sách
- Thông tin: tên, tác giả, NXB, năm xuất bản, giá nhập, giá bán, tình trạng, mô tả, ảnh, số lượng
- Bật/tắt hiển thị, đánh dấu "đã bán" hoặc "hết hàng"

**Quản lý danh mục**

- Thêm, sửa, xóa danh mục
- Chặn xóa danh mục đang có sách (hoặc yêu cầu chuyển sách sang danh mục khác)

**Quản lý đơn hàng**

- Danh sách đơn, lọc theo trạng thái
- Cập nhật trạng thái: chờ xác nhận → đã xác nhận → đang giao → hoàn thành / hủy
- Tự động trừ tồn kho khi xác nhận đơn, hoàn lại khi hủy

**Quản lý đặt sách**

- Duyệt yêu cầu đặt, báo đã có sách hoặc từ chối
- Giải phóng sách giữ chỗ khi quá hạn

**Quản lý người dùng (tối thiểu)**

- Xem danh sách, khóa/mở tài khoản

**Thống kê cơ bản**

- Doanh thu theo ngày/tháng, số đơn, sách bán chạy, sách sắp hết

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

Bản đầu cần 8 thực thể.

| Thực thể | Vai trò trong hệ thống |
| --- | --- |
| User | Tài khoản người mua và admin |
| Address | Địa chỉ nhận hàng của người dùng |
| Book | Sách, giá, tình trạng, tồn kho |
| Category | Danh mục sách |
| Cart / CartItem | Giỏ hàng và các dòng sản phẩm |
| Order / OrderItem | Đơn hàng và các dòng sản phẩm |
| Reservation | Đặt giữ sách đang còn hàng |
| BookRequest | Yêu cầu tìm sách chưa có trong kho |

## 6. Chưa cần ở bản đầu (**Không implememnt**)

Các tính năng sau để mở rộng ở giai đoạn sau:

- Thanh toán online (VNPay/Momo)
- Mã giảm giá
- Đánh giá/bình luận, wishlist
- Thông báo qua email/Zalo
- Tích hợp vận chuyển (GHN/GHTK)
- Nhập sách hàng loạt bằng Excel
