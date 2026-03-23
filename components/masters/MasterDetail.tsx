import Image from "next/image";
import { Quote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MasterData } from "@/types";

interface MasterDetailProps {
  master: MasterData;
}

export function MasterDetail({ master }: MasterDetailProps) {
  return (
    <div className="space-y-4">
      {/* Profile card */}
      <Card className="bg-[#16213e]/80 border-white/10 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#f0b429] to-amber-600" />
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-[#f0b429]/50">
              {master.photoUrl ? (
                <Image
                  src={master.photoUrl}
                  alt={master.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#f0b429]/20 flex items-center justify-center text-4xl font-bold text-[#f0b429]">
                  {master.name.charAt(0)}
                </div>
              )}
            </div>
            <h1 className="text-xl font-bold text-white mb-1">{master.name}</h1>
            {master.isPremium && (
              <Badge variant="gold" className="mb-3 text-xs">
                PREMIUM
              </Badge>
            )}
            <p className="text-sm text-gray-400 leading-relaxed">{master.bio}</p>
          </div>
        </CardContent>
      </Card>

      {/* Philosophy */}
      <Card className="bg-[#16213e]/80 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-300">
            투자 철학
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-200 leading-relaxed">
            {master.philosophy}
          </p>
        </CardContent>
      </Card>

      {/* Quotes */}
      {master.quotes.length > 0 && (
        <Card className="bg-[#16213e]/80 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-300">
              명언
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {master.quotes.map((quote, i) => (
              <div
                key={i}
                className="flex gap-3 p-3 bg-[#0f0f23]/60 rounded-lg border border-white/5"
              >
                <Quote className="w-4 h-4 text-[#f0b429] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300 italic leading-relaxed">
                  {quote}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Key Stocks */}
      {master.keyStocks.length > 0 && (
        <Card className="bg-[#16213e]/80 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-300">
              주요 투자 종목
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {master.keyStocks.map((stock) => (
                <Badge
                  key={stock}
                  variant="secondary"
                  className="text-xs bg-[#f0b429]/10 text-[#f0b429] border border-[#f0b429]/20"
                >
                  {stock}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
