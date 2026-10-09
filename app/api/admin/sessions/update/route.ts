import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      date,
      startTime,
      endTime,
      location,
      trainerName,
      lateThresholdMins,
      earlyLeaveThresholdMins,
    } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: "Thiếu ID hoặc tiêu đề buổi học" },
        { status: 400 }
      );
    }

    const updated = await prisma.session.update({
      where: { id },
      data: {
        title,
        date: date ? String(date) : undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        location: location || undefined,
        trainerName: trainerName || undefined,
        lateThresholdMins: lateThresholdMins ? parseInt(lateThresholdMins, 10) : undefined,
        earlyLeaveThresholdMins: earlyLeaveThresholdMins ? parseInt(earlyLeaveThresholdMins, 10) : undefined,
      },
    });

    // Log to AuditLog
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_SESSION",
        actorName: "Admin",
        entityType: "Session",
        entityId: id,
        details: `Cập nhật thông tin buổi học: ${title}`,
      },
    });

    return NextResponse.json({ success: true, session: updated });
  } catch (error: any) {
    console.error("Update session error:", error);
    return NextResponse.json(
      { error: error.message || "Không thể cập nhật buổi học" },
      { status: 500 }
    );
  }
}
