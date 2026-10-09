import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID bài tập" },
        { status: 400 }
      );
    }

    const existing = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Không tìm thấy bài tập" },
        { status: 404 }
      );
    }

    await prisma.assignment.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_ASSIGNMENT",
        actorName: "Admin",
        entityType: "Assignment",
        entityId: id,
        details: `Xóa bài tập: ${existing.title}`,
      },
    });

    return NextResponse.json({ success: true, message: "Đã xóa bài tập" });
  } catch (error: any) {
    console.error("Delete assignment error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi xóa bài tập" },
      { status: 500 }
    );
  }
}
