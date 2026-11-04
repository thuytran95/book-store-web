/** Static marketing copy for PDP v1 — not tied to a specific SKU. */

export const PDP_STATIC = {
  appraisalBullets: [
    "Ấn phẩm được kiểm tra bìa, gáy và ruột sách trước khi niêm yết — mô tả tình trạng khớp với thông số giám định.",
    "Ruột sách được rà soát thiếu trang, rách, mất chữ hoặc dấu hiệu sửa chữa không phù hợp với ấn bản cổ.",
    "Tem niêm phong và quy trình bảo quản chuyên dụng áp dụng trong quá trình lưu kho và vận chuyển.",
  ],
  preservationPerk:
    "Đặc quyền bảo tồn: Tặng kèm bọc màng co chuyên dụng kháng ẩm + hộp bảo vị + ưu đãi vận chuyển theo chính sách cửa hàng.",
  voucherChips: [
    { code: "SACHXUA50K", label: "Giảm 50k" },
    { code: "TRIANBANHUU", label: "Giảm 10% Hội viên" },
    { code: "FREESHIPMAX", label: "Miễn phí ship" },
  ] as const,
  reviewSummary: {
    average: "5.0",
    countLabel: "(28 thẩm định mẫu)",
  },
  preservationTips: [
    "Nhiệt độ phòng ổn định, tránh biến động đột ngột.",
    "Độ ẩm tương đối 45–55%, tránh tủ kín ẩm mốc.",
    "Tránh ánh nắng trực tiếp; đọc bằng ánh sáng dịu.",
  ],
  reviewsSection: {
    title: "Đánh Giá & Cảm Nhận Từ Nhà Sưu Tầm",
    subtitle: "Mẫu giao diện — đánh giá thực sẽ có sau",
    average: "5.0",
    satisfaction: "100% người mua hài lòng tuyệt đối (mẫu)",
    bars: [
      { stars: 5, percent: 96 },
      { stars: 4, percent: 4 },
      { stars: 3, percent: 0 },
      { stars: 2, percent: 0 },
      { stars: 1, percent: 0 },
    ],
    filterChips: ["Tất cả (28)", "Có hình ảnh (6)", "Đã mua ấn phẩm (28)", "5 sao (27)"],
    reviews: [
      {
        author: "Nhà sưu tầm A.",
        rating: 5,
        date: "Tháng 3, 2025",
        title: "Đúng mô tả giám định",
        body: "Sách khớp thông số tình trạng, đóng gói cẩn thận. Phù hợp trưng bày tủ sách cổ.",
      },
      {
        author: "Độc giả B.",
        rating: 5,
        date: "Tháng 1, 2025",
        title: "Giao hàng an toàn",
        body: "Nhận sách nguyên vẹn, tem niêm phong còn. Nhân viên tư vấn nhiệt tình.",
      },
    ],
  },
} as const;

export const PDP_TRUST_ITEMS = [
  {
    icon: "inventory",
    title: "Đồng kiểm khi nhận",
    body: "Được mở gói và kiểm tra tình trạng trước khi thanh toán (theo chính sách cửa hàng).",
  },
  {
    icon: "published_with_changes",
    title: "Hoàn tiền nếu sai lệch",
    body: "Cam kết hoàn tiền khi ấn phẩm không khớp mô tả giám định đã công bố.",
  },
  {
    icon: "local_shipping",
    title: "Đóng gói chuyên dụng",
    body: "Hộp chống sốc, cố định gáy và bìa trong suốt quá trình vận chuyển.",
  },
  {
    icon: "support_agent",
    title: "Tư vấn sưu tầm",
    body: "Đội ngũ hỗ trợ qua hotline và chat trong giờ làm việc.",
  },
] as const;
