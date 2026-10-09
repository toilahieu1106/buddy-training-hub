import { prisma } from "./prisma";

export async function createAuditLog(params: {
  userId?: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any> | string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        actorName: params.actorName,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: typeof params.details === "object" ? JSON.stringify(params.details) : params.details,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
