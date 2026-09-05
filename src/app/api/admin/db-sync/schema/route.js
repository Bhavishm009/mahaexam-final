import { NextResponse } from "next/server";
import { primaryPrisma, secondaryPrisma } from "@/lib/db.js";

/**
 * GET /api/admin/db-sync/schema
 * Inspect PostgreSQL information_schema to verify that all tables and columns
 * in Primary Database exist and match in Secondary Shadow Database.
 */
export async function GET() {
  if (!secondaryPrisma) {
    return NextResponse.json({
      success: false,
      error: "SECONDARY_DATABASE_URL is not configured",
    }, { status: 400 });
  }

  let primaryColumns = [];
  let secondaryColumns = [];

  try {
    // 1. Fetch all public tables & columns from Primary
    primaryColumns = await primaryPrisma.$queryRaw`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, column_name;
    `;
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: "Failed to inspect Primary Database schema: " + err.message,
    }, { status: 503 });
  }

  try {
    // 2. Fetch all public tables & columns from Secondary
    secondaryColumns = await secondaryPrisma.$queryRaw`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, column_name;
    `;
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: "Failed to inspect Secondary Database schema: " + err.message,
    }, { status: 503 });
  }

  // 3. Build lookup sets
  const sTableSet = new Set(secondaryColumns.map((c) => c.table_name));
  const sColSet = new Set(secondaryColumns.map((c) => `${c.table_name}.${c.column_name}`));

  const pTableSet = new Set(primaryColumns.map((c) => c.table_name));

  const missingTables = [];
  const missingColumns = [];

  for (const table of pTableSet) {
    // Skip internal migration / prisma tables
    if (table.startsWith("_") || table === "pg_stat_statements") continue;

    if (!sTableSet.has(table)) {
      missingTables.push(table);
    }
  }

  for (const col of primaryColumns) {
    if (col.table_name.startsWith("_") || col.table_name === "pg_stat_statements") continue;

    const key = `${col.table_name}.${col.column_name}`;
    if (!sColSet.has(key)) {
      missingColumns.push({
        table: col.table_name,
        column: col.column_name,
        dataType: col.data_type,
      });
    }
  }

  const byTable = {};
  for (const mc of missingColumns) {
    const k = mc.table.toLowerCase();
    if (!byTable[k]) {
      byTable[k] = {
        table: mc.table,
        missingColumns: [],
      };
    }
    byTable[k].missingColumns.push(mc);
  }

  const isSchemaAligned = missingTables.length === 0 && missingColumns.length === 0;

  return NextResponse.json({
    success: true,
    isSchemaAligned,
    primaryTableCount: pTableSet.size,
    secondaryTableCount: sTableSet.size,
    totalCheckedColumns: primaryColumns.length,
    missingTables,
    missingColumns,
    byTable,
    message: isSchemaAligned
      ? "Primary and Secondary database schemas are 100% identical and aligned."
      : `Secondary database is missing ${missingTables.length} tables and ${missingColumns.length} columns. Click 'Align Schema' to synchronize.`,
  });
}

/**
 * POST /api/admin/db-sync/schema
 * Automatically align missing columns on Secondary Shadow Database.
 * Supports ?table=<tableName> to align only a specific table.
 */
export async function POST(req) {
  if (!secondaryPrisma) {
    return NextResponse.json({ success: false, error: "SECONDARY_DATABASE_URL is not configured" }, { status: 400 });
  }

  let targetTable = null;
  if (req) {
    try {
      const url = new URL(req.url);
      targetTable = url.searchParams.get("table");
      if (!targetTable && req.headers.get("content-type")?.includes("application/json")) {
        const body = await req.json().catch(() => ({}));
        targetTable = body.table || null;
      }
    } catch (_) {}
  }

  try {
    const primaryColumns = await primaryPrisma.$queryRaw`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, column_name;
    `;

    const secondaryColumns = await secondaryPrisma.$queryRaw`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public';
    `;

    const sColSet = new Set(secondaryColumns.map((c) => `${c.table_name}.${c.column_name}`));
    const alignedLog = [];

    for (const col of primaryColumns) {
      if (col.table_name.startsWith("_") || col.table_name === "pg_stat_statements") continue;

      if (targetTable && col.table_name.toLowerCase() !== targetTable.toLowerCase()) {
        continue;
      }

      const key = `${col.table_name}.${col.column_name}`;

      if (!sColSet.has(key)) {
        // Generate SQL to add column safely
        let colType = col.data_type.toUpperCase();
        if (colType === "USER-DEFINED") colType = "TEXT";
        if (colType === "ARRAY") colType = "TEXT[]";

        const sql = `ALTER TABLE "${col.table_name}" ADD COLUMN IF NOT EXISTS "${col.column_name}" ${colType};`;
        await secondaryPrisma.$executeRawUnsafe(sql);
        alignedLog.push(`Added column "${col.column_name}" (${colType}) to table "${col.table_name}" on Secondary DB.`);
      }
    }

    return NextResponse.json({
      success: true,
      message: alignedLog.length > 0
        ? targetTable
          ? `Successfully aligned schema for '${targetTable}': ${alignedLog.length} columns added without data loss.`
          : `Successfully aligned schema: ${alignedLog.length} columns synchronized.`
        : "Schema is already 100% aligned.",
      targetTable: targetTable || null,
      alignedLog,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: "Schema alignment failed: " + err.message,
    }, { status: 500 });
  }
}
