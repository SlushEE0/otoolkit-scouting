"use client";

interface Props {
  matchNumber: number;
  teamNumber: number;
  alliance: "red" | "blue";
  station: 1 | 2 | 3;
  onMatchChange: (v: number) => void;
  onTeamChange: (v: number) => void;
  onAllianceChange: (v: "red" | "blue") => void;
  onStationChange: (v: 1 | 2 | 3) => void;
}

export default function FormHeader({
  matchNumber, teamNumber, alliance, station,
  onMatchChange, onTeamChange, onAllianceChange, onStationChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border border-border">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">Match #</label>
          <input
            type="number"
            min={1}
            value={matchNumber}
            onChange={(e) => onMatchChange(Number(e.target.value))}
            className="h-11 px-3 rounded-md bg-secondary border border-border text-foreground text-lg font-bold"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">Team #</label>
          <input
            type="number"
            min={1}
            value={teamNumber}
            onChange={(e) => onTeamChange(Number(e.target.value))}
            className="h-11 px-3 rounded-md bg-secondary border border-border text-foreground text-lg font-bold"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground font-medium">Alliance</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onAllianceChange("red")}
            className={`flex-1 h-11 rounded-lg font-bold text-white transition-colors ${
              alliance === "red" ? "bg-red-600" : "bg-secondary text-muted-foreground"
            }`}
          >
            Red
          </button>
          <button
            type="button"
            onClick={() => onAllianceChange("blue")}
            className={`flex-1 h-11 rounded-lg font-bold text-white transition-colors ${
              alliance === "blue" ? "bg-blue-600" : "bg-secondary text-muted-foreground"
            }`}
          >
            Blue
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground font-medium">Station</label>
        <div className="flex gap-2">
          {([1, 2, 3] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStationChange(s)}
              className={`flex-1 h-11 rounded-lg font-bold transition-colors ${
                station === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
