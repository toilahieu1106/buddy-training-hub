import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const students = await prisma.student.findMany({
      where: { status: "ACTIVE" },
      orderBy: { fullName: "asc" },
      include: {
        attendances: true,
      },
    });

    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi tải danh sách" }, { status: 500 });
  }
}
