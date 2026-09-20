"use server";

import { OrderSource, OrderStatus, PaymentMethod, Variant } from "@prisma/client";
import { prisma } from "./prisma";
import { requireAdmin } from "./auth";
import { orderTotal, orderCost } from "./inventory";
import { getSettings } from "./settings";
import { bumpCounter, getCounter } from "./settings";
import { nextOrderNo } from "./order-keys";
import { syncSheets } from "./sheets/sync";

export interface BuyLine {
  productId: string;
  size: string;
  color: string;
  quantity: number;
  printDetails?: string;
}

interface CreateOrderInput {
  source: OrderSource;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  lines: BuyLine[];
}

const SOLD = [OrderStatus.CONFIRMED, OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

export async function createOrderRecord(input: CreateOrderInput): Promise<{
  ok: boolean;
  message: string;
  orderId?: string;
  orderNo?: string;
}> {
  const cleanLines = input.lines.filter((l) => l.quantity > 0);
  if (cleanLines.length === 0) {
    return { ok: false, message: "لا توجد أصناف في الطلب" };
  }
  if (!input.customerName.trim()) {
    return { ok: false, message: "أدخل اسم الزبون" };
  }

  const productIds = [...new Set(cleanLines.map((l) => l.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const items: {
    productId: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    printDetails: string;
  }[] = [];
  for (const line of cleanLines) {
    const product = productMap.get(line.productId);
    if (!product) return { ok: false, message: "منتج غير موجود" };
    items.push({
      productId: product.id,
      size: line.size,
      color: line.color,
      quantity: line.quantity,
      unitPrice: product.basePrice,
      unitCost: product.costPrice,
      printDetails: line.printDetails ?? "",
    });
  }

  const settings = await getSettings();
  const baseTotal = orderTotal(items.map((it) => ({ unitPrice: it.unitPrice, quantity: it.quantity })));
  const totalAmount = +(baseTotal + settings.deliveryFee).toFixed(2);
  const totalCost = orderCost(items.map((it) => ({ unitCost: it.unitCost, quantity: it.quantity })));

  const counter = await bumpCounter("ORD_COUNTER");
  const orderNo = nextOrderNo(await getCounter("ORD_COUNTER"));
  void counter;

  const order = await prisma.order.create({
    data: {
      orderNo,
      source: input.source,
      status: OrderStatus.PENDING,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      paymentMethod: input.paymentMethod,
      paymentStatus: "PENDING",
      totalAmount,
      totalCost,
      notes: input.notes ?? "",
      items: { create: items },
    },
  });

  return { ok: true, message: "تم إنشاء الطلب", orderId: order.id, orderNo };
}

export async function confirmOrder(orderId: string): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { include: { variants: true } } } } },
  });
  if (!order) return { ok: false, message: "الطلب غير موجود" };
  if (order.status !== OrderStatus.PENDING) {
    return { ok: false, message: "لا يمكن تأكيد طلب ليس بانتظار التأكيد" };
  }

  const variants = new Map<string, { stockQty: number; confirmed: number }>();
  for (const item of order.items) {
    if (item.product.stockPolicy === "MADE_TO_ORDER") continue;
    const key = `${item.productId}|${item.size}|${item.color}`;
    if (!variants.has(key)) {
      variants.set(key, { stockQty: 0, confirmed: 0 });
    }
  }
  const variantRows = await prisma.variant.findMany({
    where: {
      productId: { in: order.items.map((i) => i.productId) },
    },
  });
  const variantMap = new Map<string, Variant>();
  for (const v of variantRows) variantMap.set(`${v.productId}|${v.size}|${v.color}`, v);

  if (variants.size > 0) {
    const aggs = await prisma.orderItem.groupBy({
      by: ["productId", "size", "color"],
      where: {
        order: { status: { in: SOLD } },
        productId: { in: order.items.map((i) => i.productId) },
      },
      _sum: { quantity: true },
    });
    for (const agg of aggs) {
      const key = `${agg.productId}|${agg.size}|${agg.color}`;
      const entry = variants.get(key);
      if (entry) entry.confirmed += agg._sum.quantity ?? 0;
    }
  }

  for (const item of order.items) {
    if (item.product.stockPolicy === "MADE_TO_ORDER") continue;
    const key = `${item.productId}|${item.size}|${item.color}`;
    const entry = variants.get(key)!;
    const v = variantMap.get(key);
    if (!v) return { ok: false, message: `مقاس ${item.size} — لون ${item.color} لم يعد موجودًا` };
    entry.stockQty = v.stockQty;
    if (entry.stockQty - entry.confirmed < item.quantity) {
      return {
        ok: false,
        message: `المخزون لا يكفي: ${item.product.name} (${item.size}/${item.color}) — المتاح ${Math.max(0, entry.stockQty - entry.confirmed)}`,
      };
    }
  }

  const invoiceNoCounter = await bumpCounter("INV_COUNTER");
  const invoiceNo = `INV-${String(await getCounter("INV_COUNTER")).padStart(4, "0")}`;
  void invoiceNoCounter;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          confirmedAt: new Date(),
          totalAmount: order.totalAmount,
          totalCost: order.totalCost,
        },
      });
      await tx.invoice.create({
        data: {
          invoiceNo,
          orderId,
          amount: order.totalAmount,
        },
      });
    });
  } catch {
    return { ok: false, message: "فشل إصدار الفاتورة" };
  }

  await syncSheets();
  return { ok: true, message: "تم تأكيد الطلب وخصم المخزون وإصدار الفاتورة" };
}

