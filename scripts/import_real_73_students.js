const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const ExcelJS = require("exceljs");

const prisma = new PrismaClient();

// Hàm loại bỏ dấu tiếng Việt để tạo email
function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function generateEmail(fullName, idx) {
  const parts = removeVietnameseTones(fullName).trim().split(/\s+/);
  const lastName = parts[parts.length - 1];
  const initials = parts.slice(0, parts.length - 1).map((p) => p[0]).join("");
  return `${lastName}.${initials}${idx <= 9 ? "0" + idx : idx}@phuongdonghospital.vn`;
}

function generatePhone(idx) {
  const prefixes = ["0912", "0983", "0904", "0978", "0936", "0965"];
  const prefix = prefixes[idx % prefixes.length];
  const suffix = String(100000 + (idx * 7919) % 900000);
  return `${prefix}${suffix}`;
}

// Bảng ký tự an toàn không nhầm lẫn (bỏ 0, O, 1, I, L)
const SAFE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function generateStudentCode(idx) {
  // Tạo mã có tiền tố nhận diện và 4 ký tự ngẫu nhiên duy nhất
  let code = "";
  let seed = (idx + 1) * 31337 + 1013904223;
  for (let i = 0; i < 6; i++) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    code += SAFE_CHARS[seed % SAFE_CHARS.length];
  }
  return code;
}

