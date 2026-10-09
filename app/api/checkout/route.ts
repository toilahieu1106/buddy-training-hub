import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCode } from "@/lib/code-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentCode, sessionCode, sessionId } = body;

    const cleanCode = normalizeCode(studentCode);
    if (!cleanCode) {
      return NextResponse.json(
        { error: "Vui lòng nhập mã học viên" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findFirst({
      where: {
        studentCode: cleanCode,
        status: "ACTIVE",
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Mã học viên không hợp lệ hoặc đã bị vô hiệu hóa." },
        { status: 404 }
      );
    }

    // Xác định buổi học
    let session = null;
    if (sessionId) {
      session = await prisma.session.findUnique({ where: { id: sessionId } });
    } else if (sessionCode) {
      session = await prisma.session.findFirst({
        where: { sessionCode: sessionCode.toUpperCase().trim(), courseId: student.courseId },
      });
    } else {
      session = await prisma.session.findFirst({
        where: {
          courseId: student.courseId,
          checkOutStatus: "OPEN",
        },
        orderBy: { sessionNumber: "asc" },
      });
    }

    if (!session) {
      return NextResponse.json(
        { error: "Hiện tại không có buổi học nào đang mở cổng Check-out." },
        { status: 400 }
      );
    }

    if (session.checkOutStatus !== "OPEN") {
      return NextResponse.json(
        { error: `Cổng check-out cho ${session.title} hiện đang đóng.` },
        { status: 400 }
      );
    }

    // Kiểm tra xem đã Check-in chưa
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId: student.id,
        },
      },
    });

    if (!existingAttendance || !existingAttendance.checkInAt) {
      return NextResponse.json(
        { error: "Bạn chưa check-in buổi học này nên không thể thực hiện check-out." },
        { status: 400 }
      );
    }

    const now = new Date();
    const checkInTime = new Date(existingAttendance.checkInAt).getTime();
    const durationMins = Math.max(1, Math.round((now.getTime() - checkInTime) / 60000));

    // Xác định về sớm hay hoàn thành
    let checkOutStatus = "COMPLETED";
    if (session.endTime) {
      const [endHour, endMin] = session.endTime.split(":").map(Number);
      const sessionEnd = new Date(now);
      sessionEnd.setHours(endHour, endMin, 0, 0);

      const earlyThresholdMs = (session.earlyLeaveThresholdMins || 15) * 60 * 1000;
      const earlyLeaveDeadline = new Date(sessionEnd.getTime() - earlyThresholdMs);

      if (now.getTime() < earlyLeaveDeadline.getTime()) {
        checkOutStatus = "EARLY_LEAVE";
      }
    }

    const updated = await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: {
        checkOutAt: now,
        checkOutStatus,
        durationMins,
      },
    });

    return NextResponse.json({
      success: true,
      message: checkOutStatus === "COMPLETED" ? "Check-out hoàn thành buổi học thành công!" : "Check-out thành công (Ghi nhận về sớm)",
      student: {
        id: student.id,
        fullName: student.fullName,
        title: student.title,
        department: student.department,
        studentCode: student.studentCode,
      },
      attendance: updated,
      session: {
        id: session.id,
        title: session.title,
        sessionNumber: session.sessionNumber,
      },
      durationMins,
    });
  } catch (error: any) {
    console.error("Check-out error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi xử lý check-out." },
      { status: 500 }
    );
  }
}
