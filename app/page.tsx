import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-6 sm:p-12">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            BUDDY TRAINING HUB
          </span>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
            BỆNH VIỆN ĐA KHOA PHƯƠNG ĐÔNG
          </h1>
        </div>
        <Link
          href="/admin/login"
          className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
        >
          ĐĂNG NHẬP GIẢNG VIÊN / ADMIN
        </Link>
      </header>

      {/* Main Content */}
      <section className="max-w-3xl my-auto py-12">
        <div className="inline-block bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-6">
          CHƯƠNG TRÌNH ĐÀO TẠO 2026
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          HỆ THỐNG ĐIỂM DANH & NỘP BÀI TẬP
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
          Nền tảng quản lý chuyên cần và thu nộp bài tập dành riêng cho đội ngũ Quản lý Cấp trung & Cấp cao Bệnh viện Phương Đông.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/checkin"
            className="flex flex-col justify-between p-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-lg hover:shadow-emerald-900/30 group"
          >
            <span className="text-xs uppercase tracking-wider text-emerald-100 mb-2">ĐẦU BUỔI HỌC</span>
            <span className="text-xl font-bold">ĐIỂM DANH CHECK-IN</span>
            <span className="text-xs text-emerald-200 mt-4">Quét QR hoặc nhập mã cá nhân 6 ký tự</span>
          </Link>

          <Link
            href="/checkout"
            className="flex flex-col justify-between p-6 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold transition-all"
          >
            <span className="text-xs uppercase tracking-wider text-slate-400 mb-2">CUỐI BUỔI HỌC</span>
            <span className="text-xl font-bold">CHECK-OUT</span>
            <span className="text-xs text-slate-400 mt-4">Ghi nhận hoàn thành giờ tham dự</span>
          </Link>

          <Link
            href="/portal"
            className="flex flex-col justify-between p-6 rounded-xl bg-blue-900/40 hover:bg-blue-900/60 border border-blue-700/50 text-white font-semibold transition-all"
          >
            <span className="text-xs uppercase tracking-wider text-blue-300 mb-2">HỌC VIÊN</span>
            <span className="text-xl font-bold">TRANG CÁ NHÂN & BÀI TẬP</span>
            <span className="text-xs text-blue-300/80 mt-4">Xem chuyên cần 4 buổi, nộp bài & nhận xét</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 space-y-2 sm:space-y-0">
        <div>
          Bảo mật theo Nghị định 13/2023/NĐ-CP • Thời gian hiển thị theo Asia/Ho_Chi_Minh
        </div>
        <div className="font-code text-slate-400">
          BUDDY TRAINING HUB v1.0
        </div>
      </footer>
    </main>
  );
}
