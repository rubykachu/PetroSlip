# Hệ thống In Phiếu Cấp Xăng Dầu

**Phiên bản:** 1.2.0 | **Cập nhật:** 10/02/2026

Công cụ web tĩnh (Single HTML File) giúp in phiếu cấp xăng dầu hàng loạt — chạy trực tiếp trên trình duyệt, không cần cài đặt, không cần server.

---

## Cách sử dụng

1. Mở file `printer.html` bằng trình duyệt (Chrome, Edge, Firefox).
2. Điền thông tin công ty, chọn khổ giấy, nhập dải số seri.
3. Bấm **IN PHIẾU NGAY**.

---

## Tính năng

### Tùy chỉnh tiêu đề
- **Tên đơn vị** — có slider điều chỉnh cỡ chữ (7–16pt).
- **Địa chỉ & SĐT** — có slider điều chỉnh cỡ chữ (6–12pt).
- **Mã số thuế (MST)** — tùy chọn, để trống nếu không cần hiển thị.
- **Giãn dòng tiêu đề** — slider điều chỉnh khoảng cách dòng phần header (1.0–2.0).

### Cơ chế in theo số Series

**Định dạng số seri:** `YYMM/NNNN`
- `YY` = 2 số cuối năm, `MM` = tháng (VD: `2602/0001` = phiếu thứ 1, tháng 02/2026).
- Phần `YYMM` tự động sinh theo thời điểm hiện tại.

**Quy trình in hàng loạt:**
1. Người dùng nhập **Từ số (Min)** và **Đến số (Max)**.
2. Hệ thống tính số lượng phiếu = `Max − Min + 1`.
3. Bấm **IN PHIẾU NGAY** → hiện xác nhận số lượng, khổ giấy, hướng giấy.
4. Hệ thống render toàn bộ phiếu (mỗi phiếu = 1 trang in, gồm 2 liên) vào vùng ẩn bằng `DocumentFragment`.
5. Số seri trên mỗi phiếu tăng dần: `YYMM/0001`, `YYMM/0002`, ... `YYMM/NNNN`.
6. Gọi `window.print()` — trình duyệt mở hộp thoại in với đúng N trang.
7. Sau khi in, giá trị `Max` được lưu vào `localStorage`.

**Gợi ý thông minh:**
- Khi tải lại trang, ô **Min** tự động điền `Max_cũ + 1` dựa trên lần in gần nhất.
- VD: Lần trước in đến số 50 → lần sau mở lên, ô Min hiện sẵn 51.

**Giới hạn:** Tối đa 500 phiếu mỗi lần in (ngăn tràn bộ nhớ trình duyệt).

### Tùy chỉnh nội dung
- **Địa điểm nhận** — nhập sẵn địa chỉ sẽ tự động in trên cả 2 liên. Hỗ trợ tùy chọn **in đậm** và **in nghiêng**.
- **Khổ giấy:** A5 (210×148mm) hoặc A6 (148×105mm).
- **Hướng giấy:** Ngang (mặc định) hoặc Dọc.
  - *Ngang:* 2 liên nằm cạnh nhau (trái–phải), đường xé dọc.
  - *Dọc:* 2 liên xếp trên–dưới, đường xé ngang.
- **Giãn dòng nội dung** — slider (1.0–2.5).
- **Cỡ chữ nội dung** — slider (7–14pt).

### Bố cục phiếu
Mỗi tờ phiếu gồm **2 liên** giống nhau về nội dung:
- **Liên 1:** Lưu.
- **Liên 2:** Giao cửa hàng xăng dầu.

Nội dung mỗi liên:
```
[Tên đơn vị]
[Địa chỉ]
[MST (nếu có)]

PHIẾU CẤP XĂNG DẦU
(Liên X: ...)      Số: 2602/0001

Địa điểm nhận / Nhận tại: .......................
Biển số xe: ................  Tên lái xe: ................

Số lượng xăng dầu được cấp
Số tiền: .................................... VNĐ
Bằng chữ: ......................................

Người nhận          Ngày ... tháng ... năm 20...
(Ký, ghi rõ họ tên)       Người lập phiếu
                           (Ký, ghi rõ họ tên)
```

### Lưu trữ cấu hình
- Tất cả cài đặt được lưu tự động vào `localStorage`.
- Khi tải lại trang, cấu hình trước đó được khôi phục nguyên vẹn.
- Nút **Xóa Cấu Hình** để reset về mặc định.

### Cơ chế Version Token
- Mỗi phiên bản code có một `CONFIG_VERSION` (VD: `v1.2.0-2026-02-10`).
- Khi deploy bản mới với version khác, `localStorage` cũ tự động bị reset về defaults.
- Đảm bảo người dùng luôn nhận được cấu hình mặc định mới nhất khi có cập nhật.

---

## Thông số kỹ thuật

| Mục | Chi tiết |
|---|---|
| **Tech stack** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Dependencies** | Không (Zero dependencies, single file) |
| **Font chữ** | Times New Roman, Georgia, serif |
| **Khổ giấy** | A5 (210×148mm), A6 (148×105mm) |
| **Hướng giấy** | Ngang (landscape), Dọc (portrait) |
| **Giới hạn in** | 500 phiếu/lần |
| **Lưu trữ** | localStorage (`fuel_voucher_config`) |
| **Tương thích** | Chrome, Edge, Firefox (phiên bản mới nhất) |

---

## Cấu trúc thư mục

```
printer/
├── printer.html   # File chính (single file, tất cả HTML + CSS + JS)
├── prd.md         # Product Requirements Document
└── README.md      # File này
```

---

## Changelog

### v1.2.0 (10/02/2026)
- Thêm hỗ trợ khổ giấy A6.
- Thêm tùy chọn hướng giấy Dọc/Ngang.
- Tối ưu font size và khoảng cách cho A6 (cả dọc và ngang).
- Thêm slider giãn dòng tiêu đề.
- Thêm input "Địa điểm nhận" với tùy chọn in đậm/in nghiêng.
- Thay thế nội dung Xăng/Dầu bằng Số tiền + Bằng chữ.
- Thêm cơ chế version token cho localStorage.
- Hiển thị phiên bản và ngày cập nhật trên giao diện.
- MST là trường tùy chọn (optional).

### v1.0.0
- Phiên bản đầu tiên.
- In phiếu A5 ngang, 2 liên, số seri tự động tăng.
- Lưu cấu hình localStorage.
