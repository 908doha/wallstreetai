import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MasterForm } from "../MasterForm";

export default function NewMasterPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">새 마스터 추가</h1>
      <Card className="bg-[#16213e]/80 border-white/10">
        <CardContent className="pt-6">
          <MasterForm />
        </CardContent>
      </Card>
    </div>
  );
}
