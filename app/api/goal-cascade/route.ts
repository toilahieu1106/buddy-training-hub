import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCode } from "@/lib/code-generator";
import { GOAL_CASCADE_GROUPS } from "@/lib/goal-cascade-groups";

export const dynamic = "force-dynamic";

// GET ?groupIndex=n -> bản nộp của 1 nhóm (học viên xem nhận xét); không tham số -> tất cả (giảng viên)
export async function GET(req: NextRequest) {
  const g = req.nextUrl.searchParams.get("groupIndex");
  if (g !== null) {
    const plan = await prisma.goalCascadePlan.findUnique({ where: { groupIndex: Number(g) } });
    return NextResponse.json({ plan });
  }
  const plans = await prisma.goalCascadePlan.findMany({ orderBy: { groupIndex: "asc" } });
  return NextResponse.json({ plans });
}

// POST: trưởng nhóm nộp bài (ghi đè bản cũ của nhóm)
export async function POST(req: NextRequest) {
  try {
    const { studentCode, groupIndex, plan, checks, score } = await req.json();
    const cleanCode = normalizeCode(studentCode || "");
    if (!cleanCode) {
      return NextResponse.json({ error: "Chưa đăng nhập mã học viên. Vui lòng đăng nhập ở Cổng học viên." }, { status: 400 });
    }
    if (!(groupIndex >= 0 && groupIndex < GOAL_CASCADE_GROUPS.length)) {
      return NextResponse.json({ error: "Nhóm không hợp lệ" }, { status: 400 });
    }
    const student = await prisma.student.findFirst({ where: { studentCode: cleanCode, status: "ACTIVE" } });
    if (!student) {
      return NextResponse.json({ error: "Mã học viên không tồn tại" }, { status: 404 });
    }

    const fields = {
      groupName: GOAL_CASCADE_GROUPS[groupIndex],
      data: { plan, checks },
      score: Number(score) || 0,
      submittedByCode: student.studentCode,
      submittedByName: student.fullName,
      submittedAt: new Date(),
    };
    const saved = await prisma.goalCascadePlan.upsert({
      where: { groupIndex },
      create: { groupIndex, ...fields },
      update: fields,
    });
    return NextResponse.json({ success: true, plan: saved });
  } catch (error) {
    console.error("Goal cascade submit error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi nộp bài" }, { status: 500 });
  }
}

// PATCH: giảng viên lưu nhận xét cho nhóm
export async function PATCH(req: NextRequest) {
  try {
    const { groupIndex, comment } = await req.json();
    const saved = await prisma.goalCascadePlan.update({
      where: { groupIndex: Number(groupIndex) },
      data: { comment: comment ?? "" },
    });
    return NextResponse.json({ success: true, plan: saved });
  } catch (error) {
    console.error("Goal cascade comment error:", error);
    return NextResponse.json({ error: "Nhóm chưa nộp bài hoặc lỗi máy chủ" }, { status: 400 });
  }
}
