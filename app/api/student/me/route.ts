import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCode } from "@/lib/code-generator";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Thiếu mã học viên" },
        { status: 400 }
      );
    }

    const cleanCode = normalizeCode(code);
    const student = await prisma.student.findFirst({
      where: {
        studentCode: cleanCode,
        status: "ACTIVE",
      },
      include: {
        course: {
          include: {
            sessions: {
              orderBy: { sessionNumber: "asc" },
              include: {
                assignments: {
                  include: {
                    submissions: {
                      where: { student: { studentCode: cleanCode } },
                      orderBy: { version: "desc" },
                      include: {
                        reviews: {
                          include: {
                            reviewer: {
                              select: { fullName: true, role: true },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        attendances: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Không tìm thấy học viên với mã đã cung cấp" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student,
    });
  } catch (error: any) {
    console.error("Fetch student error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi tải thông tin học viên." },
      { status: 500 }
    );
  }
}
