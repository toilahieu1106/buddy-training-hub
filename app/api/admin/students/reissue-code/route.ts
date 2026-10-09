import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateStudentCode } from "@/lib/code-generator";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { studentId, actorName, reason } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "Thiếu ID học viên" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ error: "Học viên không tồn tại" }, { status: 404 });
    }

    const oldCode = student.studentCode;
    const newCode = generateStudentCode(6);

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { studentCode: newCode },
    });

    await createAuditLog({
      actorName: actorName || "Admin Buddy",
      action: "REISSUE_STUDENT_CODE",
      entityType: "Student",
      entityId: student.id,
      details: {
        studentName: student.fullName,
        oldCode,
        newCode,
        reason: reason || "Học viên quên hoặc lộ mã",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã cấp mã mới: ${newCode} cho học viên ${student.fullName}`,
      newCode,
      student: updated,
    });
  } catch (error: any) {
    console.error("Reissue code error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi cấp lại mã." }, { status: 500 });
  }
}
