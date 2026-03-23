import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatCurrency } from "@/lib/utils";

async function getPayments() {
  return prisma.paymentHistory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
    take: 100,
  });
}

async function getStats() {
  const [totalRevenue, successfulPayments, failedPayments] = await Promise.all([
    prisma.paymentHistory.aggregate({
      where: { status: "succeeded" },
      _sum: { amount: true },
    }),
    prisma.paymentHistory.count({ where: { status: "succeeded" } }),
    prisma.paymentHistory.count({ where: { status: "failed" } }),
  ]);

  return { totalRevenue, successfulPayments, failedPayments };
}

const statusColors: Record<string, string> = {
  succeeded: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  refunded: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusLabels: Record<string, string> = {
  succeeded: "성공",
  pending: "대기",
  failed: "실패",
  refunded: "환불",
};

export default async function PaymentsPage() {
  const [payments, stats] = await Promise.all([getPayments(), getStats()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">결제 관리</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#16213e]/80 border-white/10">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-400">총 매출</p>
            <p className="text-xl font-bold text-[#f0b429] mt-1">
              ₩{((stats.totalRevenue._sum.amount || 0)).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#16213e]/80 border-white/10">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-400">성공 결제</p>
            <p className="text-xl font-bold text-green-400 mt-1">
              {stats.successfulPayments}건
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#16213e]/80 border-white/10">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-400">실패 결제</p>
            <p className="text-xl font-bold text-red-400 mt-1">
              {stats.failedPayments}건
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#16213e]/80 border-white/10">
        <CardHeader>
          <CardTitle className="text-sm text-gray-300">결제 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-gray-400 py-3 pr-4">사용자</th>
                  <th className="text-left text-xs text-gray-400 py-3 pr-4">금액</th>
                  <th className="text-left text-xs text-gray-400 py-3 pr-4">상태</th>
                  <th className="text-left text-xs text-gray-400 py-3 pr-4">설명</th>
                  <th className="text-left text-xs text-gray-400 py-3">날짜</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                      결제 내역이 없습니다
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-3 pr-4">
                        <p className="text-white text-sm">
                          {payment.user.name || "이름 없음"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {payment.user.email}
                        </p>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-white">
                        ₩{payment.amount.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[payment.status]}`}
                        >
                          {statusLabels[payment.status]}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-400">
                        {payment.description || "-"}
                      </td>
                      <td className="py-3 text-xs text-gray-400">
                        {formatDateTime(payment.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
