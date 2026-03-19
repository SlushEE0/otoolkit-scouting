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
    <div className="flex flex-col gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700 sticky top-[68px] z-30">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400 font-semibold uppercase">Match #</label>
          <input
            type="number"
            min={1}
            value={matchNumber}
            onChange={(e) => onMatchChange(Number(e.target.value))}
            className="input-number"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400 font-semibold uppercase">Team #</label>
          <input
            type="number"
            min={1}
            value={teamNumber}
            onChange={(e) => onTeamChange(Number(e.target.value))}
            className="input-number"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400 font-semibold uppercase">Alliance</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onAllianceChange("red")}
            className={`flex-1 h-12 rounded-lg font-bold text-white transition-colors ${
              alliance === "red" ? "bg-red-600 active:bg-red-700" : "bg-slate-700 text-slate-300 active:bg-slate-600"
            }`}
          >
            Red
          </button>
          <button
            type="button"
            onClick={() => onAllianceChange("blue")}
            className={`flex-1 h-12 rounded-lg font-bold text-white transition-colors ${
              alliance === "blue" ? "bg-blue-600 active:bg-blue-700" : "bg-slate-700 text-slate-300 active:bg-slate-600"
            }`}
          >
            Blue
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400 font-semibold uppercase">Station</label>
        <div className="flex gap-2">
          {([1, 2, 3] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStationChange(s)}
              className={`flex-1 h-12 rounded-lg font-bold transition-colors ${
                station === s
                  ? "bg-blue-600 text-white active:bg-blue-700"
                  : "bg-slate-700 text-slate-300 active:bg-slate-600"
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
