/** Static marketing copy from docs/prototype/landing-page/code.html (v1 — not env-driven). */

export type HomeCta = { label: string; href: string };

export type HeroBookCover = {
  imageUrl: string;
  alt: string;
  badge?: string;
};

export type HeroSlide = {
  eyebrow: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  description: string;
  primaryCta: HomeCta;
  secondaryCta: HomeCta;
  priceTeaser?: { label: string; priceLabel: string };
  books: HeroBookCover[];
};

export type TrustPillar = {
  icon: string;
  title: string;
  subtitle: string;
};

export type PromoBanner = {
  variant: "orange" | "amber";
  eyebrow: string;
  title: string;
  body: string;
  cta: HomeCta;
  coverImageUrl: string;
  coverAlt: string;
};

export type FeaturedAuthor = {
  name: string;
  tagline: string;
  bookCountLabel: string;
  portraitUrl: string;
  searchQuery: string;
};

export type StoreSection = {
  eyebrow: string;
  title: string;
  body: string;
  addressCard: { title: string; address: string; hours: string };
  teaCard: { title: string; line1: string; line2: string };
  galleryImages: { url: string; alt: string; wide?: boolean }[];
};

export type BlogTeaser = {
  dateLabel: string;
  category: string;
  title: string;
  imageUrl: string;
  href: string;
};

export type FooterLink = { label: string; href: string };

export type SocialLink = { label: string; href: string; abbrev: string };

