import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateStudentCode } from "@/lib/code-generator";
import { createAuditLog } from "@/lib/audit";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const courseId = formData.get("courseId") as string;
    const file = formData.get("file") as File | null;
    const rawDataJson = formData.get("rawData") as string | null;

    let targetCourseId = courseId;
    if (!targetCourseId) {
      const firstCourse = await prisma.course.findFirst({ where: { status: "ACTIVE" } });
      if (!firstCourse) {
        return NextResponse.json({ error: "Chưa có khóa học nào được tạo." }, { status: 400 });
      }
      targetCourseId = firstCourse.id;
    }

    let rows: any[] = [];

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      rows = XLSX.utils.sheet_to_json(worksheet);
    } else if (rawDataJson) {
      rows = JSON.parse(rawDataJson);
    } else {
      return NextResponse.json({ error: "Vui lòng tải lên file Excel hoặc dữ liệu học viên." }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "File Excel không có dữ liệu." }, { status: 400 });
    }

    const createdStudents = [];
    const errors = [];

    // Fetch existing codes in this course to avoid collisions
    const existing = await prisma.student.findMany({
      where: { courseId: targetCourseId },
      select: { studentCode: true, email: true, phone: true },
    });
    const codeSet = new Set(existing.map((s) => s.studentCode));

    let index = 1;
    for (const row of rows) {
      index++;
      // Map possible column headers
      const fullName = (row["Họ tên"] || row["Họ và tên"] || row["fullName"] || row["Name"] || "").toString().trim();
      const title = (row["Chức danh"] || row["Chức vụ"] || row["title"] || "").toString().trim();
      const department = (row["Khoa/Phòng"] || row["Khoa phòng"] || row["Đơn vị"] || row["department"] || "").toString().trim();
      const managementLevel = (row["Cấp quản lý"] || row["Cấp bậc"] || row["managementLevel"] || "Quản lý cấp trung").toString().trim();
      const email = (row["Email"] || row["email"] || "").toString().trim();
      const phone = (row["Số điện thoại"] || row["SĐT"] || row["phone"] || "").toString().trim();

      if (!fullName) {
        errors.push({ line: index, reason: "Thiếu Họ tên học viên" });
        continue;
      }

      // Generate unique code
      let newCode = generateStudentCode(6);
      while (codeSet.has(newCode)) {
        newCode = generateStudentCode(6);
      }
      codeSet.add(newCode);

      try {
        const student = await prisma.student.create({
          data: {
            courseId: targetCourseId,
            fullName,
            title: title || null,
            department: department || null,
            managementLevel: managementLevel || "Quản lý cấp trung",
            email: email || null,
            phone: phone || null,
            studentCode: newCode,
            status: "ACTIVE",
          },
        });
        createdStudents.push(student);
      } catch (err: any) {
        errors.push({ line: index, name: fullName, reason: err.message || "Lỗi lưu dữ liệu" });
      }
    }

    await createAuditLog({
      actorName: "Admin Buddy",
      action: "IMPORT_STUDENTS",
      entityType: "Course",
      entityId: targetCourseId,
      details: { importedCount: createdStudents.length, errorCount: errors.length },
    });

    return NextResponse.json({
      success: true,
      message: `Đã nhập thành công ${createdStudents.length} học viên. ${errors.length > 0 ? `Có ${errors.length} dòng lỗi.` : ""}`,
      importedCount: createdStudents.length,
      students: createdStudents,
      errors,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi import file Excel." },
      { status: 500 }
    );
  }
}
