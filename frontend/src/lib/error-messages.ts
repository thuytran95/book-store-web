import { isApiError } from "./api/errors";

/** Vietnamese text per backend error `code`. Never match on the server message. */
export const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: "Vui lòng đăng nhập để tiếp tục.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  NOT_FOUND: "Không tìm thấy dữ liệu yêu cầu.",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.",
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
  ACCOUNT_LOCKED: "Tài khoản đã bị khoá. Vui lòng liên hệ cửa hàng.",
  EMAIL_TAKEN: "Email này đã được đăng ký.",
  TOKEN_INVALID: "Liên kết không hợp lệ hoặc đã hết hạn.",
  INVALID_REFRESH: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
  OUT_OF_STOCK: "Sách không đủ số lượng trong kho.",
  BOOK_UNAVAILABLE: "Sách này hiện không còn bán.",
  CART_EMPTY: "Giỏ hàng đang trống.",
  INVALID_TRANSITION: "Không thể chuyển sang trạng thái này.",
  RESERVATION_LIMIT: "Bạn đã đạt số lượng giữ sách tối đa.",
  RESERVATION_NOT_ACTIVE: "Lượt giữ sách này không còn hiệu lực.",
  RESERVATION_INVALID: "Lượt giữ sách không còn hiệu lực.",
  DEFAULT_REQUIRED: "Hãy chọn địa chỉ mặc định khác trước khi xoá địa chỉ này.",
  CANNOT_LOCK_SELF: "Bạn không thể khoá chính mình.",
  CATEGORY_EXISTS: "Tên thể loại đã tồn tại.",
  CATEGORY_NOT_EMPTY: "Thể loại vẫn còn sách. Hãy chọn thể loại để chuyển sách sang.",
  INVALID_MOVE_TARGET: "Không thể chuyển sách sang cùng thể loại.",
  INVALID_IMAGE_ORDER: "Thứ tự ảnh không hợp lệ.",
  INVALID_STATUS: "Trạng thái không hợp lệ.",
  ALREADY_RESOLVED: "Yêu cầu này đã được xử lý.",
  RATE_LIMITED: "Thao tác quá nhanh, vui lòng thử lại sau.",
  HTTP_429: "Thao tác quá nhanh, vui lòng thử lại sau.",
};

const FALLBACK = "Đã có lỗi xảy ra. Vui lòng thử lại.";

export function errorMessage(error: unknown): string {
  if (isApiError(error)) return ERROR_MESSAGES[error.code] ?? FALLBACK;
  return FALLBACK;
}
