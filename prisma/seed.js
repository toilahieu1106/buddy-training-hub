const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const SAFE_CHARS = "2345679ACDEFGHJKMNPQRSTUVWXYZ";
function generateCode(length = 6) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)];
  }
  return result;
}

async function main() {
  console.log("=== BẮT ĐẦU XÓA VÀ KHỞI TẠO BỘ DỮ LIỆU KIỂM THỬ (DUMMY DATA) ===");

  // 1. Xóa sạch dữ liệu cũ
  await prisma.review.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.session.deleteMany();
  await prisma.course.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // 2. Tạo Tài khoản Admin & Giảng viên
  const adminPasswordHash = await bcrypt.hash("BuddyAdmin@2026", 10);
  const trainerPasswordHash = await bcrypt.hash("Trainer@2026", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@buddy.edu.vn",
      fullName: "Nguyễn Hoàng Nam (Buddy Admin)",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const trainer = await prisma.user.create({
    data: {
      email: "trainer@buddy.edu.vn",
      fullName: "TS. Lê Hoàng Phúc (Giảng viên Buddy)",
      passwordHash: trainerPasswordHash,
      role: "TRAINER",
    },
  });

  // 3. Tạo Khóa học
  const course = await prisma.course.create({
    data: {
      name: "Chương trình Đào tạo Quản lý Cấp trung & Cấp cao",
      clientName: "Bệnh viện Đa khoa Phương Đông",
      description: "Nâng cao năng lực điều hành khoa phòng, tối ưu hóa quy trình khám chữa bệnh và quản trị nhân sự y tế chuyên nghiệp.",
      startDate: new Date("2026-10-10T01:00:00.000Z"),
      endDate: new Date("2026-10-31T05:00:00.000Z"),
      status: "ACTIVE",
    },
  });

  // 4. Tạo 4 Buổi học
  const session1 = await prisma.session.create({
    data: {
      courseId: course.id,
      sessionNumber: 1,
      title: "Kỹ năng Điều hành & Quản lý Khoa/Phòng Hiện đại",
      date: "2026-10-10",
      startTime: "08:00",
      endTime: "11:30",
      location: "Hội trường Hoa Sen - Tầng 3, BV Phương Đông",
      trainerName: "TS. Lê Hoàng Phúc",
      lateThresholdMins: 15,
      earlyLeaveThresholdMins: 15,
      checkInStatus: "CLOSED", // Đã kết thúc
      checkOutStatus: "CLOSED",
      sessionCode: "BVPD-B1",
      qrToken: "TOKEN_SESSION_1_DONE",
    },
  });

  const session2 = await prisma.session.create({
    data: {
      courseId: course.id,
      sessionNumber: 2,
      title: "Tối ưu Quy trình Khám chữa bệnh & Trải nghiệm Bệnh nhân",
      date: "2026-10-17",
      startTime: "08:00",
      endTime: "11:30",
      location: "Hội trường Hoa Sen - Tầng 3, BV Phương Đông",
      trainerName: "TS. Lê Hoàng Phúc",
      lateThresholdMins: 15,
      earlyLeaveThresholdMins: 15,
      checkInStatus: "OPEN", // ĐANG MỞ ĐIỂM DANH LIVE
      checkOutStatus: "CLOSED",
      sessionCode: "BVPD-B2",
      qrToken: "TOKEN_SESSION_2_LIVE",
    },
  });

  const session3 = await prisma.session.create({
    data: {
      courseId: course.id,
      sessionNumber: 3,
      title: "Ứng dụng Công nghệ & Chuyển đổi số trong Quản trị Bệnh viện",
      date: "2026-10-24",
      startTime: "08:00",
      endTime: "11:30",
      location: "Hội trường Hoa Sen - Tầng 3, BV Phương Đông",
      trainerName: "ThS. Đặng Minh Tuấn",
      lateThresholdMins: 15,
      earlyLeaveThresholdMins: 15,
      checkInStatus: "CLOSED",
      checkOutStatus: "CLOSED",
      sessionCode: "BVPD-B3",
    },
  });

  const session4 = await prisma.session.create({
    data: {
      courseId: course.id,
      sessionNumber: 4,
      title: "Báo cáo Đề án Cải tiến Khoa/Phòng & Tổng kết Khóa",
      date: "2026-10-31",
      startTime: "08:00",
      endTime: "11:30",
      location: "Hội trường Hoa Sen - Tầng 3, BV Phương Đông",
      trainerName: "TS. Lê Hoàng Phúc & Ban Lãnh đạo",
      lateThresholdMins: 15,
      earlyLeaveThresholdMins: 15,
      checkInStatus: "CLOSED",
      checkOutStatus: "CLOSED",
      sessionCode: "BVPD-B4",
    },
  });

  // 5. Danh sách 25 Bác sĩ & Cán bộ Quản lý BV Phương Đông
  const studentDataList = [
    { fullName: "BS. CKII Nguyễn Văn An", title: "Trưởng khoa Cấp cứu", department: "Khoa Cấp cứu", managementLevel: "Quản lý cấp cao", email: "an.nv@phuongdonghospital.vn", phone: "0912345601", studentCode: "K7M4PX" },
    { fullName: "BS. CKI Trần Thị Bích", title: "Phó Trưởng khoa Khám bệnh", department: "Khoa Khám bệnh", managementLevel: "Quản lý cấp trung", email: "bich.tt@phuongdonghospital.vn", phone: "0912345602", studentCode: "W9N2RY" },
    { fullName: "TS. BS Phạm Hoàng Cường", title: "Trưởng khoa Tim mạch", department: "Khoa Tim mạch", managementLevel: "Quản lý cấp cao", email: "cuong.ph@phuongdonghospital.vn", phone: "0912345603", studentCode: "D4H8TJ" },
    { fullName: "ThS. BS Đỗ Thị Dung", title: "Trưởng khoa Sản Phụ", department: "Khoa Sản Phụ", managementLevel: "Quản lý cấp cao", email: "dung.dt@phuongdonghospital.vn", phone: "0912345604", studentCode: "M3P6XQ" },
    { fullName: "BS. CKI Vũ Hải Đăng", title: "Phó Trưởng khoa Ngoại Tổng hợp", department: "Khoa Ngoại Tổng hợp", managementLevel: "Quản lý cấp trung", email: "dang.vh@phuongdonghospital.vn", phone: "0912345605", studentCode: "C8T2VE" },
    { fullName: "ThS. BS Lê Hoàng Giang", title: "Trưởng khoa Nhi", department: "Khoa Nhi", managementLevel: "Quản lý cấp cao", email: "giang.lh@phuongdonghospital.vn", phone: "0912345606", studentCode: "J5Y9NK" },
    { fullName: "BS. CKI Hoàng Thị Hoa", title: "Trưởng phòng Kế hoạch Tổng hợp", department: "Phòng KHTH", managementLevel: "Quản lý cấp cao", email: "hoa.ht@phuongdonghospital.vn", phone: "0912345607", studentCode: "N6R3ZA" },
    { fullName: "ThS. Đặng Tuấn Khang", title: "Trưởng phòng Tổ chức Cán bộ", department: "Phòng TCCB", managementLevel: "Quản lý cấp cao", email: "khang.dt@phuongdonghospital.vn", phone: "0912345608", studentCode: "E2F7WD" },
    { fullName: "ThS. Nguyễn Thị Lan", title: "Trưởng phòng Điều dưỡng", department: "Phòng Điều dưỡng", managementLevel: "Quản lý cấp cao", email: "lan.nt@phuongdonghospital.vn", phone: "0912345609", studentCode: "P9U4MC" },
    { fullName: "BS. CKII Mai Văn Minh", title: "Trưởng khoa Chẩn đoán Hình ảnh", department: "Khoa CĐHA", managementLevel: "Quản lý cấp cao", email: "minh.mv@phuongdonghospital.vn", phone: "0912345610", studentCode: "V3X8TG" },
    { fullName: "BS. CKI Bùi Quỳnh Nga", title: "Phó Trưởng khoa Xét nghiệm", department: "Khoa Xét nghiệm", managementLevel: "Quản lý cấp trung", email: "nga.bq@phuongdonghospital.vn", phone: "0912345611", studentCode: "H7K3PQ" },
    { fullName: "TS. BS Đinh Trọng Phát", title: "Trưởng khoa Hồi sức Tích cực (ICU)", department: "Khoa ICU", managementLevel: "Quản lý cấp cao", email: "phat.dt@phuongdonghospital.vn", phone: "0912345612", studentCode: "Q4W8ZN" },
    { fullName: "ThS. Dược sĩ Cao Minh Quân", title: "Trưởng khoa Dược", department: "Khoa Dược", managementLevel: "Quản lý cấp cao", email: "quan.cm@phuongdonghospital.vn", phone: "0912345613", studentCode: "R2J6YT" },
    { fullName: "BS. CKI Tạ Thu Sang", title: "Phó Trưởng khoa Mắt", department: "Khoa Mắt", managementLevel: "Quản lý cấp trung", email: "sang.tt@phuongdonghospital.vn", phone: "0912345614", studentCode: "T5E9XA" },
    { fullName: "BS. CKII Trịnh Đình Thái", title: "Trưởng khoa Răng Hàm Mặt", department: "Khoa RHM", managementLevel: "Quản lý cấp cao", email: "thai.td@phuongdonghospital.vn", phone: "0912345615", studentCode: "Y8M2CV" },
    { fullName: "ThS. BS Lương Ánh Tuyết", title: "Phó Trưởng khoa Tai Mũi Họng", department: "Khoa TMH", managementLevel: "Quản lý cấp trung", email: "tuyet.la@phuongdonghospital.vn", phone: "0912345616", studentCode: "U3N7KD" },
    { fullName: "BS. CKI Phan Quốc Uy", title: "Trưởng khoa Gây mê Hồi sức", department: "Khoa GMHS", managementLevel: "Quản lý cấp cao", email: "uy.pq@phuongdonghospital.vn", phone: "0912345617", studentCode: "A6F4HR" },
    { fullName: "ThS. BS Ngô Thanh Vân", title: "Phó Trưởng khoa Ung bướu", department: "Khoa Ung bướu", managementLevel: "Quản lý cấp trung", email: "van.nt@phuongdonghospital.vn", phone: "0912345618", studentCode: "S9G3PJ" },
    { fullName: "BS. CKII Dương Quang Vinh", title: "Trưởng khoa Chấn thương Chỉnh hình", department: "Khoa CTCH", managementLevel: "Quản lý cấp cao", email: "vinh.dq@phuongdonghospital.vn", phone: "0912345619", studentCode: "D7C5TW" },
    { fullName: "ThS. Trương Mỹ Xuyên", title: "Trưởng phòng Quản lý Chất lượng", department: "Phòng QLCL", managementLevel: "Quản lý cấp cao", email: "xuyen.tm@phuongdonghospital.vn", phone: "0912345620", studentCode: "F2K8MB" },
  ];

  const createdStudents = [];
  for (const s of studentDataList) {
    const student = await prisma.student.create({
      data: {
        courseId: course.id,
        fullName: s.fullName,
        title: s.title,
        department: s.department,
        managementLevel: s.managementLevel,
        email: s.email,
        phone: s.phone,
        studentCode: s.studentCode,
        status: "ACTIVE",
      },
    });
    createdStudents.push(student);
  }

  // 6. Tạo Dữ liệu Điểm danh Buổi 1 (Đã hoàn thành với nhiều trạng thái thực tế)
  for (let i = 0; i < createdStudents.length; i++) {
    const st = createdStudents[i];
    let checkInAt, checkInStatus, checkOutAt, checkOutStatus, durationMins;

    if (i === 19) {
      // Học viên thứ 20 vắng mặt
      continue;
    } else if (i === 18) {
      // Học viên thứ 19 đi trễ và về sớm
      checkInAt = new Date("2026-10-10T01:25:00.000Z"); // 08:25 (Trễ 25p)
      checkInStatus = "LATE";
      checkOutAt = new Date("2026-10-10T04:00:00.000Z"); // 11:00 (Sớm 30p)
      checkOutStatus = "EARLY_LEAVE";
      durationMins = 155;
    } else if (i % 5 === 0) {
      // Đi trễ nhưng hoàn thành
      checkInAt = new Date("2026-10-10T01:18:00.000Z"); // 08:18
      checkInStatus = "LATE";
      checkOutAt = new Date("2026-10-10T04:35:00.000Z"); // 11:35
      checkOutStatus = "COMPLETED";
      durationMins = 197;
    } else {
      // Đúng giờ và hoàn thành trọn vẹn
      checkInAt = new Date(`2026-10-10T00:${50 + (i % 10)}:00.000Z`); // 07:50 - 07:59
      checkInStatus = "ON_TIME";
      checkOutAt = new Date("2026-10-10T04:32:00.000Z"); // 11:32
      checkOutStatus = "COMPLETED";
      durationMins = 215;
    }

    await prisma.attendance.create({
      data: {
        sessionId: session1.id,
        studentId: st.id,
        checkInAt,
        checkInStatus,
        checkOutAt,
        checkOutStatus,
        durationMins,
        source: i === 1 ? "MANUAL_ADMIN" : "QR_SCAN",
        note: i === 1 ? "Học viên quên mang điện thoại, Admin điểm danh hộ tại bàn đón tiếp" : null,
      },
    });
  }

  // 7. Tạo Dữ liệu Điểm danh Buổi 2 (Đang diễn ra - có 12 người đã check-in, 8 người chưa đến)
  for (let i = 0; i < 14; i++) {
    const st = createdStudents[i];
    const isLate = i > 10;
    await prisma.attendance.create({
      data: {
        sessionId: session2.id,
        studentId: st.id,
        checkInAt: new Date(Date.now() - (15 - i) * 60000),
        checkInStatus: isLate ? "LATE" : "ON_TIME",
        source: "QR_SCAN",
      },
    });
  }

  // 8. Tạo Bài tập
  const assign1 = await prisma.assignment.create({
    data: {
      sessionId: session1.id,
      title: "Bài tập 1: Sơ đồ hóa và Phân tích Nút thắt Quy trình tiếp nhận Khoa phòng",
      description: "Vẽ sơ đồ luồng tiếp nhận người bệnh tại khoa/phòng, chỉ ra 3 điểm nghẽn lớn nhất gây chậm trễ và đề xuất giải pháp cải tiến tinh gọn.",
      type: "IN_SESSION",
      deadline: new Date("2026-10-10T12:00:00.000Z"),
      allowedFormat: "BOTH",
      isRequired: true,
      status: "ACTIVE",
    },
  });

  const assign2 = await prisma.assignment.create({
    data: {
      sessionId: session1.id,
      title: "Bài tập sau buổi 1: Xây dựng Bộ Chỉ số Đo lường Hiệu suất (KPIs/OKRs) Quý IV",
      description: "Thiết lập bảng chỉ số hiệu suất trọng yếu cho khoa phòng của bạn bao gồm: Tỷ lệ hài lòng người bệnh, Thời gian chờ khám trung bình, và Tỷ lệ hoàn thành hồ sơ bệnh án đúng hạn.",
      type: "POST_SESSION",
      deadline: new Date("2026-10-16T23:59:00.000Z"),
      allowedFormat: "BOTH",
      isRequired: true,
      status: "ACTIVE",
    },
  });

  const assign3 = await prisma.assignment.create({
    data: {
      sessionId: session2.id,
      title: "Bài tập 2: Kế hoạch Nâng cao Trải nghiệm Người bệnh tại Điểm chạm Khám & Điều trị",
      description: "Đánh giá 5 điểm chạm quan trọng nhất của người bệnh tại khoa phòng và xây dựng tiêu chuẩn giao tiếp ứng xử cho đội ngũ y bác sĩ & điều dưỡng.",
      type: "IN_SESSION",
      deadline: new Date("2026-10-17T12:00:00.000Z"),
      allowedFormat: "BOTH",
      isRequired: true,
      status: "ACTIVE",
    },
  });

  // 9. Tạo Bài nộp & Nhận xét đánh giá của Giảng viên cho Bài tập 1 & 2
  const sampleFeedbacks = [
    { grade: "XUAT_SAC", comment: "Bài làm rất xuất sắc! Sơ đồ quy trình khoa Cấp cứu phân định rõ ràng trách nhiệm giữa bác sĩ và điều dưỡng phân loại (Triage). Giải pháp áp dụng bảng theo dõi thời gian thực rất khả thi." },
    { grade: "DAT", comment: "Ý tưởng cải tiến luồng khám bệnh rất thực tế. Cần lưu ý bổ sung thêm giải pháp dự phòng vào các khung giờ cao điểm (08:30 - 10:00 sáng)." },
    { grade: "XUAT_SAC", comment: "Phân tích số liệu thời gian chờ của bệnh nhân tim mạch rất chi tiết và thuyết phục. Đề xuất quy trình đăng ký khám trước qua ứng dụng có thể nhân rộng toàn viện." },
    { grade: "CAN_CAI_THIEN", comment: "Sơ đồ luồng còn thiếu bước hướng dẫn thủ tục bảo hiểm y tế. Đề nghị nhóm bổ sung thêm phân đoạn đối chiếu BHYT trước khi nộp bản hoàn chỉnh." },
    { grade: "DAT", comment: "Kế hoạch cải tiến quy trình phòng mổ bám sát tiêu chuẩn an toàn người bệnh của Bộ Y tế. Tốt!" },
  ];

  for (let i = 0; i < 15; i++) {
    const st = createdStudents[i];
    const fb = sampleFeedbacks[i % sampleFeedbacks.length];
    const isLink = i % 2 === 0;

    const sub = await prisma.submission.create({
      data: {
        assignmentId: assign1.id,
        studentId: st.id,
        version: i === 3 ? 2 : 1,
        type: isLink ? "LINK" : "FILE",
        contentUrl: isLink ? `https://docs.google.com/presentation/d/1example_${st.studentCode}_phuongdong` : null,
        filePath: isLink ? null : `/uploads/submissions/De_an_cai_tien_${st.studentCode}.pdf`,
        fileName: isLink ? null : `So_do_quy_trinh_${st.department.replace(/\s+/g, "_")}.pdf`,
        fileSize: isLink ? null : 2450000,
        note: `Bài nộp đại diện của ${st.title} - ${st.department}`,
        submittedAt: new Date("2026-10-10T03:30:00.000Z"),
        isLate: false,
        status: "REVIEWED",
      },
    });

    // Giảng viên chấm bài
    await prisma.review.create({
      data: {
        submissionId: sub.id,
        reviewerId: trainer.id,
        grade: fb.grade,
        publicComment: fb.comment,
        internalNote: `Học viên có tư duy quản lý tốt, tham gia thảo luận tích cực tại buổi 1.`,
        reviewedAt: new Date("2026-10-11T08:00:00.000Z"),
      },
    });
  }

  // 10. Tạo các bản ghi Nhật ký Hoạt động (AuditLog) mẫu
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        actorName: "Nguyễn Hoàng Nam (Admin)",
        action: "IMPORT_STUDENTS",
        entityType: "Course",
        entityId: course.id,
        details: JSON.stringify({ count: 20, source: "Danh_sach_quan_ly_BV_Phuong_Dong.xlsx" }),
        createdAt: new Date("2026-10-09T02:00:00.000Z"),
      },
      {
        userId: trainer.id,
        actorName: "TS. Lê Hoàng Phúc (Giảng viên)",
        action: "OPEN_CHECKIN_GATE",
        entityType: "Session",
        entityId: session1.id,
        details: JSON.stringify({ sessionTitle: session1.title, gate: "checkIn" }),
        createdAt: new Date("2026-10-10T00:30:00.000Z"),
      },
      {
        userId: admin.id,
        actorName: "Admin Buddy",
        action: "MANUAL_ATTENDANCE_OVERRIDE",
        entityType: "Attendance",
        entityId: "att_manual_1",
        details: JSON.stringify({ student: "BS. CKI Trần Thị Bích", reason: "Quên điện thoại" }),
        createdAt: new Date("2026-10-10T01:05:00.000Z"),
      },
      {
        userId: trainer.id,
        actorName: "TS. Lê Hoàng Phúc (Giảng viên)",
        action: "REVIEW_SUBMISSION",
        entityType: "Submission",
        details: JSON.stringify({ count: 15, session: "Buổi 1" }),
        createdAt: new Date("2026-10-11T09:00:00.000Z"),
      },
      {
        userId: trainer.id,
        actorName: "TS. Lê Hoàng Phúc (Giảng viên)",
        action: "OPEN_CHECKIN_GATE",
        entityType: "Session",
        entityId: session2.id,
        details: JSON.stringify({ sessionTitle: session2.title, gate: "checkIn" }),
        createdAt: new Date(Date.now() - 30 * 60000),
      },
    ],
  });

  // 11. Tạo sẵn file Excel mẫu tải về: public/templates/danh_sach_mau_50_hoc_vien_BVPD.xlsx
  const templateDir = path.join(process.cwd(), "public", "templates");
  fs.mkdirSync(templateDir, { recursive: true });

  const sampleExcelRows = [
    { "Họ tên": "BS. CKII Lê Văn Dũng", "Chức danh": "Trưởng khoa Khám bệnh", "Khoa/phòng": "Khoa Khám bệnh", "Cấp quản lý": "Quản lý cấp cao", "Email": "dung.lv@phuongdonghospital.vn", "Số điện thoại": "0987654301" },
    { "Họ tên": "ThS. BS Trần Minh Tâm", "Chức danh": "Phó Trưởng khoa Nội tiết", "Khoa/phòng": "Khoa Nội tiết", "Cấp quản lý": "Quản lý cấp trung", "Email": "tam.tm@phuongdonghospital.vn", "Số điện thoại": "0987654302" },
    { "Họ tên": "BS. CKI Hoàng Quốc Bảo", "Chức danh": "Trưởng khoa Thần kinh", "Khoa/phòng": "Khoa Thần kinh", "Cấp quản lý": "Quản lý cấp cao", "Email": "bao.hq@phuongdonghospital.vn", "Số điện thoại": "0987654303" },
    { "Họ tên": "ThS. Điều dưỡng Phạm Thị Mai", "Chức danh": "Phó Trưởng phòng Điều dưỡng", "Khoa/phòng": "Phòng Điều dưỡng", "Cấp quản lý": "Quản lý cấp trung", "Email": "mai.pt@phuongdonghospital.vn", "Số điện thoại": "0987654304" },
    { "Họ tên": "BS. CKI Nguyễn Đức Thịnh", "Chức danh": "Trưởng đơn vị Nội soi", "Khoa/phòng": "Khoa Tiêu hóa", "Cấp quản lý": "Quản lý cấp trung", "Email": "thinh.nd@phuongdonghospital.vn", "Số điện thoại": "0987654305" },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleExcelRows);
  XLSX.utils.book_append_sheet(wb, ws, "DanhSachHocVien");
  const templatePath = path.join(templateDir, "danh_sach_mau_50_hoc_vien_BVPD.xlsx");
  XLSX.writeFile(wb, templatePath);

  console.log("=== ĐÃ TẠO THÀNH CÔNG TOÀN BỘ DỮ LIỆU KIỂM THỬ ===");
  console.log("- Đã tạo Khóa học & 4 Buổi học");
  console.log("- Đã tạo 20 Bác sĩ/Trưởng khoa mẫu");
  console.log("- Buổi 1: Đã có 19 lượt check-in/out, 15 bài nộp và được chấm điểm");
  console.log("- Buổi 2: Đang MỞ CỔNG CHECK-IN LIVE (14 người đã quét, 6 người chưa đến)");
  console.log("- File Excel mẫu: public/templates/danh_sach_mau_50_hoc_vien_BVPD.xlsx");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
