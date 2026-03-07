"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { QRCodeSVG } from "qrcode.react";
import {
  saveConfigLocally,
  loadCachedConfig,
  clearCachedConfig
} from "@/lib/db/offlineDb";
import { compressData, createQRChunks, type QRChunk } from "@/lib/compression";
import type {
  ScoutingQuestionConfig,
  SelectOption
} from "@/lib/types/scouting";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Plus,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Code,
  X
} from "lucide-react";

import FormPreview from "./FormPreview";
import QuestionEditor from "./QuestionEditor";

type QuestionType = ScoutingQuestionConfig["type"];

function createDefaultQuestion(type: QuestionType): ScoutingQuestionConfig {
  const base = { name: "", description: undefined, optional: false };
  switch (type) {
    case "team":
      return { ...base, type: "team" };
    case "select":
      return { ...base, type: "select", select_key: "" };
    case "number":
      return { ...base, type: "number", min: 0, max: 100 };
    case "boolean":
      return { ...base, type: "boolean" };
    case "slider":
      return { ...base, type: "slider", min: 0, max: 10 };
    case "text":
      return { ...base, type: "text" };
    case "textarea":
      return { ...base, type: "textarea" };
  }
}

/**
 * Configure page — visual config builder with live preview & QR sharing.
 */
