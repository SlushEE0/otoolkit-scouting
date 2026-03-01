"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadCachedConfig } from "@/lib/db/offlineDb";

import { AlertCircle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import ScoutingForm from "./ScoutingForm";
import Loading from "./loading";
import type { ScoutingQuestionConfig, SelectOption } from "@/lib/types/scouting";

/**
 * Scouting page – reads config from IndexedDB for offline operation.
 * Users must first download a config via /configure or /settings.
 */
export default function ScoutingPage() {
  const [config, setConfig] = useState<ScoutingQuestionConfig[] | null>(null);
  const [teamOptions, setTeamOptions] = useState<SelectOption[]>([]);
  const [selectOptions, setSelectOptions] = useState<Record<string, SelectOption[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCachedConfig().then((cached) => {
      if (cached) {
        setConfig(cached.config);
        setTeamOptions(cached.teamOptions);
        setSelectOptions(cached.selectOptions);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  const noConfig = !config || config.length === 0;

  return (
    <div className="w-full h-full container mx-auto flex flex-col gap-3 p-4">
      {noConfig ? (
        <NoConfigFound />
      ) : (
        <>
          <div className="hidden md:flex flex-shrink-0 mb-4 justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Scouting Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                Submit match data for team analysis
              </p>
            </div>
            <NavButtons className="p-3 flex flex-col gap-3" />
          </div>
          <Card className="flex md:hidden bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Match Scouting
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Fill out all required fields to submit scouting data
              </p>
              <NavButtons className="w-full flex gap-3 pt-3" />
            </CardHeader>
          </Card>
          <ScoutingForm
            config={config}
            teamOptions={teamOptions}
            selectOptions={selectOptions}
          />
        </>
      )}
    </div>
  );
}

function NoConfigFound() {
  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="mb-0">
        <div className="flex flex-col gap-4">
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            No Scouting Config Found
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Download a scouting configuration to get started. Visit the
            configure page on a desktop to set up your form, then download it
            here.
          </p>
          <div className="flex gap-3">
            <Link href="/configure">
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Configure / Download
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function NavButtons({ className }: { className: string }) {
  return (
    <div {...{ className }}>
      <Link href="/responses" className="flex-1">
        <Button variant="outline" className="w-full">
          Responses
        </Button>
      </Link>
      <Link href="/export" className="flex-1">
        <Button variant="outline" className="w-full">
          Export Data
        </Button>
      </Link>
    </div>
  );
}