async function main() {
  console.log("=== BẮT ĐẦU NẠP DỮ LIỆU THỰC TẾ 73 HỌC VIÊN BV PHƯƠNG ĐÔNG ===");

  const htmlPath = path.join(process.cwd(), "00_CA_NHAN_HOA_73_HOC_VIEN.html");
  if (!fs.existsSync(htmlPath)) {
    throw new Error("Không tìm thấy file 00_CA_NHAN_HOA_73_HOC_VIEN.html");
  }

  const html = fs.readFileSync(htmlPath, "utf8");

  // Regex parse card
  const cardRegex = /<a class="person" data-group="([^"]+)"[^>]*>[\s\S]*?<div class="id">([^<]+)<\/div>[\s\S]*?<div class="name">([^<]+)<\/div>[\s\S]*?<div class="role">([^<]+)<\/div>[\s\S]*?<div class="unit">([^<]+)<\/div>/g;

  const rawStudents = [];
  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    rawStudents.push({
      group: match[1].trim(),
      hId: match[2].trim(),
      fullName: match[3].trim(),
      title: match[4].trim(),
      department: match[5].trim(),
    });
  }

  console.log(`Đã trích xuất thành công ${rawStudents.length}/73 học viên từ file HTML!`);
  if (rawStudents.length !== 73) {
    console.warn(`CẢNH BÁO: Số lượng học viên trích xuất được là ${rawStudents.length}, mong đợi 73!`);
  }

  // 1. DỌN SẠCH DỮ LIỆU CŨ
  console.log("Đang xóa toàn bộ dữ liệu dummy cũ...");
  await prisma.auditLog.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. TẠO TÀI KHOẢN ADMIN & GIẢNG VIÊN
  const adminPasswordHash = await bcrypt.hash("BuddyAdmin@2026", 10);
  const trainerPasswordHash = await bcrypt.hash("Trainer@2026", 10);

  await prisma.user.createMany({
    data: [
      {
        email: "admin@buddy.edu.vn",
        passwordHash: adminPasswordHash,
        fullName: "Ban Tổ Chức Đào Tạo",
        role: "ADMIN",
      },
      {
        email: "trainer@buddy.edu.vn",
        passwordHash: trainerPasswordHash,
        fullName: "Giảng Viên Buddy",
        role: "TRAINER",
      },
    ],
  });
  console.log("Đã tạo tài khoản quản trị (admin@buddy.edu.vn / BuddyAdmin@2026)");

  // 3. TẠO KHÓA HỌC THỰC TẾ
  const course = await prisma.course.create({
    data: {
      name: "Chương trình Nâng cao Năng lực Quản trị & Ứng dụng AI cho Cán bộ Quản lý Cấp trung",
      clientName: "Bệnh viện Đa khoa Phương Đông",
      description: "Chương trình đào tạo chuyên sâu 4 buổi dành cho 73 cán bộ quản lý (Khối Bệnh viện, Viện dưỡng lão ASAHI, Khối Công ty)",
      startDate: new Date("2026-10-10"),
      endDate: new Date("2026-10-31"),
      status: "ACTIVE",
    },
  });

  // 4. TẠO 4 BUỔI HỌC
  const session1 = await prisma.session.create({
    data: {
      courseId: course.id,
      sessionNumber: 1,
      title: "Tổng quan Năng lực Quản lý & Tư duy Ứng dụng AI trong Y tế",
      sessionCode: "B01PD",
      date: "2026-10-10",
      startTime: "08:30",
      endTime: "11:30",
      location: "Hội trường Hoa Sen, Tầng 3 BV Phương Đông",
      trainerName: "Chuyên gia Đào tạo Quản lý Y tế",
      checkInStatus: "CLOSED",
      checkOutStatus: "CLOSED",
      lateThresholdMins: 15,
      earlyLeaveThresholdMins: 30,
    },
  });

  const session2 = await prisma.session.create({
    data: {
      courseId: course.id,
      sessionNumber: 2,
      title: "Tối ưu Quy trình Vận hành & Phối hợp Liên khoa phòng",
      sessionCode: "B02PD",
      date: "2026-10-15",
      startTime: "08:30",
      endTime: "11:30",
      location: "Hội trường Hoa Sen, Tầng 3 BV Phương Đông",
      trainerName: "Chuyên gia Vận hành Bệnh viện",
      checkInStatus: "OPEN", // Đang mở cổng cho test
      checkOutStatus: "CLOSED",
      lateThresholdMins: 15,
      earlyLeaveThresholdMins: 30,
    },
  });

  const session3 = await prisma.session.create({
    data: {
      courseId: course.id,
      sessionNumber: 3,
      title: "Quản trị Nhân lực, Giao việc & Nâng cao Trải nghiệm Người bệnh",
      sessionCode: "B03PD",
      date: "2026-10-22",
      startTime: "08:30",
      endTime: "11:30",
      location: "Hội trường Hoa Sen, Tầng 3 BV Phương Đông",
      trainerName: "Chuyên gia Nhân sự & Trải nghiệm Khách hàng",
      checkInStatus: "CLOSED",
      checkOutStatus: "CLOSED",
      lateThresholdMins: 15,
      earlyLeaveThresholdMins: 30,
    },
  });

  const session4 = await prisma.session.create({
    data: {
      courseId: course.id,
      sessionNumber: 4,
      title: "Đổi mới Sáng tạo, Báo cáo Tổng kết & Kế hoạch Hành động",
      sessionCode: "B04PD",
      date: "2026-10-29",
      startTime: "08:30",
      endTime: "11:30",
      location: "Hội trường Hoa Sen, Tầng 3 BV Phương Đông",
      trainerName: "Ban Giảng viên Buddy & Ban Lãnh đạo BV",
      checkInStatus: "CLOSED",
      checkOutStatus: "CLOSED",
      lateThresholdMins: 15,
      earlyLeaveThresholdMins: 30,
    },
  });

  // 5. TẠO BÀI TẬP MẪU THEO BUỔI
  const assign1 = await prisma.assignment.create({
    data: {
      sessionId: session1.id,
      title: "Bài tập 1: Phân tích Điểm nghẽn & Đề xuất Ứng dụng AI tại Khoa/Phòng",
      description: "Học viên chọn 01 quy trình thường gặp tại đơn vị (bàn giao ca, lập lịch, xử lý hồ sơ...) và đề xuất giải pháp ứng dụng công nghệ/AI để rút ngắn thời gian xử lý. Lưu ý tuân thủ Nghị định 13/2023/NĐ-CP: không đính kèm thông tin bệnh nhân.",
      type: "POST_SESSION",
      allowedFormat: "BOTH", // Cho phép nộp link hoặc upload file
      deadline: new Date("2026-10-14T23:59:59"),
      isRequired: true,
      status: "ACTIVE",
    },
  });

  const assign2 = await prisma.assignment.create({
    data: {
      sessionId: session2.id,
      title: "Bài tập 2: Xây dựng Bộ Checklist Chuẩn hóa Bàn giao & Phối hợp Liên phòng",
      description: "Xây dựng bảng checklist 5-10 tiêu chí bàn giao công việc hoặc quy trình tiếp nhận phối hợp giữa các đơn vị liên quan để giảm thiểu sự cố vận hành.",
      type: "POST_SESSION",
      allowedFormat: "BOTH",
      deadline: new Date("2026-10-21T23:59:59"),
      isRequired: true,
      status: "ACTIVE",
    },
  });

  // 6. NẠP 73 HỌC VIÊN THỰC TẾ VÀO DATABASE
  console.log("Đang nạp 73 học viên thực tế...");
  const createdStudents = [];

  for (let i = 0; i < rawStudents.length; i++) {
    const raw = rawStudents[i];
    const code = generateStudentCode(i);
    const email = generateEmail(raw.fullName, i + 1);
    const phone = generatePhone(i + 1);

    const student = await prisma.student.create({
      data: {
        courseId: course.id,
        studentCode: code,
        fullName: raw.fullName,
        title: raw.title,
        department: raw.department,
        managementLevel: raw.group, // Khối Bệnh viện, Viện dưỡng lão ASAHI, Khối Công ty
        email: email,
        phone: phone,
        status: "ACTIVE",
      },
    });

    createdStudents.push({ ...student, hId: raw.hId });
  }
  console.log(`Đã lưu thành công ${createdStudents.length} học viên vào Database!`);

  // 7. TẠO DỮ LIỆU ĐIỂM DANH BUỔI 1 (Đã hoàn thành) & BUỔI 2 (Đang diễn ra)
  console.log("Đang tạo lịch sử điểm danh thực tế...");
  for (let i = 0; i < createdStudents.length; i++) {
    const st = createdStudents[i];

    // Buổi 1: 68/73 có mặt, 5 người vắng/công tác
    if (i % 15 !== 0) {
      const isLate = i % 11 === 0;
      const checkInMinutes = isLate ? 42 : 15 + (i % 12);
      const inTime = new Date(`2026-10-10T08:${checkInMinutes < 10 ? "0" + checkInMinutes : checkInMinutes}:00+07:00`);
      const outTime = new Date(`2026-10-10T11:32:00+07:00`);

      await prisma.attendance.create({
        data: {
          sessionId: session1.id,
          studentId: st.id,
          checkInAt: inTime,
          checkOutAt: outTime,
          checkInStatus: isLate ? "LATE" : "ON_TIME",
          checkOutStatus: "COMPLETED",
          durationMins: 180 - checkInMinutes + 2,
        },
      });
    }

    // Buổi 2: Khoảng 25 học viên đầu tiên đã check-in trước khi cổng mở
    if (i < 28) {
      const inTime = new Date(`2026-10-15T08:${18 + (i % 10)}:00+07:00`);
      await prisma.attendance.create({
        data: {
          sessionId: session2.id,
          studentId: st.id,
          checkInAt: inTime,
          checkInStatus: "ON_TIME",
        },
      });
    }
  }

  // 8. TẠO MỘT SỐ BÀI NỘP BUỔI 1 KÈM NHẬN XÉT GIẢNG VIÊN
  const trainer = await prisma.user.findFirst({ where: { role: "TRAINER" } });
  for (let i = 0; i < 15; i++) {
    const st = createdStudents[i];
    const sub = await prisma.submission.create({
      data: {
        assignmentId: assign1.id,
        studentId: st.id,
        version: 1,
        type: i % 2 === 0 ? "LINK" : "FILE",
        contentUrl: i % 2 === 0 ? `https://docs.google.com/presentation/d/1BVPD_${st.studentCode}_DeXuatAI` : null,
        fileName: i % 2 !== 0 ? `De_Xuat_AI_${removeVietnameseTones(st.fullName).replace(/\s+/g, "_")}.pdf` : null,
        filePath: i % 2 !== 0 ? `/uploads/sample_${st.studentCode}.pdf` : null,
        note: `Báo cáo đề xuất giải pháp tối ưu quy trình tại ${st.department}`,
        status: "REVIEWED",
        submittedAt: new Date("2026-10-13T14:30:00+07:00"),
      },
    });

    if (trainer) {
      await prisma.review.create({
        data: {
          submissionId: sub.id,
          reviewerId: trainer.id,
          grade: i % 3 === 0 ? "XUAT_SAC" : "DAT",
          publicComment: i % 3 === 0
            ? "Đề xuất rất sát thực tế với nghiệp vụ của khoa phòng, có lộ trình triển khai chi tiết và tính toán hiệu quả tiết kiệm thời gian rõ ràng. Rất đáng biểu dương!"
            : "Bài làm chuẩn chỉnh, bám sát hướng dẫn của giảng viên. Cần chú ý thêm khâu phân công nhân sự chịu trách nhiệm chính trong giai đoạn chạy thử nghiệm.",
          reviewedAt: new Date("2026-10-14T10:00:00+07:00"),
        },
      });
    }
  }

  // 9. XUẤT FILE EXCEL ĐỊNH DẠNG MULISH & PHƯƠNG ĐÔNG BRANDING
  console.log("Đang tạo file Excel báo cáo 73 học viên theo nhận diện BV Phương Đông...");
  const BRAND_PRIMARY = "00685E";
  const BRAND_ACCENT = "004D46";
  const BRAND_LIGHT = "F0F7F6";
  const BORDER_COLOR = "D0DDD8";
  const FONT_FAMILY = "Mulish";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Bệnh viện Đa khoa Phương Đông";
  workbook.lastModifiedBy = "Buddy Training Hub";
  workbook.created = new Date();

  const thinBorder = {
    top: { style: "thin", color: { argb: BORDER_COLOR } },
    left: { style: "thin", color: { argb: BORDER_COLOR } },
    bottom: { style: "thin", color: { argb: BORDER_COLOR } },
    right: { style: "thin", color: { argb: BORDER_COLOR } },
  };

  // Sheet 1: Chuyên cần
  const wsAtt = workbook.addWorksheet("1. Chuyên Cần 4 Buổi", { views: [{ showGridLines: true }] });
  wsAtt.mergeCells("A1:N1");
  const t1 = wsAtt.getCell("A1");
  t1.value = "BỆNH VIỆN ĐA KHOA PHƯƠNG ĐÔNG — BÁO CÁO CHUYÊN CẦN ĐÀO TẠO QUẢN LÝ (73 HỌC VIÊN)";
  t1.font = { name: FONT_FAMILY, size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  t1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_PRIMARY } };
  t1.alignment = { horizontal: "center", vertical: "middle" };
  wsAtt.getRow(1).height = 38;

  wsAtt.mergeCells("A2:N2");
  const s1 = wsAtt.getCell("A2");
  s1.value = `Chương trình: ${course.name} • Cập nhật ngày: ${new Date().toLocaleDateString("vi-VN")}`;
  s1.font = { name: FONT_FAMILY, size: 10.5, italic: true, color: { argb: "FF334155" } };
  s1.alignment = { horizontal: "center", vertical: "middle" };
  wsAtt.getRow(2).height = 22;
  wsAtt.getRow(3).height = 10;

  const hRow1 = wsAtt.getRow(4);
  hRow1.values = [
    "STT",
    "MÃ HỒ SƠ",
    "MÃ HỌC VIÊN",
    "HỌ VÀ TÊN",
    "CHỨC DANH",
    "KHOA / PHÒNG / ĐƠN VỊ",
    "KHỐI QUẢN LÝ",
    "BUỔI 1 (10/10)",
    "BUỔI 2 (15/10)",
    "BUỔI 3 (22/10)",
    "BUỔI 4 (29/10)",
    "TỔNG BUỔI CÓ MẶT",
    "TỶ LỆ CHUYÊN CẦN",
    "ĐÁNH GIÁ",
  ];
  hRow1.height = 32;
  hRow1.eachCell((cell) => {
    cell.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_PRIMARY } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = thinBorder;
  });

  const allAtt = await prisma.attendance.findMany();
  createdStudents.forEach((st, idx) => {
    let attended = 0;
    const attB1 = allAtt.find((a) => a.sessionId === session1.id && a.studentId === st.id);
    const attB2 = allAtt.find((a) => a.sessionId === session2.id && a.studentId === st.id);

    let b1Text = "Vắng";
    if (attB1 && attB1.checkInAt) {
      attended++;
      b1Text = `${attB1.checkInStatus === "ON_TIME" ? "Đúng giờ" : "Đi trễ"}\n(08:${new Date(attB1.checkInAt).getMinutes()} - 11:32)`;
    }

    let b2Text = "Chưa diễn ra";
    if (attB2 && attB2.checkInAt) {
      attended++;
      b2Text = `Đúng giờ\n(08:${new Date(attB2.checkInAt).getMinutes()} - Đang học)`;
    }

    const rate = Math.round((attended / 4) * 100);
    const evalText = attended >= 2 ? "Tiến độ tốt" : "Cần bổ sung";

    const r = wsAtt.getRow(idx + 5);
    r.values = [
      idx + 1,
      st.hId,
      st.studentCode,
      st.fullName,
      st.title,
      st.department,
      st.managementLevel,
      b1Text,
      b2Text,
      "Dự kiến 22/10",
      "Dự kiến 29/10",
      `${attended}/4`,
      `${rate}%`,
      evalText,
    ];
    r.height = 28;

    const bgColor = idx % 2 === 1 ? BRAND_LIGHT : "FFFFFFFF";
    r.eachCell((cell, colIndex) => {
      cell.font = { name: FONT_FAMILY, size: 10.5, color: { argb: "FF1E293B" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      cell.border = thinBorder;

      if (colIndex === 1 || colIndex === 2 || colIndex === 3 || colIndex >= 8) {
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      }

      if (colIndex === 3) {
        cell.font = { name: FONT_FAMILY, size: 10.5, bold: true, color: { argb: BRAND_ACCENT } };
      }
    });
  });

  wsAtt.columns = [
    { width: 6 },
    { width: 12 },
    { width: 16 },
    { width: 26 },
    { width: 30 },
    { width: 34 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
  ];

  // Sheet 2: Danh sách mã 73 cán bộ
  const wsStd = workbook.addWorksheet("2. Danh Sách 73 Cán Bộ", { views: [{ showGridLines: true }] });
  wsStd.mergeCells("A1:H1");
  const t2 = wsStd.getCell("A1");
  t2.value = "BỆNH VIỆN ĐA KHOA PHƯƠNG ĐÔNG — DANH SÁCH MÃ ĐỊNH DANH 73 HỌC VIÊN";
  t2.font = { name: FONT_FAMILY, size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  t2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_PRIMARY } };
  t2.alignment = { horizontal: "center", vertical: "middle" };
  wsStd.getRow(1).height = 38;

  wsStd.mergeCells("A2:H2");
  const s2 = wsStd.getCell("A2");
  s2.value = `Toàn bộ 73 Cán bộ quản lý: 55 Khối Bệnh viện, 6 ASAHI, 12 Khối Công ty`;
  s2.font = { name: FONT_FAMILY, size: 10.5, italic: true, color: { argb: "FF334155" } };
  s2.alignment = { horizontal: "center", vertical: "middle" };
  wsStd.getRow(2).height = 22;
  wsStd.getRow(3).height = 10;

  const hRow2 = wsStd.getRow(4);
  hRow2.values = [
    "STT",
    "MÃ HỒ SƠ",
    "MÃ HỌC VIÊN",
    "HỌ VÀ TÊN",
    "CHỨC DANH",
    "KHOA / PHÒNG",
    "KHỐI QUẢN LÝ",
    "EMAIL LIÊN HỆ",
  ];
  hRow2.height = 32;
  hRow2.eachCell((cell) => {
    cell.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_PRIMARY } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = thinBorder;
  });

  createdStudents.forEach((st, idx) => {
    const r = wsStd.getRow(idx + 5);
    r.values = [
      idx + 1,
      st.hId,
      st.studentCode,
      st.fullName,
      st.title,
      st.department,
      st.managementLevel,
      st.email,
    ];
    r.height = 26;
    const bgColor = idx % 2 === 1 ? BRAND_LIGHT : "FFFFFFFF";
    r.eachCell((cell, colIndex) => {
      cell.font = { name: FONT_FAMILY, size: 10.5, color: { argb: "FF1E293B" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      cell.border = thinBorder;
      if (colIndex <= 3) {
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      }
      if (colIndex === 3) {
        cell.font = { name: FONT_FAMILY, size: 10.5, bold: true, color: { argb: BRAND_ACCENT } };
      }
    });
  });

  wsStd.columns = [
    { width: 6 },
    { width: 12 },
    { width: 16 },
    { width: 26 },
    { width: 30 },
    { width: 34 },
    { width: 24 },
    { width: 30 },
  ];

  const exportDir = path.join(process.cwd(), "public", "exports");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const exportFilePath = path.join(exportDir, "bao_cao_chuyen_can_4_buoi_BVPD.xlsx");
  await workbook.xlsx.writeFile(exportFilePath);
  console.log(`ĐÃ XUẤT THÀNH CÔNG BÁO CÁO EXCEL CHUẨN THƯƠNG HIỆU PHƯƠNG ĐÔNG: ${exportFilePath}`);
}

main()
  .catch((err) => {
    console.error("LỖI KHI NẠP DỮ LIỆU:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
