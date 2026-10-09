import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { submissionId, reviewerId, publicComment, internalNote, grade, status } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ error: "Thiếu submissionId" }, { status: 400 });
    }

    // Default to first trainer or admin if not passed
    let validReviewerId = reviewerId;
    if (!validReviewerId) {
      const user = await prisma.user.findFirst({ where: { role: { in: ["TRAINER", "ADMIN"] } } });
      validReviewerId = user?.id;
    }

    if (!validReviewerId) {
      return NextResponse.json({ error: "Chưa có tài khoản giảng viên trong hệ thống" }, { status: 400 });
    }

    const reviewer = await prisma.user.findUnique({ where: { id: validReviewerId } });

    // 1. Create Review
    const review = await prisma.review.create({
      data: {
        submissionId,
        reviewerId: validReviewerId,
        publicComment: publicComment?.trim() || null,
        internalNote: internalNote?.trim() || null,
        grade: grade || "DAT",
      },
    });

    // 2. Update Submission status
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: status || "REVIEWED",
      },
      include: {
        student: true,
        assignment: true,
      },
    });

    await createAuditLog({
      userId: validReviewerId,
      actorName: reviewer?.fullName || "Giảng viên",
      action: "REVIEW_SUBMISSION",
      entityType: "Submission",
      entityId: submission.id,
      details: {
        studentName: submission.student.fullName,
        assignmentTitle: submission.assignment.title,
        grade,
        publicComment,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã lưu nhận xét và đánh giá bài nộp thành công!",
      review,
      submission,
    });
  } catch (error: any) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi lưu nhận xét." }, { status: 500 });
  }
}