export default function ConfigurePage() {
  const [questions, setQuestions] = useState<ScoutingQuestionConfig[]>([]);
  const [teamOptions, setTeamOptions] = useState<SelectOption[]>([]);
  const [selectOptions, setSelectOptions] = useState<
    Record<string, SelectOption[]>
  >({});
  const [hasLocalConfig, setHasLocalConfig] = useState(false);
  const [localDownloadedAt, setLocalDownloadedAt] = useState<string | null>(
    null
  );
  const [showPreview, setShowPreview] = useState(true);
  const [showRawJson, setShowRawJson] = useState(false);
  const [addType, setAddType] = useState<QuestionType>("text");

  // QR sharing state
  const [qrChunks, setQrChunks] = useState<QRChunk[]>([]);
  const [currentQrChunk, setCurrentQrChunk] = useState(0);

  // Load local config status on mount
  useEffect(() => {
    loadCachedConfig().then((cached) => {
      if (cached) {
        setHasLocalConfig(true);
        setLocalDownloadedAt(cached.downloadedAt);
        setQuestions(cached.config);
        setTeamOptions(cached.teamOptions);
        setSelectOptions(cached.selectOptions);
      }
    });
  }, []);

  // ---- Question CRUD ----

  const addQuestion = useCallback(() => {
    setQuestions((prev) => [...prev, createDefaultQuestion(addType)]);
  }, [addType]);

  const updateQuestion = useCallback(
    (index: number, updated: ScoutingQuestionConfig) => {
      setQuestions((prev) => prev.map((q, i) => (i === index ? updated : q)));
    },
    []
  );

  const removeQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveQuestion = useCallback((index: number, direction: -1 | 1) => {
    setQuestions((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  // ---- Team options CRUD ----

  const addTeamOption = useCallback(() => {
    setTeamOptions((prev) => [...prev, { name: "", value: 0 }]);
  }, []);

  const updateTeamOption = useCallback(
    (index: number, field: "name" | "value", val: string | number) => {
      setTeamOptions((prev) =>
        prev.map((o, i) => (i === index ? { ...o, [field]: val } : o))
      );
    },
    []
  );

  const removeTeamOption = useCallback((index: number) => {
    setTeamOptions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ---- Select options CRUD ----

  const [newSelectKey, setNewSelectKey] = useState("");

  const addSelectKey = useCallback(() => {
    const key = newSelectKey.trim();
    if (!key) return;
    if (selectOptions[key]) {
      toast.error(`Key "${key}" already exists.`);
      return;
    }
    setSelectOptions((prev) => ({ ...prev, [key]: [] }));
    setNewSelectKey("");
  }, [newSelectKey, selectOptions]);

  const removeSelectKey = useCallback((key: string) => {
    setSelectOptions((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const addSelectOption = useCallback((key: string) => {
    setSelectOptions((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { name: "", value: 0 }]
    }));
  }, []);

  const updateSelectOption = useCallback(
    (
      key: string,
      index: number,
      field: "name" | "value",
      val: string | number
    ) => {
      setSelectOptions((prev) => ({
        ...prev,
        [key]: prev[key].map((o, i) =>
          i === index ? { ...o, [field]: val } : o
        )
      }));
    },
    []
  );

  const removeSelectOption = useCallback((key: string, index: number) => {
    setSelectOptions((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }));
  }, []);

  // ---- Save / Clear ----

  const isConfigValid = questions.length > 0 && questions.every((q) => q.name);

  const handleSaveToDevice = async () => {
    if (!isConfigValid) {
      toast.error("All questions must have a name.");
      return;
    }
    try {
      await saveConfigLocally(questions, teamOptions, selectOptions);
      setHasLocalConfig(true);
      setLocalDownloadedAt(new Date().toISOString());
      toast.success("Config saved to device for offline use!");
    } catch {
      toast.error("Failed to save config.");
    }
  };

  const handleClearLocal = async () => {
    await clearCachedConfig();
    setHasLocalConfig(false);
    setLocalDownloadedAt(null);
    toast.success("Local config cleared.");
  };

  // ---- QR sharing ----

  const generateQr = useCallback(() => {
    const payload = { questions, teamOptions, selectOptions };
    const compressed = compressData(payload);
    const sessionId = uuidv4();
    const chunks = createQRChunks(compressed, sessionId);
    setQrChunks(chunks);
    setCurrentQrChunk(0);
  }, [questions, teamOptions, selectOptions]);

  // ---- JSON display ----

  const rawJson = useMemo(
    () =>
      JSON.stringify({ questions, teamOptions, selectOptions }, null, 2),
    [questions, teamOptions, selectOptions]
  );

  return (
    <div className="w-full h-full container mx-auto flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Configure Scouting Form</h1>
          <p className="text-muted-foreground text-sm">
            Build your form visually and preview changes in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={generateQr}
                disabled={!isConfigValid}>
                <QrCode className="size-4 mr-2" />
                Share via QR
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="size-5" />
                  QR Code {currentQrChunk + 1} of {qrChunks.length || 1}
                </DialogTitle>
                <DialogDescription>
                  Scan each QR code in order on the target device.
                </DialogDescription>
              </DialogHeader>
              {qrChunks.length > 0 && qrChunks[currentQrChunk] && (
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG
                      value={JSON.stringify(qrChunks[currentQrChunk])}
                      size={260}
                      level="M"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentQrChunk((c) => c - 1)}
                      disabled={currentQrChunk === 0}>
                      <ChevronLeft className="size-4" />
                    </Button>
                    <span className="text-sm font-medium tabular-nums">
                      {currentQrChunk + 1} / {qrChunks.length}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentQrChunk((c) => c + 1)}
                      disabled={currentQrChunk === qrChunks.length - 1}>
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Builder */}
        <div className="flex flex-col gap-6">
          {/* Add question controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Questions</CardTitle>
              <CardDescription>
                {questions.length} question{questions.length !== 1 && "s"}{" "}
                configured
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                <Select
                  value={addType}
                  onValueChange={(v) => setAddType(v as QuestionType)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="slider">Slider</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addQuestion} size="sm">
                  <Plus className="size-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Question editors */}
          <div className="flex flex-col gap-3">
            {questions.map((q, i) => (
              <QuestionEditor
                key={i}
                question={q}
                index={i}
                total={questions.length}
                onChange={(updated) => updateQuestion(i, updated)}
                onRemove={() => removeQuestion(i)}
                onMoveUp={() => moveQuestion(i, -1)}
                onMoveDown={() => moveQuestion(i, 1)}
              />
            ))}
            {questions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No questions yet. Use the dropdown above to add one.
              </p>
            )}
          </div>

          <Separator />

          {/* Team options editor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Team Options</CardTitle>
                  <CardDescription>
                    Teams available in &quot;team&quot; type fields.
                  </CardDescription>
                </div>
                <Button onClick={addTeamOption} size="sm" variant="outline">
                  <Plus className="size-4 mr-1" />
                  Add Team
                </Button>
              </div>
            </CardHeader>
            {teamOptions.length > 0 && (
              <CardContent className="pt-0 space-y-2">
                {teamOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      className="flex-1"
                      placeholder="Team name"
                      value={opt.name}
                      onChange={(e) =>
                        updateTeamOption(i, "name", e.target.value)
                      }
                    />
                    <Input
                      className="w-24"
                      type="number"
                      placeholder="#"
                      value={opt.value}
                      onChange={(e) =>
                        updateTeamOption(i, "value", Number(e.target.value))
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive shrink-0"
                      onClick={() => removeTeamOption(i)}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Select options editor */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Select Options</CardTitle>
              <CardDescription>
                Options for each select_key used by &quot;select&quot; fields.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="New key (e.g. alliance_color)"
                  value={newSelectKey}
                  onChange={(e) => setNewSelectKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSelectKey()}
                />
                <Button onClick={addSelectKey} size="sm" variant="outline">
                  <Plus className="size-4 mr-1" />
                  Add Key
                </Button>
              </div>

              {Object.entries(selectOptions).map(([key, opts]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{key}</Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addSelectOption(key)}>
                        <Plus className="size-3.5 mr-1" />
                        Option
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeSelectKey(key)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  {opts.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 ml-4">
                      <Input
                        className="flex-1"
                        placeholder="Option name"
                        value={opt.name}
                        onChange={(e) =>
                          updateSelectOption(key, i, "name", e.target.value)
                        }
                      />
                      <Input
                        className="w-24"
                        type="number"
                        placeholder="Value"
                        value={opt.value}
                        onChange={(e) =>
                          updateSelectOption(
                            key,
                            i,
                            "value",
                            Number(e.target.value)
                          )
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive shrink-0"
                        onClick={() => removeSelectOption(key, i)}>
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save to device */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Save className="h-5 w-5" />
                Save to Device
              </CardTitle>
              <CardDescription>
                Save config to this device&apos;s IndexedDB for offline
                scouting.
                {hasLocalConfig && localDownloadedAt && (
                  <span className="flex items-center gap-1 mt-1 text-green-500">
                    <CheckCircle2 className="h-3 w-3" />
                    Config cached (
                    {new Date(localDownloadedAt).toLocaleString()})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-3">
              <Button
                onClick={handleSaveToDevice}
                disabled={!isConfigValid}>
                <Download className="h-4 w-4 mr-2" />
                Save to Device
              </Button>
              {hasLocalConfig && (
                <Button variant="ghost" onClick={handleClearLocal}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Local
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Raw JSON toggle */}
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setShowRawJson(!showRawJson)}>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Code className="size-4" />
                Raw JSON
                <Badge variant="outline" className="ml-auto text-xs">
                  {showRawJson ? "Hide" : "Show"}
                </Badge>
              </CardTitle>
            </CardHeader>
            {showRawJson && (
              <CardContent className="pt-0">
                <Textarea
                  readOnly
                  className="font-mono text-xs min-h-[200px]"
                  value={rawJson}
                />
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right column: Live preview */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? (
                <>
                  <EyeOff className="size-4 mr-1" /> Hide
                </>
              ) : (
                <>
                  <Eye className="size-4 mr-1" /> Show
                </>
              )}
            </Button>
          </div>
          <Separator />
          {showPreview && (
            <div className="sticky top-16">
              <FormPreview
                config={questions}
                teamOptions={teamOptions}
                selectOptions={selectOptions}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
