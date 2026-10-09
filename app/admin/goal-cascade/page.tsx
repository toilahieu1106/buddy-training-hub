"use client";

import React, { useState } from "react";
import Link from "next/link";

interface TeamProgress {
  id: string;
  name: string;
  leader: string;
  score: number;
  currentStep: number;
  status: "IN_PROGRESS" | "SUBMITTED" | "REVIEWED";
  stepStatus: boolean[]; // 7 steps
  keyResult: string;
  q2Status: "RESOLVED" | "PENDING";
}

export default function AdminGoalCascadePage() {
  const [unlockedStep, setUnlockedStep] = useState<number>(7);
  const [scenarioBroadcasted, setScenarioBroadcasted] = useState<boolean>(true);
  const [selectedTeam, setSelectedTeam] = useState<string>("t1");

  const [teams, setTeams] = useState<TeamProgress[]>([
    {
      id: "t1",
      name: "Nhóm 1 - Khoa Khám bệnh",
      leader: "BS. CKII Nguyễn Văn An",
      score: 95,
      currentStep: 7,
      status: "SUBMITTED",
      stepStatus: [true, true, true, true, true, true, true],
      keyResult: "Rút ngắn thời gian chờ từ 45p → 30p, hài lòng ≥ 92%",
      q2Status: "RESOLVED",
    },
    {
      id: "t2",
      name: "Nhóm 2 - Khối Điều dưỡng",
      leader: "ThS. Nguyễn Thị Lan",
      score: 90,
      currentStep: 7,
      status: "SUBMITTED",
      stepStatus: [true, true, true, true, true, true, true],
      keyResult: "100% điều dưỡng đạt chuẩn giao tiếp AIDET, hài lòng ≥ 95%",
      q2Status: "RESOLVED",
    },
    {
      id: "t3",
      name: "Nhóm 3 - Phòng Chăm sóc Khách hàng",
      leader: "ThS. Trương Mỹ Xuyên",
      score: 85,
      currentStep: 6,
      status: "IN_PROGRESS",
      stepStatus: [true, true, true, true, true, true, false],
      keyResult: "Tỷ lệ tiếp đón hài lòng 98%, xử lý khiếu nại trong 24h",
      q2Status: "PENDING",
    },
    {
      id: "t4",
      name: "Nhóm 4 - Khoa Cấp cứu & Ngoại khoa",
      leader: "BS. CKI Phan Quốc Uy",
      score: 92,
      currentStep: 7,
      status: "SUBMITTED",
      stepStatus: [true, true, true, true, true, true, true],
      keyResult: "Tiếp nhận & chẩn đoán cấp cứu ≤ 15 phút, an toàn trước mổ",
      q2Status: "RESOLVED",
    },
    {
      id: "t5",
      name: "Nhóm 5 - Phòng Quản lý Chất lượng & KHTH",
      leader: "BS. CKI Hoàng Thị Hoa",
      score: 88,
      currentStep: 7,
      status: "SUBMITTED",
      stepStatus: [true, true, true, true, true, true, true],
      keyResult: "Dashboard cảnh báo sớm chỉ số y khoa toàn viện",
      q2Status: "RESOLVED",
    },
    {
      id: "t6",
      name: "Nhóm 6 - Phòng Tổ chức Cán bộ & Đào tạo",
      leader: "ThS. Đặng Tuấn Khang",
      score: 82,
      currentStep: 5,
      status: "IN_PROGRESS",
      stepStatus: [true, true, true, true, true, false, false],
      keyResult: "100% cán bộ hoàn thành tập huấn năng lực điều hành",
      q2Status: "PENDING",
    },
  ]);

  const activeTeamData = teams.find((t) => t.id === selectedTeam) || teams[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#00685E] text-white font-bold px-2.5 py-0.5 rounded font-mono uppercase">
              Buổi 2 - Đào tạo Quản lý
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Điều Phối Live: Công Cụ Phân Rã Mục Tiêu 5W1H (Goal Cascade)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tiến độ thực hành trực tiếp của 6 nhóm khoa/phòng, mở khóa từng bước và phát kịch bản mô phỏng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal/goal-cascade"
            target="_blank"
            className="text-xs font-bold bg-white text-[#00685E] border border-[#00685E] px-3.5 py-2 rounded hover:bg-teal-50 transition"
          >
            Mở Workspace Học Viên ↗
          </Link>
          <button
            onClick={() => setScenarioBroadcasted(!scenarioBroadcasted)}
            className={`text-xs font-bold px-4 py-2 rounded transition shadow font-mono ${
              scenarioBroadcasted
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-amber-400 text-slate-950 hover:bg-amber-300"
            }`}
          >
            {scenarioBroadcasted ? "✓ Đã Phát Kịch Bản Quý 2" : "⚡ Phát Kịch Bản Mô Phỏng Quý 2"}
          </button>
        </div>
      </div>

      {/* Live Instructor Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step Unlocker */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Điều khiển mở khóa bước thực hành
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "B1 - B2", value: 2 },
              { label: "B3 - B6 (5W1H)", value: 6 },
              { label: "B7 & Review", value: 7 },
            ].map((st) => (
              <button
                key={st.value}
                onClick={() => setUnlockedStep(st.value)}
                className={`py-2 text-xs font-bold rounded border text-center transition font-mono ${
                  unlockedStep >= st.value
                    ? "bg-[#00685E] text-white border-[#00685E]"
                    : "bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiến độ nộp bài</div>
            <div className="text-2xl font-black text-[#00685E] font-mono mt-1">4 / 6 Nhóm</div>
            <div className="text-[11px] text-slate-500">67% hoàn thành toàn bộ 7 bước</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm chất lượng TB</div>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-1">88.6 / 100</div>
            <div className="text-[11px] text-emerald-700">Đạt chuẩn SMART y tế</div>
          </div>
        </div>

        {/* Projection Mode */}
        <div className="bg-gradient-to-r from-teal-900 to-[#00685E] text-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-mono">
              Chế độ Hội trường
            </span>
            <h3 className="text-xs font-bold mt-1.5">Chiếu Cây Phân Rã & So Sánh 6 Nhóm</h3>
          </div>
          <Link
            href="/portal/goal-cascade"
            target="_blank"
            className="text-xs font-bold bg-white text-slate-950 px-3 py-1.5 rounded text-center hover:bg-slate-100 transition mt-2 font-mono"
          >
            Mở Chế Độ Toàn Màn Hình
          </Link>
        </div>
      </div>

      {/* Main Teams Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Teams List (Col 5) */}
        <div className="md:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Danh sách 6 Nhóm Khoa/Phòng Thực hành
          </div>

          <div className="space-y-2">
            {teams.map((team) => (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(team.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition ${
                  selectedTeam === team.id
                    ? "border-2 border-[#00685E] bg-teal-50/40 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{team.name}</span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      team.score >= 90
                        ? "bg-emerald-100 text-emerald-800"
                        : team.score >= 80
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {team.score}đ
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 mt-1">
                  Trưởng nhóm: <strong className="text-slate-800">{team.leader}</strong>
                </div>

                <div className="text-[11px] text-slate-600 mt-1 truncate">
                  Chỉ tiêu: {team.keyResult}
                </div>

                {/* 7 steps progress pills */}
                <div className="flex items-center gap-1 mt-2.5">
                  {team.stepStatus.map((done, i) => (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        done ? "bg-[#00685E]" : "bg-slate-200"
                      }`}
                      title={`Bước ${i + 1}: ${done ? "Đã xong" : "Chưa xong"}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Detail & Grading Panel (Col 7) */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <span className="text-[10px] font-bold bg-[#00685E] text-white px-2 py-0.5 rounded font-mono uppercase">
                Chi tiết bài thực hành
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{activeTeamData.name}</h3>
              <p className="text-xs text-slate-500">Người đại diện: {activeTeamData.leader}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Trạng thái:</span>
              <span className="text-xs font-bold font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                {activeTeamData.status}
              </span>
            </div>
          </div>

          {/* Quick Review Details */}
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Mục tiêu & Kết quả then chốt (Bước 1 & 2):
              </span>
              <p className="font-semibold text-slate-800">{activeTeamData.keyResult}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Kế hoạch 5W1H (Bước 3 - 6):
              </span>
              <p className="text-slate-700">
                Đã thiết lập đầy đủ đầu việc, người phụ trách chính (Who), nguồn lực và tiến độ hoàn thành trước Quý 3/2027.
              </p>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded">
              <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">
                Xử lý Kịch bản Mô phỏng Quý 2 (Review):
              </span>
              <p className="text-rose-900 font-medium">
                Đã đề xuất phương án điều phối nhân sự tăng cường và mở thêm bàn khám cao điểm sáng.
              </p>
            </div>
          </div>

          {/* Instructor Feedback Input */}
          <div className="space-y-2 pt-2 border-t">
            <label className="block text-xs font-bold text-slate-800 uppercase">
              Nhận xét & Đánh giá của Giảng viên Buddy:
            </label>
            <textarea
              rows={3}
              defaultValue="Nhóm phân rã mục tiêu rất sát với thực tế vận hành BV Phương Đông. Cần lưu ý bổ sung phương án dự phòng khi máy móc cận lâm sàng bảo trì."
              className="w-full border border-slate-300 rounded p-2.5 text-xs focus:ring-1 focus:ring-[#00685E]"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button className="bg-[#00685E] text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider">
                Lưu Nhận Xét & Gửi Cho Nhóm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
