# Ngữ cảnh làm việc — vot-com-bot

## Phạm vi và nguồn chung

Repository `bcasolutions-vn/vot-com-bot` quản lý bot Discord đặt cơm, theo dõi công nợ và dashboard Express/EJS dùng chung dữ liệu Supabase. Đọc [README.md](README.md), [CLAUDE.md](CLAUDE.md) và [ngữ cảnh repository](docs/repository-context.md) trước khi thực hiện thay đổi. Giữ các workflow, quy tắc phát triển và hướng dẫn tài liệu hiện có trong `CLAUDE.md`; `.claude/` là bộ công cụ hỗ trợ phát triển.

Nguồn chung: [Engineering Knowledge](https://github.com/droppii/engineering-knowledge/tree/docs/repository-context-pilot). Đọc AI Context và tiêu chuẩn liên quan; ghi revision repository và Engineering Knowledge thực sự sử dụng trong PR hoặc hồ sơ công việc. Nếu thiếu ngữ cảnh ảnh hưởng tới quyết định, kiểm tra nguồn liên quan rồi yêu cầu bổ sung.

## Điểm bắt đầu trong mã

| Loại thay đổi | Nguồn | Phụ thuộc cần xét |
| --- | --- | --- |
| Bot và slash commands | `index.js`, `commands/`, `deploy-commands.js` | Discord application, collector, bảng `menus`/`orders`; tên command lấy từ `.setName()`. |
| Web và API | `routes/api.js`, `views/`, `public/js/app.js` | Hợp đồng JSON Express, Supabase Realtime, dữ liệu người dùng. |
| API Cloudflare | `functions/api/` | Response khác Express; chưa có dashboard HTML tĩnh trong Git. |
| Dữ liệu, giá và vận hành | `supabase-schema.sql`, `supabase-client.js`, `utils/price-extractor.js`, `ecosystem.config.js` | Quyền Supabase, ngày UTC, công nợ, PM2 và cấu hình môi trường bên ngoài. |

## Chuẩn bị, kiểm chứng và giới hạn

- Lệnh và điều kiện chạy ở [docs/repository-context.md](docs/repository-context.md). `npm test` là placeholder luôn thoát lỗi; không có bộ test sản phẩm hoặc script build/lint/start trong `package.json` hiện tại.
- Kiểm cú pháp không chứng minh bot, API hoặc database hoạt động đúng. Ghi rõ kiểm tra đã chạy, kết quả và phần chưa kiểm chứng.
- `node index.js` mở web và đăng nhập Discord; `node deploy-commands.js` ghi danh sách commands toàn application. Bot dùng `TOKEN`, script đăng ký dùng `DISCORD_TOKEN`; đối chiếu trước khi vận hành.
- Chỉ chạy bot, đăng ký commands, migration, PM2, ghi Supabase hoặc gửi notifications khi nhiệm vụ cho phép đúng môi trường. Test tích hợp cần application/server Discord và Supabase thử nghiệm tách riêng.
- Không đưa token, dữ liệu người dùng, đơn ăn hoặc công nợ thật vào log bàn giao, tài liệu hay fixture chung. `SUPABASE_KEY` xuất hiện ở trình duyệt qua layout; không dùng khóa đặc quyền. Schema hiện có policy public read/write, chưa cô lập dữ liệu theo Discord server.

## Hoàn tất và duy trì

Kiểm diff, liên kết và phạm vi ảnh hưởng trước bàn giao. Cập nhật ngữ cảnh cùng thay đổi lệnh, schema, hợp đồng API hoặc triển khai; giữ tiêu chuẩn chung tại Engineering Knowledge. Không suy ra cấu hình triển khai thực tế chỉ từ hướng dẫn hosting hoặc việc không có workflow trong Git.

## Profile thực thi

Đọc [.engineering/README.md](.engineering/README.md) để chọn profile theo module và nhu cầu kiểm chứng. Dùng checkout/worktree do công cụ agent quản lý theo công việc; phân biệt kiểm nguồn, kiểm mã và kiểm thử hành vi.