export const homeContent = {
  brand: {
    name: "Sách Xưa & Nay",
    tagline: "Hiệu Sách Di Sản & Cổ Thư",
    footerTagline: "Di Sản & Cổ Thư Việt Nam",
    blurb:
      "Thành lập từ 2012, là không gian lưu giữ, lan tỏa và thẩm định các ấn bản sách cổ, văn học tiền chiến, bản dịch thời kỳ đổi mới và thủ bản văn hiến của người Việt.",
  },
  shop: {
    address: "45 Phố Hàng Bạc, Hoàn Kiếm, Hà Nội",
    addressShort: "45 Hàng Bạc, Hoàn Kiếm, Hà Nội",
    hours: "8:30 - 21:30",
    hoursLong: "Thứ Hai - Chủ Nhật: 8:00 - 21:30",
    topbarHours: "8:30 - 21:30 (Thứ 2 - CN)",
    hotline: "0912.345.678",
    trustBadge: "100% Ảnh Thật Từng Trang & Có Thẩm Định",
    zaloNote: "Hỗ trợ hình ảnh chi tiết từng trang qua Zalo",
  },
  heroSlides: [
    {
      eyebrow: "Ưu Đãi & Tuyển Tập Đặc Biệt 2024",
      titleBefore: "Bản In Thập Niên ",
      titleHighlight: "1930 - 1975",
      titleAfter: " & Trọn Bộ Tác Phẩm Kinh Điển",
      description:
        "Kho lưu trữ hơn 15.000 đầu sách văn học tiền chiến, bản in đầu tiên, sách dịch Liên Xô Cầu Vồng và tài liệu văn hiến nguyên vẹn từng trang giấy ngả vàng của người Việt.",
      primaryCta: { label: "Khám Phá Bộ Sưu Tập", href: "/#kho-sach" },
      secondaryCta: {
        label: "Ghé Thăm Tiệm 45 Hàng Bạc",
        href: "/#khong-gian",
      },
      priceTeaser: {
        label: "Combo sách văn học chỉ từ",
        priceLabel: "35.000đ / cuốn",
      },
      books: [
        {
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBqEZv9bS_0cjPa7iR-qFAiidMYkSv65UxWfij2TKpIgQvQK4N5omOiCtrbrEkA9D1p_nqeur6C_BrxxZP7QP5yXCsyPQgj8mJ-nE_3_JS_f45dzuNGP6aZU5qsJ9SAI7Qj3uoAPXtyi6YMQiwA-akqE5-VZGYaJ1XrGYfonShTl0Dcf5rYENGX6SmZWR0xbDOY3mKLEZOV7Uz5gloJBm8P64yd78BE7NMMIZrErTbbNpLf7Crsz3zxGQ",
          alt: "Số Đỏ Vũ Trọng Phụng",
          badge: "1957",
        },
        {
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuC-XYD_TlwQMRD5JLm_A5Kb6O-4rqvVm1B2-8ivLaKnJHZ468CGxBu5AFBSiTiwrIeeYAg3UDgPr7XZ8jPIA6kMDLFwb2T0_QKmyYv_7Rgeif1sNdTEoEmlFOMceMVFPqSZe7XxZizAgEnG3ELxEDwOfGNZdLe8TvVdGrYavjINUWymDFPa9sLFTTVPC6hda8y40am5-XvwnuDQHp6jKACBvg4slUIHAln1zLeZxjBJDdYR1ht6Brvghg",
          alt: "Dế Mèn Phiêu Lưu Ký",
          badge: "Đặc Biệt",
        },
        {
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAjiYmJp1Ufeu9tmXKa6i4buCIAXeRnr5PIoTDJ8pDMxIK9nm-cADO7iDEz-vxQe6O4weFBI0lshwldqKinUgDgzBsaB1p4sJDovTmwbSn3KIF0y2R7fw_tkE9OszqvdBdE56Ap-37gEnGSF844V-UTXzJEoIiCNVvL7ZJE0SFNxzeAojdWzZnVVm4Q3SZhYsrppXrHF_6p4FawkU3DfF2mZUx5R3dJmcTwb-r53NbryX6WA1BX5j8uFw",
          alt: "Nỗi Buồn Chiến Tranh Bảo Ninh",
          badge: "Bản Đầu 1991",
        },
      ],
    },
  ] satisfies HeroSlide[],
  trustPillars: [
    {
      icon: "verified_user",
      title: "Thẩm Định Thật 100%",
      subtitle: "Giám định niên đại & ruột trang kỹ lưỡng",
    },
    {
      icon: "inventory_2",
      title: "Đóng Gói 3 Lớp Chống Sốc",
      subtitle: "Bọc xốp 4 góc, màng co kháng ẩm tối đa",
    },
    {
      icon: "auto_stories",
      title: "Kho 15.000+ Đầu Sách",
      subtitle: "Sách lưu trữ sẵn sàng đóng gửi ngay",
    },
    {
      icon: "change_circle",
      title: "Bảo Hành Đổi Trả 7 Ngày",
      subtitle: "Hoàn tiền nếu sai lệch mô tả ban đầu",
    },
  ] satisfies TrustPillar[],
  promoBanners: [
    {
      variant: "orange",
      eyebrow: "Giảm Đến 25%",
      title: "Bản In Xưa Cuối Tuần",
      body: "Tuyển tập dịch thuật văn học Nga, Pháp & tiểu thuyết kinh điển trước năm 1990.",
      cta: { label: "Xem Ngay", href: "/books?sort=newest" },
      coverImageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDU5zXGB8xGZOnLuz1lWth2dR9NbIH2mfZodXVelEWowGpmkUvpPegObgwmEuB542XM9XM2k4V-k0GxQ91zhyg-HGakbjPa5JxmAJs_Wy9RDTkOUq-uEP8rxyyzxDdZsEm-T57rUne8GSkUvGeLSjR14QmYkQpmEFYj6zHXYNzj2Dl6l41DGEE3WsH8BqbIVRTyyK8JSCrLQmLbS0OCMkeZpzlQSnR3ysC7z2brcXqy3Rp-s_4xBOrZrA",
      coverAlt: "Sách Văn Học Nga",
    },
    {
      variant: "amber",
      eyebrow: "Đặc Tuyển Sưu Tầm",
      title: "Bộ Sưu Tập Giấy Dép & Bìa Gốc",
      body: "Sách nghiên cứu văn hóa, địa chí ba miền & thủ tịch triều Nguyễn in mộc bản.",
      cta: { label: "Khám Phá Kệ Sách", href: "/books?sort=price_desc" },
      coverImageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCB9F03KbWQwS6_WsbWW4rkNvejbFU3QMjZT7XENLPwLJ1GiQxIVcJr8f1M0OU3N-RytFNzQy2NIW60I1Ud_6idGUvDN9GEEfL3D-JAG-SaariT1talQerdzM8UV4HoptfPe-Egs_ZXk6uXFBTYeRRa-EwFDyk4vR58fQ1gXMEn_IDQFxZUzAuirQfInIBkhk9cTpAQZeZLuVDsMaGs_SwKKUGa2R8CHMLPpgILLAirpghiOzkiVXNaCg",
      coverAlt: "Bộ Sưu Tập Địa Chí Sách Cổ",
    },
  ] satisfies PromoBanner[],
  featuredAuthors: [
    {
      name: "Vũ Trọng Phụng",
      tagline: "Ông vua phóng sự đất Bắc",
      bookCountLabel: "14 tác phẩm sẵn có",
      portraitUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAPtt21TjuCJ7TpgrnXD1WlHBA7GjScu_maQ_d3yzBswVAoS2ENkfKGYmaOr9XssQ4iMD-SvGP_GmnCG-aaAjiKvW0zMwC0Ov1ZStnNE22n00LLb_8Gaz5ec302n-QSuxlm7ps8DcDrrAnny1vRJ-jONY7DY09-6iJrePXJvIaRi1Nf3etNioE8BX5hF1qAWCliX9uJddyXBeQ4wISkZl5PP8JUt-jZLZsDxvZYlQoD",
      searchQuery: "Vũ Trọng Phụng",
    },
    {
      name: "Nam Cao",
      tagline: "Bậc thầy văn học hiện thực",
      bookCountLabel: "18 tác phẩm sẵn có",
      portraitUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDVo16aw51HvVud4jGHHZwkWwizgD9YxiiPc-G5ZO9WuxKapTFpHN1Ks7om7wqHJDoUb_uRgmMBQcnOstnWNoNKgj6JurFpN1Vbfum5Hq6RTBnHl5EF0uCgBmHfRW2QlZ3J2QXlRuEYVEZ7x1QpLe19XORMOGM3nrgXHypZOdGFIzHPZclIz7G_-6ONT6xXQbOyssLgaGrQhu6C5yWbJMtW7zMWHBUy7eWZetJZJPm2",
      searchQuery: "Nam Cao",
    },
    {
      name: "Thạch Lam",
      tagline: "Gió đầu mùa & Hà Nội 36 phố",
      bookCountLabel: "11 tác phẩm sẵn có",
      portraitUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC6S5mskCLuE0IM5aaI_OBBbnwfXq4pXhobig67koZ3FTquXNGns3iWcuSMH9iZi-_c2U-s-1FHQeSw5eNJOmfQy-0iECcT5K7vC945_8GpW3mjOLjtsNCTdV4mCnTxThkBbv_cAPDg1E87ym9iv0HKys8XZ64xnoDHTwgNfATOs_L1_6QJPyG6ntPrKWYEPFHLLr0bniUTMqi3gDUOFUFCmgM4D08DKuF0Q6nIfDyV",
      searchQuery: "Thạch Lam",
    },
    {
      name: "Tô Hoài",
      tagline: "Cây bút lớn thế kỷ 20",
      bookCountLabel: "22 tác phẩm sẵn có",
      portraitUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBLcU3OPkrSn_UZY_cDVQO8wIAYxthjpa0bpt3bfMAvzRqBES7_neEnHhdu3jSGIsmHygY5Tjn8XD953TvzZuFAatTaWi_bB95VVyhLwDqnSdlvzdkFolTYgJ3UT67ffNDSoJBWpUirsPLVvS_RO9Q_lWi0V7lFaNXFkOn4-1vop2PxTPvattSLLw9qCKoZYUgONaxNn4wNhjcFOxSWKPyJAyiAmDDQOVCI_DEEI_jE",
      searchQuery: "Tô Hoài",
    },
    {
      name: "Ernest Hemingway",
      tagline: "Bản dịch kinh điển miền Bắc",
      bookCountLabel: "9 bản in hiếm",
      portraitUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCv1clLvGQZaUQqWVb8Iw2H1We0VyB3_vyGqvCpYoD-nuyZk9etoIyi4Nmm_WPvhKx8RI7_hTfKRjLuCIe1t-cm3Wf0i7tOFeGlCDE98ZjI08dFr9PewbZeMdNym83Iqho7V092_N6BglOB1uOf7yUt-FIzl_-VJvoJ2gLgOyQ99WyyNIo8TE9Ce9c_1oDyzLk-85-ULdUQdCZ7DkWXdC5IclgQGtaNWcrmDamUtHhJ",
      searchQuery: "Hemingway",
    },
  ] satisfies FeaturedAuthor[],
  storeSection: {
    eyebrow: "Không Gian Di Sản Giữa Lòng Phố Cổ",
    title: "Chốn Dừng Chân Cho Người Yêu Sách Xưa",
    body: "Tọa lạc tại 45 Phố Hàng Bạc, tiệm sách giữ nguyên vẹn nếp nhà gỗ truyền thống với những kệ sách cao chạm trần, mùi giấy ố vàng ấm áp và góc trà sen nóng miễn phí đón tiếp bạn hữu từ khắp ba miền.",
    addressCard: {
      title: "Địa chỉ hiệu sách",
      address: "45 Hàng Bạc, Hoàn Kiếm, Hà Nội",
      hours: "⏰ 8:30 - 21:30 hàng ngày",
    },
    teaCard: {
      title: "Thưởng Trà & Đọc Sách Tự Do",
      line1: "Trà sen Bách Diệp miễn phí",
      line2: "Ghế gỗ & kính lúp giám định sẵn sàng",
    },
    galleryImages: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAayVUGpTTg1H0Tv4bUwfdpT-fM9Ci99kpGzqu0wwLiK8XtdRg0rVILe2QbBHA9Wn38kdkNG6aFao596Ur4xN6fHNcvfX6-wN8hDR9h26E6tXlSGCoW2hVY5QWPwZPd1Co-mpmsEoX8KVujvaJtBLALMCjskbI6CtXYnhcc7ZVA92hYwv-FWdJ-qUZBozZM5QFfs3jXkSvB3x5tVXkJ6wGUfkPfCGC2sC6ZmN6TKxep5EctJuLR_DVqAg",
        alt: "Góc đọc sách",
      },
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVLJzZlR0MKsR_6XZe3jmxqotiIx5JyXPx0jxUN45LGflpfpKJMwqY_ZYmQnPdhf-IGfoxjFkjU0cS4PoolYcF6JnycsGkeS3ZpF4HgS0qoS3Iv1cim9V3UiB6P8nrMQnTTyqnQQdC2pZsAG7P7h2iLKVA3iN8rbKiKcO9BY691weZMko_qXyFzTUDkVDUdim7lWXR1Hcwgnl1W8ow8Sg4D39nwtJuSCLF2Vil2eLkZ2Zi9IKFiPqL7w",
        alt: "Chồng sách xưa",
      },
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyo8sveAOAOjNeFj9hqQuXth7OwYp_6NdjufOZ6GxzDAQgvANOzQCPTqTcXd3P_B9mNEjCpbLXqR1OSrK50e3eRmIGGPLeB7rPXQAz5fDTMQYjn8EQusz27ZRd9vRc4U26Yg8tAB1HmqWHjKdKEShqnojnDQQscNayktcyIzdwHpjEn7IyWaxSkys779QXB1CFqzS4hFogENk2IPYc9RA7L6yJmgRvze3Bkg42ZWs3OPGVRgZU90AxeQ",
        alt: "Mặt tiền tiệm sách phố Hàng Bạc",
        wide: true,
      },
    ],
  } satisfies StoreSection,
  blogPosts: [
    {
      dateLabel: "15 Tháng 10, 2024",
      category: "Cẩm Nang Sưu Tầm",
      title: "Nghệ thuật bảo quản sách ố vàng & phục chế bìa da thủ công",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDyobDqrKI1b1CoumEAGEpfWlvRSGBzyMBuqf5gZQwlIkmu4bKmZwUjU-ikh6SGDdPVJppGqVrM_x9BHIDAVnzFZpXUGotY1gQoj7f_LseGvbExjkY9QLoqgL4RIOC9ozJCXDV3TSJm2lg7hquL2wWTx4hgAso7V89nYxrxL_rh4yUabivEUmpSEiPqeygOs5qL2PwQWmBRinPVWVYOXteWQj9atq-fXZw2xRb5luZq",
      href: "#",
    },
    {
      dateLabel: "08 Tháng 10, 2024",
      category: "Thư Tịch Tiền Chiến",
      title: "Những bản in đầu tiên của Tự Lực Văn Đoàn lưu lạc phương Nam",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBojuZzncEKrE2cPgBavaxuzB8Lm3S_QqqLoGh3ecf6a24i9qFhcXK7OnqwCakFFlzYnuILIK05I1slKUBzL6fUtzFMqec_mnZg7r3SmddTgdyjCUtToRXwCMupRywiBap2Jut39MyT87XU46ZnA28I1TzEJPwNsdJ51md0dMYbiMC2CUDyCF_fS54oEVvAmTU-V0Sarsk4ODMa4RerMQ_WjtqfsESLCZy5Zw9cWWXO",
      href: "#",
    },
    {
      dateLabel: "29 Tháng 09, 2024",
      category: "Thủ Bút & Ký Tên",
      title: "Thú sưu tầm ấn bản đặc biệt ký tặng tác giả: Thật và giả",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD7hVjCCzX8vEnGld0vl9nNypVNgdD0N_BbiiDLZQOA6A0ATbt63XzgBTjIQLbVT_XdqULEJ2Ti20FOtesZnBsf5dxeTpzICFvJyQbo6sjdPkavky9P1ce_NfEmUAf7Pj3BL8rFM9mOWEt4TIweqxz8rSyvLgxbVNkeigq_Pv79AFMGh0YIjhYXSBYZzEQ2da1eIjcU7MRZfuvGQTya8paWGxIbbP898uTnWUVR2nJM",
      href: "#",
    },
    {
      dateLabel: "19 Tháng 09, 2024",
      category: "Ký Ức Thời Bao Cấp",
      title: "Sách NXB Cầu Vồng Liên Xô: Tuổi thơ lấp lánh của thế hệ 7x, 8x",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA8CZUQpwsuDOkFo2hIf_s8L-mDyAVOselfxt8aoK3mmfmOifwOOeRMqgx17hxhAtRuTLyF5dXJ_BSco4mIl8a6BWhXR_YvkreqzpewqQB_iEJT7VH583FjHf4uJUrItTVu7F_UiHq4-C8QZzePzZ0ETdhC6QerO1nzR7XUsPSRjMIaaDCqV_ugQuFqNhiyo9d8HKeGs5IB5t1lGj1lzy7CsxAodU2_DZpGrduExJ2p",
      href: "#",
    },
  ] satisfies BlogTeaser[],
  newsletter: {
    title: "Đăng ký nhận bản tin sách",
    description:
      "Nhận email ưu tiên mỗi sáng thứ Bảy khi tiệm nhập về các ấn bản hiếm, bản in trước 1975 hoặc bộ sưu tập độc bản chưa kịp đăng lên kệ.",
    submitLabel: "Đăng Ký Ngay",
    successMessage: "Cảm ơn bạn hữu đã đăng ký nhận tin sách xưa!",
    placeholder: "Nhập địa chỉ email của bạn...",
  },
  footerQuickLinks: [
    { label: "Văn Học Tiền Chiến", href: "/books" },
    { label: "Sách NXB Cầu Vồng", href: "/books" },
    { label: "Ấn Bản Trước 1975", href: "/books" },
    { label: "Sách Có Chữ Ký Tác Giả", href: "/books" },
    { label: "Địa Chí Ba Miền", href: "/books" },
  ] satisfies FooterLink[],
  footerPolicyLinks: [
    { label: "Quy trình thẩm định & cam kết độ mới", href: "#" },
    { label: "Chính sách đổi trả 7 ngày miễn phí", href: "#" },
    { label: "Đóng bọc 3 lớp & giao hàng hỏa tốc", href: "#" },
    { label: "Nhận ký gửi & thu mua tủ sách gia đình", href: "#" },
    { label: "Quy định bảo mật & điều khoản sử dụng", href: "#" },
  ] satisfies FooterLink[],
  footerLegalLinks: [
    { label: "Chính Sách Bảo Mật", href: "#" },
    { label: "Điều Khoản Mua Hàng", href: "#" },
    { label: "Sơ Đồ Website", href: "#" },
  ] satisfies FooterLink[],
  socialLinks: [
    { label: "Facebook", abbrev: "f", href: "#" },
    { label: "LinkedIn", abbrev: "in", href: "#" },
    { label: "YouTube", abbrev: "yt", href: "#" },
    { label: "Zalo", abbrev: "zalo", href: "#" },
  ] satisfies SocialLink[],
  showcase: {
    eyebrow: "Danh Mục Được Yêu Thích",
    title: "Sách Đọc Hay & Bản In Tuyển Chọn",
    viewAllLabel: "Xem Toàn Bộ Sách Mới Về Hôm Nay",
  },
  authorsSection: {
    eyebrow: "Cây Bút Bất Hủ",
    title: "Tác Giả Được Độc Giả Yêu Thích",
    viewAllLabel: "Xem Tất Cả (45 Tác Giả)",
  },
} as const;

export const HOME_IMAGE_SOURCE_NOTE =
  "External prototype CDN URLs — replace with /media or local assets when ready.";

export function homeCopyrightLine(year = new Date().getFullYear()) {
  return `© ${year} ${homeContent.brand.name}. Giữ gìn và tôn vinh di sản văn hiến Việt Nam.`;
}

/** In-page section href from any shop route. */
export function homeSectionHref(sectionId: string, onHome: boolean) {
  return onHome ? `#${sectionId}` : `/#${sectionId}`;
}
