import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { db } from "../src/infrastructure/db/postgres/client";
import { categories } from "../src/infrastructure/db/postgres/schema/category.schema";

type OzonCategoryNode = {
  title?: string;
  slug?: string;
  categories?: OzonCategoryNode[];
};

type OzonRootCategory = OzonCategoryNode & {
  columns?: Array<{
    categories?: OzonCategoryNode[];
  }>;
};

type OzonFilePayload = {
  data?: OzonRootCategory;
};

const OZON_CATEGORIES_DIR = path.resolve(process.cwd(), "ozon-categories");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asNode = (value: unknown): OzonCategoryNode | null => {
  if (!isRecord(value)) return null;
  return value as OzonCategoryNode;
};

const toNonEmptyName = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const name = value.trim();
  return name.length > 0 ? name : null;
};

const toSlug = (value: unknown): string =>
  typeof value === "string" ? value : "";

const insertCategory = async (
  node: OzonCategoryNode,
  parentId: number | null,
): Promise<number | null> => {
  const name = toNonEmptyName(node.title);
  if (!name) return null;

  const [inserted] = await db
    .insert(categories)
    .values({
      name,
      slug: toSlug(node.slug),
      parentId,
    })
    .returning({ id: categories.id });

  return inserted?.id ?? null;
};

const insertNestedChildren = async (
  node: OzonCategoryNode,
  parentId: number,
): Promise<number> => {
  if (!Array.isArray(node.categories) || node.categories.length === 0) {
    return 0;
  }

  let insertedCount = 0;
  for (const childRaw of node.categories) {
    const child = asNode(childRaw);
    if (!child) continue;

    const childId = await insertCategory(child, parentId);
    if (childId === null) continue;

    insertedCount += 1;
    insertedCount += await insertNestedChildren(child, childId);
  }

  return insertedCount;
};

const insertFromFile = async (filePath: string): Promise<number> => {
  const fileContent = await readFile(filePath, "utf8");
  const parsed = JSON.parse(fileContent) as OzonFilePayload;
  const root = asNode(parsed.data);

  if (!root) return 0;

  let insertedCount = 0;
  const rootId = await insertCategory(root, null);
  if (rootId === null) return 0;
  insertedCount += 1;

  const rootWithColumns = parsed.data;
  if (rootWithColumns && Array.isArray(rootWithColumns.columns)) {
    for (const column of rootWithColumns.columns) {
      if (!column || !Array.isArray(column.categories)) continue;

      for (const childRaw of column.categories) {
        const child = asNode(childRaw);
        if (!child) continue;

        const childId = await insertCategory(child, rootId);
        if (childId === null) continue;

        insertedCount += 1;
        insertedCount += await insertNestedChildren(child, childId);
      }
    }
  }

  insertedCount += await insertNestedChildren(root, rootId);

  return insertedCount;
};

const getJsonFiles = async (): Promise<string[]> => {
  const entries = await readdir(OZON_CATEGORIES_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    )
    .map((entry) => path.join(OZON_CATEGORIES_DIR, entry.name));
};

const main = async (): Promise<void> => {
  const files = await getJsonFiles();

  if (files.length === 0) {
    console.log("No JSON files found in ozon-categories.");
    return;
  }

  let totalInserted = 0;
  for (const filePath of files) {
    const insertedCount = await insertFromFile(filePath);
    totalInserted += insertedCount;
    console.log(`Inserted ${insertedCount} categories from ${path.basename(filePath)}.`);
  }

  console.log(`Done. Inserted total ${totalInserted} categories.`);
  process.exit(0);
};

void main().catch((error) => {
  console.error("Failed to import Ozon categories:", error);
  process.exit(1);
});
