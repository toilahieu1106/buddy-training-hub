import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, studentId, checkInStatus, checkOutStatus, note, actorName } = await req.json();

    if (!sessionId || !studentId) {
      return NextResponse.json({ error: "Thiếu thông tin buổi học hoặc học viên" }, { status: 400 });
    }

    if (!note || !note.trim()) {
      return NextResponse.json({ error: "Bắt buộc phải nhập lý do khi điểm danh / chỉnh sửa thủ công" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const session = await prisma.session.findUnique({ where: { id: sessionId } });

    if (!student || !session) {
      return NextResponse.json({ error: "Không tìm thấy dữ liệu học viên hoặc buổi học" }, { status: 404 });
    }

    const now = new Date();

    const attendance = await prisma.attendance.upsert({
      where: {
        sessionId_studentId: { sessionId, studentId },
      },
      update: {
        checkInAt: checkInStatus ? (checkInStatus === "ABSENT" ? null : now) : undefined,
        checkInStatus: checkInStatus || undefined,
        checkOutAt: checkOutStatus ? now : undefined,
        checkOutStatus: checkOutStatus || undefined,
        source: "MANUAL_ADMIN",
        note: note.trim(),
      },
      create: {
        sessionId,
        studentId,
        checkInAt: checkInStatus === "ABSENT" ? null : now,
        checkInStatus: checkInStatus || "ON_TIME",
        checkOutAt: checkOutStatus ? now : null,
        checkOutStatus: checkOutStatus || null,
        source: "MANUAL_ADMIN",
        note: note.trim(),
      },
    });

    await createAuditLog({
      actorName: actorName || "Admin Buddy",
      action: "MANUAL_ATTENDANCE_OVERRIDE",
      entityType: "Attendance",
      entityId: attendance.id,
      details: {
        studentName: student.fullName,
        sessionTitle: session.title,
        checkInStatus,
        checkOutStatus,
        reason: note.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật điểm danh thủ công cho học viên ${student.fullName}`,
      attendance,
    });
  } catch (error: any) {
    console.error("Manual attendance error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi cập nhật điểm danh." }, { status: 500 });
  }
}
