import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type StepRecord = {
  date: string;
  steps: number;
};

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

const DailySteps: React.FC = () => {
  const [records, setRecords] = useState<StepRecord[]>(() => {
    try {
      const saved = localStorage.getItem("dailySteps");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [today, setToday] = useState(() => formatDateInput(new Date()));
  const [steps, setSteps] = useState<number | "">("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Trend period: week, month, year
  const [trendPeriod, setTrendPeriod] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    localStorage.setItem("dailySteps", JSON.stringify(records));
  }, [records]);

  const alreadyMarked = records.some(r => r.date === today);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadyMarked || steps === "" || steps < 0) return;
    setRecords(prev => [
      { date: today, steps: Number(steps) },
      ...prev,
    ]);
    setSteps("");
  };

  const handleDelete = (idx: number) => {
    setRecords(prev => prev.filter((_, i) => i !== idx));
  };

  // Prevent future dates
  const maxDate = formatDateInput(new Date());

  // Helper: get start of week/month/year for a date
  function getPeriodStart(date: Date, period: "week" | "month" | "year") {
    if (period === "week") {
      const d = new Date(date);
      const day = d.getDay();
      d.setDate(d.getDate() - day);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (period === "month") {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    if (period === "year") {
      return new Date(date.getFullYear(), 0, 1);
    }
    return date;
  }

  // Filter records for the selected period
  const now = new Date();
  const periodStart = getPeriodStart(now, trendPeriod);
  const filteredTrendRecords = records.filter(r => {
    const d = new Date(r.date);
    return d >= periodStart && d <= now;
  });

  // Cumulative steps for the period
  const cumulativeSteps = filteredTrendRecords.reduce((sum, r) => sum + r.steps, 0);

  // For trend table: group by day (week), by week (month), by month (year)
  let trendTable: { label: string; steps: number }[] = [];
  if (trendPeriod === "week") {
    // Show each day of this week
    for (let i = 0; i < 7; i++) {
      const d = new Date(periodStart);
      d.setDate(d.getDate() + i);
      const dateStr = formatDateInput(d);
      const rec = records.find(r => r.date === dateStr);
      trendTable.push({
        label: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
        steps: rec ? rec.steps : 0,
      });
    }
  } else if (trendPeriod === "month") {
    // Show each week of this month
    const weeks: { [week: string]: number } = {};
    records.forEach(r => {
      const d = new Date(r.date);
      if (d >= periodStart && d <= now) {
        // Week number in month
        const weekNum = Math.floor((d.getDate() - 1) / 7) + 1;
        const label = `Week ${weekNum}`;
        weeks[label] = (weeks[label] || 0) + r.steps;
      }
    });
    trendTable = Object.entries(weeks).map(([label, steps]) => ({ label, steps }));
  } else if (trendPeriod === "year") {
    // Show each month of this year
    const months: { [month: string]: number } = {};
    records.forEach(r => {
      const d = new Date(r.date);
      if (d >= periodStart && d <= now) {
        const label = d.toLocaleDateString(undefined, { month: "short" });
        months[label] = (months[label] || 0) + r.steps;
      }
    });
    trendTable = Object.entries(months).map(([label, steps]) => ({ label, steps }));
  }

  return (
    <div className="flex flex-col items-center min-h-[60vh] py-10 bg-gradient-to-br from-blue-100 via-cyan-100 to-pink-100">
      <div className="w-full max-w-lg bg-white/90 rounded-2xl shadow-2xl p-0 border border-border overflow-hidden">
        <div className="flex items-center justify-center px-8 py-6 bg-gradient-to-r from-blue-400 to-pink-300">
          <h2 className="text-2xl font-extrabold text-white drop-shadow tracking-tight">Track My Daily Steps</h2>
        </div>
        <div className="p-8">
          {/* Trend period selector */}
          <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <label className="font-semibold text-blue-900 mr-2">Trend:</label>
              <select
                value={trendPeriod}
                onChange={e => setTrendPeriod(e.target.value as "week" | "month" | "year")}
                className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div className="font-semibold text-blue-900">
              Cumulative Steps: <span className="text-pink-700 font-bold">{cumulativeSteps}</span>
            </div>
          </div>
          {/* Trend table */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-2 text-blue-900">Trend ({trendPeriod.charAt(0).toUpperCase() + trendPeriod.slice(1)})</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-100 to-pink-100">
                    <th className="p-3 border-b font-semibold text-blue-900">{trendPeriod === "week" ? "Day" : trendPeriod === "month" ? "Week" : "Month"}</th>
                    <th className="p-3 border-b font-semibold text-blue-900">Steps</th>
                  </tr>
                </thead>
                <tbody>
                  {trendTable.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center text-gray-500 py-4">
                        No data for this period.
                      </td>
                    </tr>
                  ) : (
                    trendTable.map((row, idx) => (
                      <tr key={row.label + idx} className="hover:bg-blue-50 transition">
                        <td className="p-3 border-b">{row.label}</td>
                        <td className="p-3 border-b">{row.steps}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <form className="mb-8" onSubmit={handleAdd}>
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-blue-900">
                Date
              </label>
              <div className="flex gap-2 items-center relative">
                <input
                  id="steps-date"
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={today}
                  onChange={e => setToday(e.target.value)}
                  readOnly
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setShowDatePicker(v => !v)}
                >
                  📅
                </Button>
                {showDatePicker && (
                  <div className="absolute z-50 top-full left-0 mt-2 bg-white border rounded shadow-lg">
                    <input
                      type="date"
                      value={today}
                      max={maxDate}
                      onChange={e => {
                        if (e.target.value <= maxDate) setToday(e.target.value);
                        setShowDatePicker(false);
                      }}
                      className="border rounded px-3 py-2"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-blue-900">
                Steps
              </label>
              <input
                type="number"
                min={0}
                value={steps}
                onChange={e => setSteps(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
                placeholder="Enter steps"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-pink-400 text-white shadow-md hover:scale-105 transition"
              disabled={alreadyMarked}
            >
              {alreadyMarked ? "Already Marked" : "Add Steps"}
            </Button>
          </form>
          <h3 className="text-xl font-bold mb-4 text-blue-900">Step Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow">
              <thead>
                <tr className="bg-gradient-to-r from-blue-100 to-pink-100">
                  <th className="p-3 border-b font-semibold text-blue-900">Date</th>
                  <th className="p-3 border-b font-semibold text-blue-900">Steps</th>
                  <th className="p-3 border-b font-semibold text-blue-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-500 py-4">
                      No step records yet.
                    </td>
                  </tr>
                ) : (
                  records.map((r, idx) => (
                    <tr key={r.date} className="hover:bg-blue-50 transition">
                      <td className="p-3 border-b">{r.date}</td>
                      <td className="p-3 border-b">{r.steps}</td>
                      <td className="p-3 border-b">
                        <Button
                          className="bg-red-600 text-white px-3 py-1"
                          type="button"
                          onClick={() => handleDelete(idx)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySteps;