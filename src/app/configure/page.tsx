"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";
import {
  saveConfigLocally,
  loadCachedConfig,
  clearCachedConfig
} from "@/lib/db/offlineDb";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings2,
  Download,
  Upload,
  Trash2,
  Eye,
  ArrowLeft,
  Save,
  CheckCircle2
} from "lucide-react";

import FormPreview from "./FormPreview";

/**
 * Configure page — desktop-oriented config editor.
 *
 * Features:
 * 1. Edit scouting form config JSON.
 * 2. Real-time preview of the resulting form.
 * 3. Save/load config from Supabase.
 * 4. Download config to IndexedDB for offline scouting.
 */
export default function ConfigurePage() {
  const [configJson, setConfigJson] = useState("[]");
  const [teamOptionsJson, setTeamOptionsJson] = useState("[]");
  const [selectOptionsJson, setSelectOptionsJson] = useState("{}");
  const [supabaseConfigId, setSupabaseConfigId] = useState("");
  const [hasLocalConfig, setHasLocalConfig] = useState(false);
  const [localDownloadedAt, setLocalDownloadedAt] = useState<string | null>(
    null
  );
  const [showPreview, setShowPreview] = useState(true);

  // Parse config for preview (gracefully handle invalid JSON)
  const parsedConfig = useMemo<ScoutingQuestionConfig[]>(() => {
    try {
      const parsed = JSON.parse(configJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [configJson]);

  const parsedTeamOptions = useMemo<SelectOption[]>(() => {
    try {
      const parsed = JSON.parse(teamOptionsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [teamOptionsJson]);

  const parsedSelectOptions = useMemo<Record<string, SelectOption[]>>(() => {
    try {
      const parsed = JSON.parse(selectOptionsJson);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }, [selectOptionsJson]);

  // Load local config status on mount
  useEffect(() => {
    loadCachedConfig().then((cached) => {
      if (cached) {
        setHasLocalConfig(true);
        setLocalDownloadedAt(cached.downloadedAt);
      }
    });
  }, []);

  // ----- Supabase save/load -----

  const handleSaveToSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      toast.error("Supabase not configured. Set environment variables.");
      return;
    }

    try {
      const payload = {
        config: JSON.parse(configJson),
        team_options: JSON.parse(teamOptionsJson),
        select_options: JSON.parse(selectOptionsJson),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await client
        .from("scouting_configs")
        .upsert({ id: supabaseConfigId || undefined, ...payload })
        .select()
        .single();

      if (error) throw error;

      if (data?.id) setSupabaseConfigId(data.id);
      toast.success("Config saved to Supabase!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to save: " + message);
    }
  };

  const handleLoadFromSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      toast.error("Supabase not configured. Set environment variables.");
      return;
    }

    if (!supabaseConfigId) {
      toast.error("Enter a config ID to load.");
      return;
    }

    try {
      const { data, error } = await client
        .from("scouting_configs")
        .select("*")
        .eq("id", supabaseConfigId)
        .single();

      if (error) throw error;

      setConfigJson(JSON.stringify(data.config, null, 2));
      setTeamOptionsJson(JSON.stringify(data.team_options || [], null, 2));
      setSelectOptionsJson(
        JSON.stringify(data.select_options || {}, null, 2)
      );
      toast.success("Config loaded from Supabase!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to load: " + message);
    }
  };

  // ----- Local download -----

  const handleDownloadToDevice = async () => {
    try {
      const config = JSON.parse(configJson);
      const teamOptions = JSON.parse(teamOptionsJson);
      const selectOptions = JSON.parse(selectOptionsJson);

      await saveConfigLocally(config, teamOptions, selectOptions);
      setHasLocalConfig(true);
      setLocalDownloadedAt(new Date().toISOString());
      toast.success("Config saved to device for offline use!");
    } catch {
      toast.error("Invalid JSON. Fix errors before downloading.");
    }
  };

  const handleClearLocal = async () => {
    await clearCachedConfig();
    setHasLocalConfig(false);
    setLocalDownloadedAt(null);
    toast.success("Local config cleared.");
  };

  const isConfigValid = parsedConfig.length > 0;

  return (
    <div className="w-full h-full container mx-auto flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Configure Scouting Form</h1>
          <p className="text-muted-foreground text-sm">
            Edit the form config and preview changes in real-time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Editor */}
        <div className="flex flex-col gap-6">
          {/* Supabase sync */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="h-5 w-5" />
                Supabase Config Sync
              </CardTitle>
              <CardDescription>
                Save and load scouting configs from Supabase for sharing across
                devices.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input
                placeholder="Config ID (leave empty to create new)"
                value={supabaseConfigId}
                onChange={(e) => setSupabaseConfigId(e.target.value)}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadFromSupabase}>
                  <Download className="h-4 w-4 mr-2" />
                  Load
                </Button>
                <Button size="sm" onClick={handleSaveToSupabase}>
                  <Upload className="h-4 w-4 mr-2" />
                  Save to Supabase
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Config JSON editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Form Config JSON</CardTitle>
              <CardDescription>
                Define the scouting form questions as a JSON array.
                {isConfigValid && (
                  <Badge variant="secondary" className="ml-2">
                    {parsedConfig.length} question
                    {parsedConfig.length !== 1 && "s"}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="font-mono text-xs min-h-[300px]"
                spellCheck={false}
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                placeholder='[{"name":"Team","type":"team"},{"name":"Score","type":"number","min":0,"max":100}]'
              />
            </CardContent>
          </Card>

          {/* Team & select options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Options JSON</CardTitle>
              <CardDescription>
                Array of team options for &quot;team&quot; type fields.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="font-mono text-xs min-h-[120px]"
                spellCheck={false}
                value={teamOptionsJson}
                onChange={(e) => setTeamOptionsJson(e.target.value)}
                placeholder='[{"name":"Team Alpha","value":3749}]'
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Options JSON</CardTitle>
              <CardDescription>
                Object keyed by select_key with arrays of options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="font-mono text-xs min-h-[120px]"
                spellCheck={false}
                value={selectOptionsJson}
                onChange={(e) => setSelectOptionsJson(e.target.value)}
                placeholder='{"alliance_color":[{"name":"Red","value":1},{"name":"Blue","value":2}]}'
              />
            </CardContent>
          </Card>

          {/* Download to device */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Save className="h-5 w-5" />
                Download to Device
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
                onClick={handleDownloadToDevice}
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
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
          </div>
          <Separator />
          {showPreview && (
            <FormPreview
              config={parsedConfig}
              teamOptions={parsedTeamOptions}
              selectOptions={parsedSelectOptions}
            />
          )}
        </div>
      </div>
    </div>
  );
}
