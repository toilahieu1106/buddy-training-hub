const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function updateSession2() {
  const session2 = await prisma.session.findFirst({
    where: { sessionNumber: 2 }
  });
  if (!session2) {
    console.log("Session 2 not found");
    return;
  }
  
  const title = "Thực hành Buổi 2: Phân rã mục tiêu BV 'Người bệnh hài lòng ≥ 90%' & Lập kế hoạch 5W1H (7 bước)";
  const description = "Áp dụng công cụ Goal Cascade Workspace để phân rã mục tiêu cấp Bệnh viện xuống Khoa/Phòng & Cá nhân theo quy trình 7 bước (Mục tiêu → Kết quả → Công việc → Người phụ trách → Nguồn lực → Tiến độ → Theo dõi 5W1H) và thực hành xử lý kịch bản mô phỏng Quý 2.";

  // Check if IN_SESSION assignment already exists
  const existing = await prisma.assignment.findFirst({
    where: {
      sessionId: session2.id,
      type: "IN_SESSION"
    }
  });

  if (!existing) {
    const created = await prisma.assignment.create({
      data: {
        sessionId: session2.id,
        title: title,
        description: description,
        type: "IN_SESSION",
        deadline: new Date("2026-10-15T12:00:00.000Z"),
        allowedFormat: "BOTH",
        isRequired: true,
        status: "ACTIVE"
      }
    });
    console.log("Created IN_SESSION assignment for Session 2:", created.id);
  } else {
    const updated = await prisma.assignment.update({
      where: { id: existing.id },
      data: {
        title: title,
        description: description,
      }
    });
    console.log("Updated existing IN_SESSION assignment:", updated.id);
  }
}

updateSession2()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