export async function cancelOrder(orderId: string): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, message: "الطلب غير موجود" };
  if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
    return { ok: false, message: "لا يمكن إلغاء طلب مغلق أو ملغى" };
  }
  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.CANCELLED, paymentStatus: "REFUNDED" },
  });
  await syncSheets();
  return { ok: true, message: "تم الإلغاء — عاد المخزون للمصدر وانسحبت المبيعات" };
}

const STATE_FLOW: Record<string, OrderStatus[]> = {
  markPaid: [OrderStatus.CONFIRMED, OrderStatus.PAID],
  markShipped: [OrderStatus.PAID, OrderStatus.SHIPPED],
  markDelivered: [OrderStatus.SHIPPED, OrderStatus.DELIVERED],
};

export async function advanceOrderState(
  orderId: string,
  action: "markPaid" | "markShipped" | "markDelivered"
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, message: "الطلب غير موجود" };
  const allowed = STATE_FLOW[action];
  if (!allowed) return { ok: false, message: "إجراء غير معروف" };
  if (!allowed.includes(order.status)) {
    return { ok: false, message: "خطوة الحالة غير صحيحة" };
  }
  const next =
    action === "markPaid"
      ? OrderStatus.PAID
      : action === "markShipped"
        ? OrderStatus.SHIPPED
        : OrderStatus.DELIVERED;
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: next,
      paymentStatus: action === "markPaid" ? "PAID" : order.paymentStatus,
    },
  });
  await syncSheets();
  return { ok: true, message: "تم تحديث حالة الطلب" };
}

export interface SiteOrderInput {
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  lines: BuyLine[];
}

export async function createSiteOrder(input: SiteOrderInput): Promise<{
  ok: boolean;
  message: string;
  orderNo?: string;
  whatsappUrl?: string;
}> {
  const created = await createOrderRecord({
    source: OrderSource.SITE,
    ...input,
  });
  if (!created.ok || !created.orderNo) {
    return { ok: false, message: created.message };
  }

  const settings = await getSettings();
  const products = await prisma.product.findMany({
    where: { id: { in: input.lines.map((l) => l.productId) } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  const messageLines = input.lines.map((l) => {
    const p = productMap.get(l.productId)!;
    return {
      name: p.name,
      sku: p.sku,
      size: l.size,
      color: l.color,
      quantity: l.quantity,
      unitPrice: p.basePrice,
      printDetails: l.printDetails,
    };
  });

  const { buildOrderMessage, buildWhatsAppLink } = await import("./whatsapp");
  const hasMadeToOrder = products.some((p) => p.stockPolicy === "MADE_TO_ORDER");
  const text = buildOrderMessage(
    {
      ...settings,
    },
    messageLines,
    { customerName: input.customerName || undefined, notes: input.notes || undefined, hasMadeToOrder }
  );

  const link = buildWhatsAppLink(settings.whatsappNumber, text);
  if (!settings.whatsappNumber.trim()) {
    return {
      ok: true,
      message: "الطلب سُجل برقم " + created.orderNo,
      orderNo: created.orderNo,
    };
  }

  return { ok: true, message: "جاري فتح الواتساب", orderNo: created.orderNo, whatsappUrl: link ?? undefined };
}