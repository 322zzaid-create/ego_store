import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { money, formatDateTime } from "@/lib/format";
import { profit, profitMargin } from "@/lib/inventory";
import { Badge, Card } from "@/components/ui";
import { SyncNowButton } from "@/components/admin/sync-now-button";

export const dynamic = "force-dynamic";

const SOLD = [OrderStatus.CONFIRMED, OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

export default async function ReportsPage() {
  const settings = await getSettings();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [soldOrders, monthOrders, aggregated] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: [...SOLD, OrderStatus.CANCELLED] } },
      select: { status: true, totalAmount: true, totalCost: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: startOfMonth }, status: { in: SOLD } },
      select: { totalAmount: true, totalCost: true },
    }),
    prisma.$queryRaw<Array<{ productId: string; qty: bigint | number; revenue: number; cost: number }>>`
      SELECT "productId",
             CAST(SUM("quantity") AS INTEGER) AS "qty",
             COALESCE(SUM("quantity" * "unitPrice"), 0) AS "revenue",
             COALESCE(SUM("quantity" * "unitCost"), 0) AS "cost"
      FROM "OrderItem"
      WHERE "orderId" IN (SELECT "id" FROM "Order" WHERE "status" IN (${Prisma.join(SOLD)}))
      GROUP BY "productId"
    `,
  ]);

  const activeSold = soldOrders.filter((o) => o.status !== OrderStatus.CANCELLED);
  const totalRevenue = activeSold.reduce((s, o) => s + o.totalAmount, 0);
  const totalCost = activeSold.reduce((s, o) => s + o.totalCost, 0);
  const totalProfit = profit(totalRevenue, totalCost);
  const totalMargin = profitMargin(totalRevenue, totalCost);

  const monthRevenue = monthOrders.reduce((s, o) => s + o.totalAmount, 0);
  const monthCost = monthOrders.reduce((s, o) => s + o.totalCost, 0);

  const productIds = aggregated.map((r) => r.productId);
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, sku: true, name: true },
      })
    : [];
  const productById = new Map(products.map((p) => [p.id, p]));
  const topProducts = aggregated
    .map((r) => {
      const product = productById.get(r.productId);
      return {
        sku: product?.sku ?? "مجهول",
        name: product?.name ?? "مجهول",
        qty: Number(r.qty) || 0,
        revenue: Number(r.revenue) || 0,
        cost: Number(r.cost) || 0,
      };
    })
    .sort((a, b) => b.qty - a.qty);

  const stats = [
    { label: "إجمالي الإيرادات", value: money(totalRevenue, settings.currency, settings.currencyPosition) },
    { label: "إجمالي التكلفة", value: money(totalCost, settings.currency, settings.currencyPosition) },
    { label: "صافي الربح", value: money(totalProfit, settings.currency, settings.currencyPosition) },
    { label: "نسبة الربح", value: `${totalMargin}%` },
    { label: `إيراد الشهر ${settings.currency}`, value: monthRevenue.toFixed(2) },
    { label: `ربح الشهر ${settings.currency}`, value: profit(monthRevenue, monthCost).toFixed(2) },
  ];

  const sheetConfigured = Boolean(
    settings.googleServiceAccountJson.trim() && settings.googleSheetId.trim()
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">التقارير</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm font-semibold text-zinc-500">{s.label}</p>
            <p className="mt-1 text-2xl font-black">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">أكثر القطع مبيعًا</h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-zinc-500">لا مبيعات بعد</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {topProducts.map((p) => (
                <li key={p.sku} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <span className="font-bold">{p.sku}</span>
                    <span className="mr-1 text-zinc-600">{p.name}</span>
                    <span className="mr-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold">{p.qty}</span>
                  </div>
                  <span className="font-bold">
                    {money(p.revenue, settings.currency, settings.currencyPosition)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">مزامنة Google Sheets</h2>
            <Badge color={sheetConfigured ? "emerald" : "amber"}>{settings.googleSheetStatus}</Badge>
          </div>
          {sheetConfigured ? (
            <p className="mb-3 text-sm text-zinc-600">
              التبويبات الأربعة (الجرد، المبيعات، الفواتير، الأرباح) تُحدَّث بكل عملية بيع أو إلغاء.
              <br />
              آخر مزامنة: {formatDateTime(settings.lastSyncAt)}
            </p>
          ) : (
            <p className="mb-3 text-sm text-zinc-600">
              غير مربوط بعد — ربط الجدول من الإعدادات. بدون ربط، يعمل المتجر والجرد والفواتير بشكل طبيعي، وتُتجاهل المزامنة بصمت.
            </p>
          )}
          <SyncNowButton />
        </Card>
      </div>
    </div>
  );
}