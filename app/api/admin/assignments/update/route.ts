import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      description,
      type,
      allowedFormat,
      deadline,
      isRequired,
    } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: "Thiếu ID hoặc tiêu đề bài tập" },
        { status: 400 }
      );
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        title,
        description: description !== undefined ? description : undefined,
        type: type || undefined,
        allowedFormat: allowedFormat || undefined,
        deadline: deadline ? new Date(deadline) : null,
        isRequired: isRequired !== undefined ? Boolean(isRequired) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_ASSIGNMENT",
        actorName: "Admin",
        entityType: "Assignment",
        entityId: id,
        details: `Cập nhật bài tập: ${title}`,
      },
    });

    return NextResponse.json({ success: true, assignment: updated });
  } catch (error: any) {
    console.error("Update assignment error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi cập nhật bài tập" },
      { status: 500 }
    );
  }
}
