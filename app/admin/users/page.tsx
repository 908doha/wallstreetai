import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, getRoleDisplayName, getPlanDisplayName } from "@/lib/utils";
import { UserActions } from "./UserActions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: { include: { plan: true } },
      _count: { select: { analyses: true } },
    },
    take: 100,
  });
}

export default async function UsersPage() {
  const users = await getUsers();

  const roleColors: Record<string, string> = {
    admin: "bg-red-500/20 text-red-400 border-red-500/30",
    premium: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    pro: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    free: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    guest: "bg-gray-500/10 text-gray-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">사용자 관리</h1>
        <p className="text-sm text-gray-400">총 {users.length}명</p>
      </div>

      <Card className="bg-[#16213e]/80 border-white/10">
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-gray-400 py-3 pr-4">사용자</th>
                  <th className="text-left text-xs text-gray-400 py-3 pr-4">역할</th>
                  <th className="text-left text-xs text-gray-400 py-3 pr-4">플랜</th>
                  <th className="text-left text-xs text-gray-400 py-3 pr-4">분석 수</th>
                  <th className="text-left text-xs text-gray-400 py-3 pr-4">가입일</th>
                  <th className="text-left text-xs text-gray-400 py-3">관리</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-[#4F8AFF]/20 text-[#4F8AFF] text-xs">
                            {user.name ? getInitials(user.name) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {user.name || "이름 없음"}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${roleColors[user.role] || ""}`}
                      >
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">
                      {getPlanDisplayName(user.subscription?.plan?.slug || "free")}
                    </td>
                    <td className="py-3 pr-4 text-gray-300 text-sm">
                      {user._count.analyses}
                    </td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3">
                      <UserActions userId={user.id} currentRole={user.role} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
