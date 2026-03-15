"use client";
import { useRouter } from "next/navigation";
import { useConfigs } from "@/hooks/useConfigs";
import { useEntries } from "@/hooks/useEntries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/layout/PageHeader";
import { ClipboardList, QrCode, Database } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { activeConfig } = useConfigs();
  const { entries, unsentCount } = useEntries();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="FRC Scout" subtitle="Ready to scout" />
      <div className="px-4 flex flex-col gap-4">
        <Card className={`border ${activeConfig ? "border-primary" : "border-border"}`}>
          <CardContent className="pt-4">
            {activeConfig ? (
              <div>
                <p className="text-sm text-muted-foreground">Active Config</p>
                <p className="font-bold text-lg">{activeConfig.name}</p>
                {activeConfig.eventKey && (
                  <p className="text-sm text-muted-foreground">{activeConfig.eventKey}</p>
                )}
              </div>
            ) : (
              <div>
                <p className="font-medium text-muted-foreground">No config loaded</p>
                <p className="text-sm text-muted-foreground mt-1">Scan a config QR to begin</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Button
          className="w-full h-16 text-lg font-bold gap-2"
          onClick={() => router.push("/scout")}
          disabled={!activeConfig}
        >
          <ClipboardList size={24} />
          Scout a Match
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold">{entries.length}</p>
              <p className="text-sm text-muted-foreground">Total Entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className={`text-3xl font-bold ${unsentCount > 0 ? "text-yellow-500" : ""}`}>
                {unsentCount}
              </p>
              <p className="text-sm text-muted-foreground">Unsent</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-14 gap-2"
            onClick={() => router.push("/configs")}
          >
            <QrCode size={20} />
            Scan Config
          </Button>
          <Button
            variant="outline"
            className="h-14 gap-2"
            onClick={() => router.push("/entries")}
          >
            <Database size={20} />
            View Entries
          </Button>
        </div>
      </div>
    </div>
  );
}
