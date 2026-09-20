import { prisma } from "./prisma";
import { hash } from "bcryptjs";
import { cache } from "react";

export interface AppSettings {
  shopName: string;
  shopLogo: string;
  whatsappNumber: string;
  shamCashNumber: string;
  currency: string;
  currencyPosition: "before" | "after";
  defaultLeadTime: string;
  deliveryFee: number;
  lowStockThreshold: number;
  googleSheetId: string;
  googleSheetStatus: string;
  googleServiceAccountJson: string;
  lastSyncAt: string;
}

const DEFAULTS: Record<string, string> = {
  shopName: "EGO Store",
  shopLogo: "",
  whatsappNumber: "",
  shamCashNumber: "",
  currency: "$",
  currencyPosition: "after",
  defaultLeadTime: "3-5 أيام",
  deliveryFee: "0",
  lowStockThreshold: "5",
  googleSheetId: "",
  googleSheetStatus: "غير مربوط",
  googleServiceAccountJson: "",
  adminPasswordHash: "",
  ORD_COUNTER: "0",
  INV_COUNTER: "0",
  SKU_COUNTER: "0",
};

export async function ensureSettingsSeeded(): Promise<void> {
  const existing = await prisma.setting.findMany();
  const keys = new Set(existing.map((s) => s.key));
  const missing = Object.entries(DEFAULTS).filter(([k]) => !keys.has(k));
  if (missing.length > 0) {
    await prisma.$transaction(
      missing.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: {},
          create: { key, value },
        })
      )
    );
  }
}

export async function getSettingsMap(): Promise<Record<string, string>> {
  await ensureSettingsSeeded();
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export const getSettings = cache(async function getSettings(): Promise<AppSettings> {
  const map = await getSettingsMap();
  return {
    shopName: map.shopName || DEFAULTS.shopName,
    shopLogo: map.shopLogo || "",
    whatsappNumber: map.whatsappNumber || "",
    shamCashNumber: map.shamCashNumber || "",
    currency: map.currency || DEFAULTS.currency,
    currencyPosition: map.currencyPosition === "before" ? "before" : "after",
    defaultLeadTime: map.defaultLeadTime || DEFAULTS.defaultLeadTime,
    deliveryFee: parseFloat(map.deliveryFee) || 0,
    lowStockThreshold: parseInt(map.lowStockThreshold, 10) || 5,
    googleSheetId: map.googleSheetId || "",
    googleSheetStatus: map.googleSheetStatus || DEFAULTS.googleSheetStatus,
    googleServiceAccountJson: map.googleServiceAccountJson || "",
    lastSyncAt: map.lastSyncAt || "",
  };
});

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function setSettingsMany(entries: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(entries)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}

export async function getCounter(name: string): Promise<number> {
  await ensureSettingsSeeded();
  const row = await prisma.setting.findUnique({ where: { key: name } });
  const value = parseInt(row?.value ?? "0", 10);
  return Number.isNaN(value) ? 0 : value;
}

export async function bumpCounter(name: string): Promise<number> {
  await prisma.$transaction(async (tx) => {
    const row = await tx.setting.findUnique({ where: { key: name } });
    const current = parseInt(row?.value ?? "0", 10) || 0;
    await tx.setting.upsert({
      where: { key: name },
      update: { value: String(current + 1) },
      create: { key: name, value: String(current + 1) },
    });
  });
  return getCounter(name);
}

export async function ensureAdminPassword(): Promise<void> {
  await ensureSettingsSeeded();
  const row = await prisma.setting.findUnique({ where: { key: "adminPasswordHash" } });
  if ((row?.value || "") === "" && process.env.ADMIN_PASSWORD) {
    const hashed = await hash(process.env.ADMIN_PASSWORD, 10);
    await prisma.setting.upsert({
      where: { key: "adminPasswordHash" },
      update: { value: hashed },
      create: { key: "adminPasswordHash", value: hashed },
    });
  }
}

export async function setAdminPassword(plain: string): Promise<void> {
  const hashed = await hash(plain, 10);
  await prisma.setting.upsert({
    where: { key: "adminPasswordHash" },
    update: { value: hashed },
    create: { key: "adminPasswordHash", value: hashed },
  });
}