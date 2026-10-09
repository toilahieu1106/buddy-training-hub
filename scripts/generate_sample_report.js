const { PrismaClient } = require("@prisma/client");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// Màu thương hiệu Bệnh viện Đa khoa Phương Đông
const BRAND_PRIMARY = "00685E";   // Xanh Ngọc Bích / Deep Teal
const BRAND_ACCENT = "004D46";    // Xanh Teal đậm
const BRAND_LIGHT = "F0F7F6";     // Xanh ngọc rất nhạt cho dòng xen kẽ
const BORDER_COLOR = "D0DDD8";    // Viền nhẹ hài hòa
const FONT_FAMILY = "Inter";

async function main() {
  const course = await prisma.course.findFirst({
    where: { status: "ACTIVE" },
    include: {
      sessions: { orderBy: { sessionNumber: "asc" } },
      students: { orderBy: { fullName: "asc" } },
    },
  });

  if (!course) {
    console.error("No active course found");
    return;
  }

  const students = course.students;
  const sessions = course.sessions;
  const attendances = await prisma.attendance.findMany({
    where: { sessionId: { in: sessions.map((s) => s.id) } },
  });

  const assignments = await prisma.assignment.findMany({
    where: { sessionId: { in: sessions.map((s) => s.id) } },
    include: { session: true, submissions: { include: { reviews: true } } },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Bệnh viện Đa khoa Phương Đông";
  workbook.lastModifiedBy = "Buddy Training Hub";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Helper styles
  const thinBorder = {
    top: { style: "thin", color: { argb: BORDER_COLOR } },
    left: { style: "thin", color: { argb: BORDER_COLOR } },
    bottom: { style: "thin", color: { argb: BORDER_COLOR } },
    right: { style: "thin", color: { argb: BORDER_COLOR } },
  };

  // ==========================================
  // SHEET 1: BÁO CÁO CHUYÊN CẦN 4 BUỔI
  // ==========================================
  const wsAtt = workbook.addWorksheet("1. Chuyên Cần 4 Buổi", {
    views: [{ showGridLines: true }],
  });

  // Title Banner
  wsAtt.mergeCells("A1:M1");
  const titleCell1 = wsAtt.getCell("A1");
  titleCell1.value = "BỆNH VIỆN ĐA KHOA PHƯƠNG ĐÔNG — BÁO CÁO CHUYÊN CẦN ĐÀO TẠO QUẢN LÝ";
  titleCell1.font = { name: FONT_FAMILY, size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_PRIMARY } };
  titleCell1.alignment = { horizontal: "center", vertical: "middle" };
  wsAtt.getRow(1).height = 36;

  // Subtitle
  wsAtt.mergeCells("A2:M2");
  const subCell1 = wsAtt.getCell("A2");
  subCell1.value = `Khóa đào tạo: ${course.name} • Ngày xuất báo cáo: ${new Date().toLocaleDateString("vi-VN")}`;
  subCell1.font = { name: FONT_FAMILY, size: 10.5, italic: true, color: { argb: "FF334155" } };
  subCell1.alignment = { horizontal: "center", vertical: "middle" };
  wsAtt.getRow(2).height = 22;

  // Empty row
  wsAtt.getRow(3).height = 10;

  // Header columns (Row 4)
  const attHeaders = [
    "STT",
    "MÃ HỌC VIÊN",
    "HỌ VÀ TÊN",
    "CHỨC DANH",
    "KHOA / PHÒNG",
    "CẤP QUẢN LÝ",
    "BUỔI 1 (10/10)",
    "BUỔI 2 (15/10)",
    "BUỔI 3 (22/10)",
    "BUỔI 4 (29/10)",
    "TỔNG BUỔI CÓ MẶT",
    "TỶ LỆ CHUYÊN CẦN",
    "ĐÁNH GIÁ",
  ];

  const headerRow1 = wsAtt.getRow(4);
  headerRow1.values = attHeaders;
  headerRow1.height = 32;

  headerRow1.eachCell((cell) => {
    cell.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_PRIMARY } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = thinBorder;
  });

  // Data rows
  let rowNum = 5;
  students.forEach((st, idx) => {
    let attendedCount = 0;
    const sessionDetails = sessions.map((sess) => {
      const att = attendances.find((a) => a.sessionId === sess.id && a.studentId === st.id);
      if (att && att.checkInAt) {
        attendedCount++;
        const inTime = new Date(att.checkInAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        const outTime = att.checkOutAt
          ? new Date(att.checkOutAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
          : "Chưa out";
        const statusText = att.checkInStatus === "ON_TIME" ? "Đúng giờ" : "Đi trễ";
        return `${statusText}\n(${inTime} - ${outTime})`;
      }
      return "Vắng";
    });

    const rate = Math.round((attendedCount / sessions.length) * 100);
    const evaluation = attendedCount === 4 ? "Đạt 100%" : attendedCount >= 3 ? "Đạt" : "Cần học bù";

    const rowData = [
      idx + 1,
      st.studentCode,
      st.fullName,
      st.title || "Bác sĩ",
      st.department || "BV Phương Đông",
      st.managementLevel || "Quản lý",
      sessionDetails[0] || "Vắng",
      sessionDetails[1] || "Vắng",
      sessionDetails[2] || "Vắng",
      sessionDetails[3] || "Vắng",
      `${attendedCount}/${sessions.length}`,
      `${rate}%`,
      evaluation,
    ];

    const r = wsAtt.getRow(rowNum);
    r.values = rowData;
    r.height = 28;

    const isEven = idx % 2 === 1;
    const bgColor = isEven ? BRAND_LIGHT : "FFFFFFFF";

    r.eachCell((cell, colIndex) => {
      cell.font = { name: FONT_FAMILY, size: 10.5, color: { argb: "FF1E293B" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      cell.border = thinBorder;

      // Alignments & wrapping
      if (colIndex === 1 || colIndex === 2 || colIndex === 11 || colIndex === 12 || colIndex === 13) {
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      } else if (colIndex >= 7 && colIndex <= 10) {
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      }

      if (colIndex === 2) {
        cell.font = { name: FONT_FAMILY, size: 10.5, bold: true, color: { argb: BRAND_ACCENT } };
      }
      if (colIndex === 12) {
        cell.font = { name: FONT_FAMILY, size: 10.5, bold: true, color: { argb: "FF0F766E" } };
      }
    });

    rowNum++;
  });

  // Column widths for Sheet 1
  wsAtt.columns = [
    { width: 6 },   // STT
    { width: 16 },  // Mã
    { width: 26 },  // Họ tên
    { width: 26 },  // Chức danh
    { width: 24 },  // Khoa phòng
    { width: 18 },  // Cấp QL
    { width: 22 },  // B1
    { width: 22 },  // B2
    { width: 22 },  // B3
    { width: 22 },  // B4
    { width: 16 },  // Tổng buổi
    { width: 18 },  // Tỷ lệ
    { width: 18 },  // Đánh giá
  ];

  // ==========================================
  // SHEET 2: KẾT QUẢ THU NỘP BÀI TẬP
  // ==========================================
  const wsSub = workbook.addWorksheet("2. Kết Quả Nộp Bài Tập", {
    views: [{ showGridLines: true }],
  });

  wsSub.mergeCells("A1:L1");
  const titleCell2 = wsSub.getCell("A1");
  titleCell2.value = "BỆNH VIỆN ĐA KHOA PHƯƠNG ĐÔNG — BẢNG TỔNG HỢP & NHẬN XÉT BÀI TẬP";
  titleCell2.font = { name: FONT_FAMILY, size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_PRIMARY } };
  titleCell2.alignment = { horizontal: "center", vertical: "middle" };
  wsSub.getRow(1).height = 36;

  wsSub.mergeCells("A2:L2");
  const subCell2 = wsSub.getCell("A2");
  subCell2.value = `Khóa đào tạo: ${course.name} • Đánh giá & phản hồi từ Giảng viên Buddy`;
  subCell2.font = { name: FONT_FAMILY, size: 10.5, italic: true, color: { argb: "FF334155" } };
  subCell2.alignment = { horizontal: "center", vertical: "middle" };
  wsSub.getRow(2).height = 22;

  wsSub.getRow(3).height = 10;

  const subHeaders = [
    "STT",
    "BUỔI",
    "TÊN BÀI TẬP",
    "MÃ HỌC VIÊN",
    "HỌ VÀ TÊN",
    "KHOA / PHÒNG",
    "TRẠNG THÁI",
    "THỜI GIAN NỘP",
    "HÌNH THỨC",
    "LINK / TẬP TIN",
    "XẾP LOẠI",
    "LỜI NHẬN XÉT CỦA GIẢNG VIÊN",
  ];

  const headerRow2 = wsSub.getRow(4);
  headerRow2.values = subHeaders;
  headerRow2.height = 32;

  headerRow2.eachCell((cell) => {
    cell.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_PRIMARY } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = thinBorder;
  });

  let subRowNum = 5;
  let countSub = 1;
  for (const assign of assignments) {
    for (const st of students) {
      const userSubs = assign.submissions.filter((s) => s.studentId === st.id);
      const latestSub = userSubs.sort((a, b) => b.version - a.version)[0];
      const latestRev = latestSub?.reviews?.[latestSub.reviews.length - 1];

      const gradeText = latestRev
        ? latestRev.grade === "XUAT_SAC"
          ? "Xuất sắc"
          : latestRev.grade === "DAT"
          ? "Đạt"
          : "Cần cải thiện"
        : "Chưa chấm";

      const r = wsSub.getRow(subRowNum);
      r.values = [
        countSub++,
        `Buổi ${assign.session.sessionNumber}`,
        assign.title,
        st.studentCode,
        st.fullName,
        st.department || "",
        latestSub ? (latestSub.isLate ? "Nộp trễ" : "Đã nộp") : "Chưa nộp",
        latestSub ? new Date(latestSub.submittedAt).toLocaleString("vi-VN") : "",
        latestSub ? (latestSub.type === "LINK" ? "Link Docs/Drive" : "File upload") : "",
        latestSub ? latestSub.contentUrl || latestSub.fileName || "" : "",
        gradeText,
        latestRev ? latestRev.publicComment || "" : "",
      ];
      r.height = 30;

      const isEven = countSub % 2 === 1;
      const bgColor = isEven ? BRAND_LIGHT : "FFFFFFFF";

      r.eachCell((cell, colIndex) => {
        cell.font = { name: FONT_FAMILY, size: 10.5, color: { argb: "FF1E293B" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.border = thinBorder;

        if (colIndex === 1 || colIndex === 2 || colIndex === 4 || colIndex === 7 || colIndex === 8 || colIndex === 9 || colIndex === 11) {
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        } else {
          cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        }

        if (colIndex === 4) {
          cell.font = { name: FONT_FAMILY, size: 10.5, bold: true, color: { argb: BRAND_ACCENT } };
        }
      });

      subRowNum++;
    }
  }

  wsSub.columns = [
    { width: 6 },   // STT
    { width: 10 },  // Buổi
    { width: 32 },  // Tên bài
    { width: 16 },  // Mã
    { width: 25 },  // Họ tên
    { width: 22 },  // Khoa phòng
    { width: 16 },  // Trạng thái
    { width: 22 },  // Thời gian
    { width: 18 },  // Hình thức
    { width: 40 },  // Link/File
    { width: 16 },  // Xếp loại
    { width: 45 },  // Lời nhận xét
  ];

  // ==========================================
  // SHEET 3: DANH SÁCH MÃ HỌC VIÊN
  // ==========================================
  const wsStd = workbook.addWorksheet("3. Danh Sách Cán Bộ", {
    views: [{ showGridLines: true }],
  });

  wsStd.mergeCells("A1:H1");
  const titleCell3 = wsStd.getCell("A1");
  titleCell3.value = "BỆNH VIỆN ĐA KHOA PHƯƠNG ĐÔNG — DANH SÁCH ĐỊNH DANH MÃ HỌC VIÊN";
  titleCell3.font = { name: FONT_FAMILY, size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_PRIMARY } };
  titleCell3.alignment = { horizontal: "center", vertical: "middle" };
  wsStd.getRow(1).height = 36;

  wsStd.mergeCells("A2:H2");
  const subCell3 = wsStd.getCell("A2");
  subCell3.value = `Danh sách 20 Cán bộ quản lý • Cấp mã điểm danh & nộp bài tự động`;
  subCell3.font = { name: FONT_FAMILY, size: 10.5, italic: true, color: { argb: "FF334155" } };
  subCell3.alignment = { horizontal: "center", vertical: "middle" };
  wsStd.getRow(2).height = 22;

  wsStd.getRow(3).height = 10;

  const stdHeaders = [
    "STT",
    "MÃ HỌC VIÊN",
    "HỌ VÀ TÊN",
    "CHỨC DANH",
    "KHOA / PHÒNG",
    "CẤP QUẢN LÝ",
    "EMAIL LIÊN HỆ",
    "SỐ ĐIỆN THOẠI",
  ];

  const headerRow3 = wsStd.getRow(4);
  headerRow3.values = stdHeaders;
  headerRow3.height = 32;

  headerRow3.eachCell((cell) => {
    cell.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_PRIMARY } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = thinBorder;
  });

  let stdRowNum = 5;
  students.forEach((st, idx) => {
    const r = wsStd.getRow(stdRowNum);
    r.values = [
      idx + 1,
      st.studentCode,
      st.fullName,
      st.title || "Bác sĩ",
      st.department || "BV Phương Đông",
      st.managementLevel || "Quản lý",
      st.email || "",
      st.phone || "",
    ];
    r.height = 26;

    const isEven = idx % 2 === 1;
    const bgColor = isEven ? BRAND_LIGHT : "FFFFFFFF";

    r.eachCell((cell, colIndex) => {
      cell.font = { name: FONT_FAMILY, size: 10.5, color: { argb: "FF1E293B" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      cell.border = thinBorder;

      if (colIndex === 1 || colIndex === 2 || colIndex === 8) {
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      }

      if (colIndex === 2) {
        cell.font = { name: FONT_FAMILY, size: 10.5, bold: true, color: { argb: BRAND_ACCENT } };
      }
    });

    stdRowNum++;
  });

  wsStd.columns = [
    { width: 6 },   // STT
    { width: 16 },  // Mã
    { width: 26 },  // Họ tên
    { width: 26 },  // Chức danh
    { width: 24 },  // Khoa phòng
    { width: 18 },  // Cấp QL
    { width: 26 },  // Email
    { width: 18 },  // SĐT
  ];

  const exportDir = path.join(process.cwd(), "public", "exports");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const filePath = path.join(exportDir, "bao_cao_chuyen_can_4_buoi_BVPD.xlsx");
  await workbook.xlsx.writeFile(filePath);
  console.log("SUCCESS: Exported styled Excel file to " + filePath);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
