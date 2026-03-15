"use client";
import { useState } from "react";
import { useScouterName, SCOUTER_NAME_KEY } from "@/hooks/useScouterName";
import { useConfigs } from "@/hooks/useConfigs";
import PageHeader from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";

export default function SettingsPage() {
  const { name, setName } = useScouterName();
  const { activeConfig } = useConfigs();
  const [confirmClearEntries, setConfirmClearEntries] = useState(false);
  const [confirmClearConfigs, setConfirmClearConfigs] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  async function clearEntries() {
    await db.entries.clear();
    setConfirmClearEntries(false);
  }

  async function clearConfigs() {
    await db.configs.clear();
    setConfirmClearConfigs(false);
  }

  async function resetApp() {
    await db.entries.clear();
    await db.configs.clear();
    localStorage.removeItem(SCOUTER_NAME_KEY);
    setConfirmReset(false);
    window.location.reload();
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Settings" />
      <div className="px-4 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scout Identity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="scout-name">Your Name</Label>
              <Input
                id="scout-name"
                placeholder="Enter your name…"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Config</CardTitle>
          </CardHeader>
          <CardContent>
            {activeConfig ? (
              <div>
                <p className="font-medium">{activeConfig.name}</p>
                {activeConfig.eventKey && (
                  <p className="text-sm text-muted-foreground">{activeConfig.eventKey}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {activeConfig.fieldSchema.length} fields
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No active config</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">FRC Scout v1.0.0</p>
            <p className="text-xs text-muted-foreground">Offline-first FRC scouting PWA</p>
          </CardContent>
        </Card>
        <Separator />
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {confirmClearEntries ? (
              <div className="flex gap-2">
                <Button variant="destructive" onClick={clearEntries} className="flex-1">
                  Confirm Delete All Entries
                </Button>
                <Button variant="outline" onClick={() => setConfirmClearEntries(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setConfirmClearEntries(true)} className="w-full">
                Clear All Entries
              </Button>
            )}
            {confirmClearConfigs ? (
              <div className="flex gap-2">
                <Button variant="destructive" onClick={clearConfigs} className="flex-1">
                  Confirm Delete All Configs
                </Button>
                <Button variant="outline" onClick={() => setConfirmClearConfigs(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setConfirmClearConfigs(true)} className="w-full">
                Clear All Configs
              </Button>
            )}
            {confirmReset ? (
              <div className="flex gap-2">
                <Button variant="destructive" onClick={resetApp} className="flex-1">
                  Confirm Reset App
                </Button>
                <Button variant="outline" onClick={() => setConfirmReset(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="destructive" onClick={() => setConfirmReset(true)} className="w-full">
                Reset App
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

