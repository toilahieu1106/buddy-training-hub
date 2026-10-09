import { prisma } from "@/lib/prisma";
import { formatTimeVN, formatDateVN } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const course = await prisma.course.findFirst({
    where: { status: "ACTIVE" },
    include: {
      sessions: { orderBy: { sessionNumber: "asc" } },
      students: {
        where: { status: "ACTIVE" },
        orderBy: { fullName: "asc" },
      },
    },
  });

  if (!course) {
    return <div className="p-8 text-white">Chưa có khóa học.</div>;
  }

  const students = course.students;
  const sessions = course.sessions;

  const attendances = await prisma.attendance.findMany({
    where: { sessionId: { in: sessions.map((s) => s.id) } },
  });

  const assignments = await prisma.assignment.findMany({
    where: { sessionId: { in: sessions.map((s) => s.id) } },
    include: {
      submissions: {
        include: { reviews: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            TRUNG TÂM BÁO CÁO & XUẤT DỮ LIỆU
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            BÁO CÁO TỔNG KẾT KHÓA ĐÀO TẠO
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dữ liệu chuyên cần 4 buổi và kết quả nộp bài tập của Bệnh viện Phương Đông
          </p>
        </div>

        <div>
          <a
            href="/api/admin/reports/export-excel"
            className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-lg whitespace-nowrap transition-colors shadow-lg"
          >
            Tải file báo cáo Excel (.xlsx)
          </a>
        </div>
      </div>

      {/* Attendance Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-6">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-white">
            BẢNG THEO DÕI CHUYÊN CẦN 4 BUỔI
          </h2>
          <p className="text-xs text-slate-400">
            Tổng hợp giờ check-in và check-out chi tiết của từng học viên
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 font-code">MÃ</th>
                <th className="py-3 px-3">HỌ VÀ TÊN</th>
                <th className="py-3 px-3">KHOA PHÒNG</th>
                {sessions.map((sess) => (
                  <th key={sess.id} className="py-3 px-3 text-center">
                    BUỔI {sess.sessionNumber}
                  </th>
                ))}
                <th className="py-3 px-3 text-right">TỶ LỆ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {students.map((st) => {
                let attended = 0;
                return (
                  <tr key={st.id} className="hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-code font-bold text-emerald-400">
                      {st.studentCode}
                    </td>
                    <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                      {st.fullName}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {st.department || "--"}
                    </td>

                    {sessions.map((sess) => {
                      const att = attendances.find((a) => a.sessionId === sess.id && a.studentId === st.id);
                      const isPresent = att && att.checkInAt;
                      if (isPresent) attended++;

                      return (
                        <td key={sess.id} className="py-3 px-3 text-center">
                          {isPresent ? (
                            <span
                              className={`inline-block text-[10px] font-bold font-code px-2 py-0.5 rounded border ${
                                att.checkInStatus === "ON_TIME"
                                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                  : "bg-amber-950 text-amber-300 border-amber-800"
                              }`}
                            >
                              {formatTimeVN(att.checkInAt)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-code text-slate-600">
                              --
                            </span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-right font-code font-bold text-emerald-400">
                      {Math.round((attended / (sessions.length || 1)) * 100)}% ({attended}/{sessions.length})
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
