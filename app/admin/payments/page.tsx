import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Clock } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">결제 / 구독 관리</h1>
        <p className="text-gray-400 text-sm mt-1">구독 플랜 및 결제 이력을 관리합니다</p>
      </div>

      <Card className="bg-[#16213e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#f0b429]" />
            결제 기능
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center py-12 gap-4">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-white mb-2">결제 기능 준비 중</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Stripe 연동 결제 기능은 현재 준비 중입니다.<br />
              구독 관리, 결제 이력, 환불 처리 기능이 곧 추가될 예정입니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
