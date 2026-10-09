"use client";

import { useState, useEffect } from "react";
import { formatDateVN } from "@/lib/date";

export default function StudentManagementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");

  // Import Excel Modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  // Reissue code Modal state
  const [showReissueModal, setShowReissueModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [reissueReason, setReissueReason] = useState("Học viên làm mất/quên mã");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports/export-excel?jsonOnly=true"); // We can fetch from an internal api or prisma
      // Let's create a dedicated student list fetcher or use inline api
      const studentRes = await fetch("/api/admin/students/list");
      if (studentRes.ok) {
        const json = await studentRes.json();
        setStudents(json.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const res = await fetch("/api/admin/students/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setImportResult(data);
      if (res.ok) {
        await fetchStudents();
      }
    } catch (err) {
      setImportResult({ error: "Lỗi kết nối khi tải file" });
    } finally {
      setImporting(false);
    }
  };

  const handleReissueCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const res = await fetch("/api/admin/students/reissue-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          reason: reissueReason,
          actorName: "Admin Buddy",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Đã cấp mã mới thành công: ${data.newCode}`);
        setShowReissueModal(false);
        await fetchStudents();
      } else {
        alert(data.error || "Lỗi cấp lại mã");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.department && s.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchLevel =
      filterLevel === "ALL" ||
      s.managementLevel === filterLevel;

    return matchSearch && matchLevel;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            QUẢN TRỊ DANH SÁCH
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            DANH SÁCH HỌC VIÊN & MÃ ĐỊNH DANH
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tổng cộng: <span className="text-white font-bold font-code">{students.length}</span> học viên
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setShowImportModal(true);
              setImportResult(null);
            }}
            className="text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors shadow"
          >
            IMPORT TỪ EXCEL
          </button>
          <a
            href="/api/admin/reports/export-excel"
            className="text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors"
          >
            XUẤT DANH SÁCH MÃ
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Tìm theo tên, mã học viên, khoa phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold uppercase text-slate-400 whitespace-nowrap">KHỐI ĐƠN VỊ:</span>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterLevel("ALL")}
              className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filterLevel === "ALL" ? "bg-emerald-700 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              TẤT CẢ (73)
            </button>
            <button
              onClick={() => setFilterLevel("Khối Bệnh viện")}
              className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filterLevel === "Khối Bệnh viện" ? "bg-emerald-700 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              KHỐI BỆNH VIỆN (55)
            </button>
            <button
              onClick={() => setFilterLevel("Viện dưỡng lão ASAHI")}
              className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filterLevel === "Viện dưỡng lão ASAHI" ? "bg-emerald-700 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              ASAHI (6)
            </button>
            <button
              onClick={() => setFilterLevel("Khối Công ty")}
              className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filterLevel === "Khối Công ty" ? "bg-emerald-700 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              KHỐI CÔNG TY (12)
            </button>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-code">MÃ HỌC VIÊN</th>
                <th className="py-3.5 px-4">HỌ VÀ TÊN</th>
                <th className="py-3.5 px-4">CHỨC DANH / KHOA PHÒNG</th>
                <th className="py-3.5 px-4">CẤP QUẢN LÝ</th>
                <th className="py-3.5 px-4">LIÊN HỆ (EMAIL/SĐT)</th>
                <th className="py-3.5 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-code">
                    [ ĐANG TẢI DANH SÁCH HỌC VIÊN... ]
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Không tìm thấy học viên phù hợp.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-code font-bold text-emerald-400 text-sm">
                      {st.studentCode}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {st.fullName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{st.title || "--"}</div>
                      <div className="text-slate-400 text-[11px]">{st.department || "--"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {st.managementLevel || "Quản lý"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-code text-[11px] text-slate-400">
                      <div>{st.email || "--"}</div>
                      <div>{st.phone || "--"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(st);
                          setShowReissueModal(true);
                        }}
                        className="text-[11px] font-bold uppercase text-amber-400 hover:text-amber-300 border border-amber-900 bg-amber-950/40 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
                      >
                        CẤP LẠI MÃ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                NHẬP DANH SÁCH HỌC VIÊN TỪ EXCEL
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-xs text-slate-400 hover:text-white whitespace-nowrap"
              >
                Đóng
              </button>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">File Excel mẫu:</span>
              <a
                href="/templates/danh_sach_mau_50_hoc_vien_BVPD.xlsx"
                download
                className="font-code font-bold text-emerald-400 hover:underline whitespace-nowrap"
              >
                Tải file mẫu .xlsx
              </a>
            </div>

            <p className="text-xs text-slate-400">
              Hệ thống chấp nhận file .xlsx hoặc .csv với các cột: <br />
              <span className="font-code text-slate-300">Họ tên, Chức danh, Khoa/phòng, Cấp quản lý, Email, Số điện thoại</span>
            </p>

            {importResult && (
              <div className={`p-4 rounded-lg text-xs ${
                importResult.success
                  ? "bg-emerald-950/80 border border-emerald-800 text-emerald-200"
                  : "bg-rose-950/80 border border-rose-800 text-rose-200"
              }`}>
                {importResult.message || importResult.error}
              </div>
            )}

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  required
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:bg-blue-600 file:text-white bg-slate-950 p-3 rounded-lg border border-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="w-1/3 bg-slate-800 text-slate-300 text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="w-2/3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap"
                >
                  {importing ? "ĐANG XỬ LÝ..." : "TIẾN HÀNH IMPORT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reissue Code Modal */}
      {showReissueModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                CẤP LẠI MÃ HỌC VIÊN
              </h3>
              <button
                onClick={() => setShowReissueModal(false)}
                className="text-xs text-slate-400 hover:text-white whitespace-nowrap"
              >
                Đóng
              </button>
            </div>

            <div className="text-xs space-y-2 bg-slate-950 p-3 rounded border border-slate-800">
              <div>Học viên: <span className="font-bold text-white">{selectedStudent.fullName}</span></div>
              <div>Mã hiện tại: <span className="font-code font-bold text-rose-400">{selectedStudent.studentCode}</span> (Sẽ bị vô hiệu hóa)</div>
            </div>

            <form onSubmit={handleReissueCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  LÝ DO CẤP LẠI MÃ (AUDIT LOG)
                </label>
                <input
                  type="text"
                  value={reissueReason}
                  onChange={(e) => setReissueReason(e.target.value)}
                  required
                  className="w-full text-xs bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReissueModal(false)}
                  className="w-1/3 bg-slate-800 text-slate-300 text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap"
                >
                  TẠO MÃ MỚI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
