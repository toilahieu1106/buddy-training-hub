import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const course = await prisma.course.findFirst({
      where: { status: "ACTIVE" },
      include: {
        sessions: {
          orderBy: { sessionNumber: "asc" },
          include: {
            attendances: true,
            assignments: {
              orderBy: { createdAt: "asc" },
              include: {
                submissions: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ success: true, sessions: [] });
    }

    return NextResponse.json({
      success: true,
      course,
      sessions: course.sessions,
    });
  } catch (error: any) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi tải danh sách buổi học" },
      { status: 500 }
    );
  }
}
