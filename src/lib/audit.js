import { prisma } from "@/lib/db";

export async function audit(
  session,
  { action, resourceType, resourceId = null, metadata = {}, request = null },
) {
  return prisma.auditLog.create({
    data: {
      organizationId: session?.organizationId || null,
      userId: session?.sub || null,
      action,
      resourceType,
      resourceId,
      metadata,
      ipAddress: request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      userAgent: request?.headers?.get("user-agent") || null,
    },
  });
}
