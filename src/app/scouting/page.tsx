"use server";

import { Suspense } from "react";
import Link from "next/link";
import { getScoutingConfig } from "@/lib/db/scouting";
import { PBServer } from "@/lib/pb";

import { AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import Loading from "./loading";
import ScoutingForm from "./ScoutingForm";

export default async function ScoutingPage() {
  const pb = await PBServer.getClient();

  const userId = pb.authStore.record?.id || null;
  const [error, scoutingConfig] = await getScoutingConfig(pb);

  if (error || scoutingConfig.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="mb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              No Questions Found
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              There are no questions available for scouting at this time.
            </p>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full h-full container mx-auto flex flex-col gap-3 p-4">
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
      <Suspense fallback={<Loading />}>
        <ScoutingForm config={scoutingConfig} userId={userId || ""} />
      </Suspense>
    </div>
  );
}

function NavButtons({ className }: { className: string }) {
  return (
    <div {...{ className }}>
      <Link href="/scouting/responses" className="flex-1">
        <Button variant={"outline"} className="w-full">
          Responses
        </Button>
      </Link>
      {false && (
        <Button variant={"outline"} className="flex-1">
          Configure
        </Button>
      )}
    </div>
  );
}
