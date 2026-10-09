import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateVN, formatTimeVN } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const course = await prisma.course.findFirst({
    where: { status: "ACTIVE" },
    include: {
      sessions: {
        orderBy: { sessionNumber: "asc" },
        include: {
          attendances: true,
          assignments: {
            include: {
              submissions: true,
            },
          },
        },
      },
      students: {
        where: { status: "ACTIVE" },
      },
    },
  });

  const recentLogs = await prisma.auditLog.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  if (!course) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="text-xl font-bold text-white">Chưa có khóa học nào được kích hoạt</h2>
      </div>
    );
  }

  const totalStudents = course.students.length;

  return (
    <div className="space-y-8">
      {/* Course Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
            {course.clientName}
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            {course.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quy mô: <span className="text-white font-bold font-code">{totalStudents}</span> học viên • 4 buổi đào tạo
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/students"
            className="text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors"
          >
            QUẢN LÝ HỌC VIÊN
          </Link>
          <a
            href="/api/admin/reports/export-excel"
            className="text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors shadow"
          >
            XUẤT BÁO CÁO EXCEL
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            TỔNG SỐ HỌC VIÊN
          </span>
          <div className="mt-2 text-3xl font-extrabold font-code text-white">
            {totalStudents}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Cán bộ quản lý Bệnh viện Phương Đông
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            TỔNG SỐ BUỔI HỌC
          </span>
          <div className="mt-2 text-3xl font-extrabold font-code text-emerald-400">
            4 BUỔI
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Khóa đào tạo điều hành chuyên sâu
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            BÀI TẬP ĐÃ KHỞI TẠO
          </span>
          <div className="mt-2 text-3xl font-extrabold font-code text-blue-400">
            {course.sessions.reduce((acc, s) => acc + s.assignments.length, 0)} BÀI
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Bao gồm bài tại lớp & sau đào tạo
          </span>
        </div>
      </div>

      {/* 4 Sessions Grid with Live Projector Screen Links */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-200">
            ĐIỀU HÀNH 4 BUỔI ĐÀO TẠO & MÀN HÌNH CHIẾU LIVE QR
          </h2>
          <Link
            href="/admin/sessions"
            className="text-xs font-semibold uppercase text-slate-400 hover:text-white"
          >
            CẤU HÌNH BUỔI HỌC
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {course.sessions.map((sess) => {
            const checkedInCount = sess.attendances.filter((a) => a.checkInAt !== null).length;
            const checkedOutCount = sess.attendances.filter((a) => a.checkOutAt !== null).length;
            const rate = totalStudents > 0 ? Math.round((checkedInCount / totalStudents) * 100) : 0;

            return (
              <div
                key={sess.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-code font-bold text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded border border-slate-700">
                        BUỔI {sess.sessionNumber}
                      </span>
                      <span className="font-code text-xs text-slate-400">
                        MÃ: {sess.sessionCode}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          sess.checkInStatus === "OPEN"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        CHECK-IN: {sess.checkInStatus === "OPEN" ? "ĐANG MỞ" : "ĐÓNG"}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          sess.checkOutStatus === "OPEN"
                            ? "bg-amber-950 text-amber-300 border-amber-700"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        CHECK-OUT: {sess.checkOutStatus === "OPEN" ? "ĐANG MỞ" : "ĐÓNG"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1">
                    {sess.title}
                  </h3>

                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                    <div>Thời gian: <span className="text-slate-300 font-code">{formatDateVN(sess.date)} ({sess.startTime} - {sess.endTime})</span></div>
                    <div>Địa điểm: <span className="text-slate-300">{sess.location || "Hội trường Hoa Sen"}</span></div>
                    <div>Giảng viên: <span className="text-slate-300">{sess.trainerName || "Buddy Trainer"}</span></div>
                  </div>

                  {/* Attendance Stats Bar */}
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-400 uppercase">TIẾN ĐỘ ĐIỂM DANH:</span>
                      <span className="text-emerald-400 font-code font-bold">
                        {checkedInCount} / {totalStudents} ({rate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Big Action: Open Projector Live Screen */}
                <div className="pt-2">
                  <Link
                    href={`/admin/sessions/${sess.id}/live`}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-lg whitespace-nowrap transition-colors shadow"
                  >
                    MỞ MÀN HÌNH CHIẾU LIVE QR CHO HỘI TRƯỜNG
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG GẦN ĐÂY (AUDIT LOG)
        </h3>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-500">Chưa có hoạt động nào được ghi nhận.</p>
        ) : (
          <div className="divide-y divide-slate-800 text-xs">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                <div>
                  <span className="font-bold text-slate-300">{log.actorName}</span>
                  <span className="text-slate-500 mx-2">•</span>
                  <span className="font-code text-emerald-400 uppercase">{log.action}</span>
                  <span className="text-slate-400 ml-2">({log.entityType})</span>
                </div>
                <span className="font-code text-slate-500 text-[11px]">
                  {formatTimeVN(log.createdAt)} {formatDateVN(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
