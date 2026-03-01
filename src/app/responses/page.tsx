"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getAllSubmissions,
  deleteSubmission,
  type OfflineScoutingSubmission
} from "@/lib/db/offlineDb";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trash2,
  FileText,
  CheckCircle2,
  Clock
} from "lucide-react";

/**
 * Responses page — lists all locally stored scouting submissions.
 * Users can view submission details and delete individual entries.
 */
export default function ResponsesPage() {
  const [submissions, setSubmissions] = useState<OfflineScoutingSubmission[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await getAllSubmissions();
    setSubmissions(all.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: number) => {
    await deleteSubmission(id);
    toast.success("Submission deleted");
    await load();
  };

  return (
    <div className="w-full h-full container mx-auto flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Submissions</h1>
          <p className="text-muted-foreground text-sm">
            {submissions.length} local submission
            {submissions.length !== 1 && "s"}
          </p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      ) : submissions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              No Submissions Yet
            </CardTitle>
            <CardDescription>
              Submit scouting data from the{" "}
              <Link href="/" className="underline">
                scouting form
              </Link>{" "}
              to see entries here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {submissions.map((sub) => {
            const responses = JSON.parse(sub.responses);
            const teamValue = responses.team || "—";
            const ts = new Date(sub.timestamp);

            return (
              <Card key={sub.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold truncate">
                        Team: {typeof teamValue === "string" ? (() => { try { return JSON.parse(teamValue)?.value || teamValue; } catch { return teamValue; } })() : teamValue}
                      </span>
                      {sub.exported ? (
                        <Badge
                          variant="secondary"
                          className="text-xs shrink-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Exported
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs shrink-0">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ts.toLocaleDateString()} {ts.toLocaleTimeString()} •{" "}
                      {sub.uuid.slice(0, 8)}...
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={() => sub.id && handleDelete(sub.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
