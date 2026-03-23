"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Save, RotateCcw, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { PromptVersion } from "@/types";

interface MasterOption {
  id: string;
  name: string;
}

export default function PromptsPage() {
  const { toast } = useToast();
  const [quantVersions, setQuantVersions] = useState<PromptVersion[]>([]);
  const [quantContent, setQuantContent] = useState("");
  const [selectedQuantVersion, setSelectedQuantVersion] = useState<PromptVersion | null>(null);
  const [masters, setMasters] = useState<MasterOption[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState<string>("");
  const [masterPromptContent, setMasterPromptContent] = useState("");
  const [masterVersions, setMasterVersions] = useState<PromptVersion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchQuantPrompts();
    fetchMasters();
  }, []);

  useEffect(() => {
    if (selectedMasterId) fetchMasterPrompts(selectedMasterId);
  }, [selectedMasterId]);

  const fetchQuantPrompts = async () => {
    const res = await fetch("/api/admin/prompts/quant");
    const data = await res.json();
    if (data.success) {
      setQuantVersions(data.data);
      const active = data.data.find((v: PromptVersion) => v.isActive);
      if (active) {
        setQuantContent(active.content);
        setSelectedQuantVersion(active);
      }
    }
  };

  const fetchMasters = async () => {
    const res = await fetch("/api/masters");
    const data = await res.json();
    if (data.success) {
      setMasters(data.data.map((m: { id: string; name: string }) => ({ id: m.id, name: m.name })));
      if (data.data.length > 0) setSelectedMasterId(data.data[0].id);
    }
  };

  const fetchMasterPrompts = async (masterId: string) => {
    const res = await fetch(`/api/admin/prompts/master/${masterId}`);
    const data = await res.json();
    if (data.success) {
      setMasterVersions(data.data);
      const active = data.data.find((v: PromptVersion) => v.isActive);
      setMasterPromptContent(active?.content || "");
    }
  };

  const saveQuantPrompt = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/prompts/quant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: quantContent }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "퀀트 프롬프트가 저장되었습니다" });
        fetchQuantPrompts();
      } else {
        toast({ title: "저장 실패", variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const saveMasterPrompt = async () => {
    if (!selectedMasterId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/prompts/master/${selectedMasterId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: masterPromptContent }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "마스터 프롬프트가 저장되었습니다" });
        fetchMasterPrompts(selectedMasterId);
      } else {
        toast({ title: "저장 실패", variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const rollbackQuantVersion = async (version: number) => {
    const res = await fetch(`/api/admin/prompts/quant/${version}`, {
      method: "POST",
    });
    const data = await res.json();
    if (data.success) {
      toast({ title: `v${version}으로 롤백되었습니다` });
      fetchQuantPrompts();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">프롬프트 관리</h1>

      <Tabs defaultValue="quant">
        <TabsList className="bg-[#16213e]">
          <TabsTrigger value="quant">퀀트 프롬프트</TabsTrigger>
          <TabsTrigger value="master">마스터 프롬프트</TabsTrigger>
        </TabsList>

        <TabsContent value="quant" className="space-y-4 mt-4">
          <Card className="bg-[#16213e]/80 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-300">
                  퀀트 분석 프롬프트
                  {selectedQuantVersion && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      v{selectedQuantVersion.version}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={saveQuantPrompt}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={quantContent}
                onChange={(e) => setQuantContent(e.target.value)}
                className="min-h-[300px] bg-[#0f0f23] border-white/10 text-white font-mono text-sm"
                placeholder="퀀트 분석 시스템 프롬프트를 입력하세요..."
              />
            </CardContent>
          </Card>

          {quantVersions.length > 0 && (
            <Card className="bg-[#16213e]/80 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm text-gray-300">
                  <Clock className="w-4 h-4 inline mr-2" />
                  버전 히스토리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quantVersions.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 p-3 bg-[#0f0f23]/60 rounded-lg border border-white/5"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            v{v.version}
                          </span>
                          {v.isActive && (
                            <Badge variant="gold" className="text-[9px]">활성</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(v.createdAt)}
                        </p>
                      </div>
                      {!v.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-white/20"
                          onClick={() => rollbackQuantVersion(v.version)}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          롤백
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="master" className="space-y-4 mt-4">
          <div className="flex gap-3">
            {masters.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMasterId(m.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedMasterId === m.id
                    ? "bg-[#f0b429] text-[#1a1a2e] font-semibold"
                    : "bg-[#16213e] text-gray-400 border border-white/10 hover:text-white"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          <Card className="bg-[#16213e]/80 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-300">
                  {masters.find((m) => m.id === selectedMasterId)?.name} 프롬프트
                </CardTitle>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={saveMasterPrompt}
                  disabled={isSaving || !selectedMasterId}
                >
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={masterPromptContent}
                onChange={(e) => setMasterPromptContent(e.target.value)}
                className="min-h-[300px] bg-[#0f0f23] border-white/10 text-white font-mono text-sm"
                placeholder="마스터 페르소나 프롬프트를 입력하세요..."
              />
            </CardContent>
          </Card>

          {masterVersions.length > 0 && (
            <Card className="bg-[#16213e]/80 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm text-gray-300">
                  <Clock className="w-4 h-4 inline mr-2" />
                  버전 히스토리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {masterVersions.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 p-3 bg-[#0f0f23]/60 rounded-lg border border-white/5"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            v{v.version}
                          </span>
                          {v.isActive && (
                            <Badge variant="gold" className="text-[9px]">활성</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(v.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
