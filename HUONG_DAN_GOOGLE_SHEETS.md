# Hướng dẫn kết nối Sổ Lưu Bút với Google Sheets

## Bước 1: Tạo Google Sheet

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo một bảng tính mới
3. Đặt tên các cột ở hàng đầu tiên:
   - A1: `Thời gian`
   - B1: `Họ tên`
   - C1: `Email`
   - D1: `Tham dự`
   - E1: `Lời chúc`

## Bước 2: Tạo Google Apps Script

1. Trong Google Sheet, vào menu **Extensions** > **Apps Script**
2. Xóa code mặc định và dán code sau:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    new Date(),
    data.name,
    data.email,
    data.attending,
    data.message
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({status: 'success'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var wishes = [];
  
  // Bỏ qua hàng tiêu đề (i = 1)
  for (var i = 1; i < data.length; i++) {
    if (data[i][1]) { // Chỉ thêm nếu có tên
      wishes.push({
        timestamp: data[i][0],
        name: data[i][1],
        email: data[i][2],
        attending: data[i][3],
        message: data[i][4]
      });
    }
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(wishes))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Nhấn **Ctrl + S** để lưu
4. Đặt tên project (ví dụ: "Wedding Guestbook")

## Bước 3: Deploy Web App

1. Nhấn nút **Deploy** > **New deployment**
2. Nhấn biểu tượng bánh răng bên cạnh "Select type" > chọn **Web app**
3. Cấu hình:
   - **Description**: Wedding Guestbook
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Nhấn **Deploy**
5. Cấp quyền khi được yêu cầu (nhấn "Advanced" > "Go to [project name]" > "Allow")
6. **Copy URL** của Web app

## Bước 4: Cập nhật Website

1. Mở file `script.js`
2. Tìm dòng:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Thay `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` bằng URL bạn vừa copy

## Bước 5: Test

1. Mở trang web và gửi thử một lời chúc
2. Kiểm tra Google Sheet để xem dữ liệu đã được ghi chưa

## Lưu ý quan trọng

- Mỗi khi thay đổi code trong Apps Script, bạn cần **Deploy lại** (New deployment)
- URL sẽ thay đổi sau mỗi lần deploy mới
- Đảm bảo Google Sheet và Apps Script cùng một tài khoản Google
- Nếu gặp lỗi CORS, hãy đảm bảo "Who has access" được đặt là "Anyone"

## Cấu trúc dữ liệu trong Google Sheet

| Thời gian | Họ tên | Email | Tham dự | Lời chúc |
|-----------|--------|-------|---------|----------|
| 01/01/2026 10:00 | Nguyễn Văn A | a@email.com | yes | Chúc mừng hạnh phúc! |
| 01/01/2026 11:30 | Trần Thị B | | no | Chúc hai bạn trăm năm! |

## Troubleshooting

### Lỗi "Script function not found"
- Đảm bảo đã lưu code trong Apps Script
- Kiểm tra tên hàm `doPost` và `doGet` đúng chính tả

### Lỗi "Authorization required"
- Chạy thử hàm `doGet` trong Apps Script editor để cấp quyền
- Nhấn Run > doGet > Review Permissions > Allow

### Dữ liệu không hiển thị
- Kiểm tra Console trong trình duyệt (F12) để xem lỗi
- Đảm bảo URL đúng và không có khoảng trắng thừa
