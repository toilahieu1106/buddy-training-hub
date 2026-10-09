import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      title,
      description,
      type, // IN_SESSION, POST_SESSION
      allowedFormat, // LINK, FILE, BOTH
      deadline,
      isRequired,
    } = body;

    if (!sessionId || !title) {
      return NextResponse.json(
        { error: "Thiếu ID buổi học hoặc tiêu đề bài tập" },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        sessionId,
        title,
        description: description || null,
        type: type || "POST_SESSION",
        allowedFormat: allowedFormat || "BOTH",
        deadline: deadline ? new Date(deadline) : null,
        isRequired: isRequired !== undefined ? Boolean(isRequired) : true,
        status: "ACTIVE",
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_ASSIGNMENT",
        actorName: "Admin",
        entityType: "Assignment",
        entityId: assignment.id,
        details: `Tạo bài tập mới: ${title} (${type === "IN_SESSION" ? "Thực hành trên lớp" : "Bài tập về nhà"})`,
      },
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    console.error("Create assignment error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi tạo bài tập" },
      { status: 500 }
    );
  }
}
