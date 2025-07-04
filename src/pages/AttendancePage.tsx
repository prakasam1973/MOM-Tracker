import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type AttendanceRecord = {
  date: string;
  checkIn: string;
  checkOut: string;
  totalTime: string;
  status: "Present" | "Absent";
  notes: string;
};

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getCurrentTime() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

function calculateTotalTime(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return "";
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);
  let start = new Date(0, 0, 0, inH, inM);
  let end = new Date(0, 0, 0, outH, outM);
  let diff = (end.getTime() - start.getTime()) / 1000 / 60; // minutes
  if (diff < 0) diff += 24 * 60; // handle overnight
  const hours = Math.floor(diff / 60);
  const minutes = Math.floor(diff % 60);
  return `${hours}h ${minutes}m`;
}

function getMonthYear(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthOptions(records: AttendanceRecord[]) {
  const months = new Set(records.map(r => getMonthYear(r.date)));
  return Array.from(months).sort().reverse();
}

function sumTotalMinutes(records: AttendanceRecord[]) {
  let total = 0;
  for (const r of records) {
    if (r.totalTime) {
      const match = r.totalTime.match(/(\d+)h\s*(\d+)m/);
      if (match) {
        total += parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
      }
    }
  }
  return total;
}

function formatMinutesToHhMm(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours}h ${minutes}m`;
}

const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem("attendanceRecords");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [status, setStatus] = useState<"Present" | "Absent">("Present");
  const [notes, setNotes] = useState("");
  const [today, setToday] = useState(() => {
    const d = new Date();
    return formatDateInput(d);
  });
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Present" | "Absent">("all");
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("attendanceRecords", JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (status === "Absent") {
      setCheckIn("");
      setCheckOut("");
    }
  }, [status]);

  const alreadyMarked = records.some(r => r.date === today);

  const totalTime = calculateTotalTime(checkIn, checkOut);

  const monthOptions = getMonthOptions(records.length > 0 ? records : [{ date: today, checkIn: "", checkOut: "", totalTime: "", status: "Present", notes: "" }]);

  const filteredRecords = records.filter(r =>
    (selectedMonth === "all" || getMonthYear(r.date) === selectedMonth) &&
    (statusFilter === "all" || r.status === statusFilter)
  );

  const totalMinutes = sumTotalMinutes(filteredRecords);
  const totalTimeFormatted = formatMinutesToHhMm(totalMinutes);

  // Prevent future dates
  const maxDate = formatDateInput(new Date());

  const handleDelete = (idx: number) => {
    setRecords(prev => prev.filter((_, i) => i !== idx));
    setDeleteIdx(null);
  };

  return (
    <div className="flex flex-col items-center min-h-[80vh] py-10 bg-gradient-to-br from-blue-600 via-cyan-400 to-indigo-400">
      <div className="w-full max-w-full bg-white/90 rounded-2xl shadow-2xl p-0 border border-border min-h-screen overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center px-10 py-6 bg-gradient-to-r from-blue-700 to-cyan-500">
          <Button
            variant="outline"
            className="mr-4"
            onClick={() => navigate("/")}
          >
            Back
          </Button>
          <h2 className="text-2xl font-extrabold flex-1 text-center text-white drop-shadow tracking-tight">
            Daily Attendance
          </h2>
        </div>
        <div className="p-10">
        <form className="mb-8" onSubmit={e => {
          e.preventDefault();
          if (alreadyMarked) return;
          setRecords(prev => [
            { date: today, checkIn, checkOut, totalTime, status, notes },
            ...prev,
          ]);
          setNotes("");
          setStatus("Present");
          setCheckIn("");
          setCheckOut("");
        }}>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-blue-900">
              Date
            </label>
            <div className="flex gap-2 items-center relative">
              <input
                id="attendance-date"
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
                  <DayPicker
                    mode="single"
                    selected={today ? new Date(today) : undefined}
                    onDayClick={date => {
                      const selected = formatDateInput(date);
                      if (selected <= maxDate) setToday(selected);
                      setShowDatePicker(false);
                    }}
                    disabled={date => date > new Date()}
                  />
                  <div className="text-xs text-gray-500 px-2 pb-2">No future dates allowed</div>
                </div>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-blue-900">
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as "Present" | "Absent")}
              className="w-full border border-blue-200 rounded-lg px-4 py-2"
              required
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="block font-semibold mb-1 text-blue-900">
                Check In Time
              </label>
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setCheckIn(getCurrentTime())}
                  disabled={status === "Absent"}
                >
                  Now
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setCheckIn("09:00")}
                  disabled={status === "Absent"}
                >
                  9:00 AM
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setCheckIn("")}
                  disabled={status === "Absent"}
                >
                  Clear
                </Button>
                <input
                  type="time"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  className="w-full border border-blue-200 rounded-lg px-4 py-2"
                  required={status === "Present"}
                  disabled={status === "Absent"}
                  placeholder="HH:MM"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1 text-blue-900">
                Check Out Time
              </label>
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setCheckOut(getCurrentTime())}
                  disabled={status === "Absent"}
                >
                  Now
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setCheckOut("18:00")}
                  disabled={status === "Absent"}
                >
                  6:00 PM
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setCheckOut("")}
                  disabled={status === "Absent"}
                >
                  Clear
                </Button>
                <input
                  type="time"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  className="w-full border border-blue-200 rounded-lg px-4 py-2"
                  required={status === "Present"}
                  disabled={status === "Absent"}
                  placeholder="HH:MM"
                />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-blue-900">
              Total Time
            </label>
            <input
              type="text"
              value={totalTime}
              readOnly
              className="w-full border border-blue-200 rounded-lg px-4 py-2 bg-gray-100"
              placeholder="Total time will be calculated"
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-blue-900">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border border-blue-200 rounded-lg px-4 py-2"
              placeholder="Notes"
            />
          </div>
          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-md hover:scale-105 transition w-full"
            disabled={alreadyMarked}
          >
            {alreadyMarked ? "Already Marked" : "Mark Attendance"}
          </Button>
        </form>
        <div className="mb-6 flex gap-4 items-center">
          <label className="font-semibold text-blue-900">Month:</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
          >
            <option value="all">All</option>
            {monthOptions.map(month => (
              <option key={month} value={month}>
                {new Date(month + "-01").toLocaleString("default", { month: "long", year: "numeric" })}
              </option>
            ))}
          </select>
          <label className="font-semibold text-blue-900">Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as "all" | "Present" | "Absent")}
            className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
          >
            <option value="all">All</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
        <h3 className="text-xl font-bold mb-4 text-blue-900">Attendance Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-cyan-100">
                <th className="p-3 border-b font-semibold text-blue-900">Date</th>
                <th className="p-3 border-b font-semibold text-blue-900">Status</th>
                <th className="p-3 border-b font-semibold text-blue-900">Check In</th>
                <th className="p-3 border-b font-semibold text-blue-900">Check Out</th>
                <th className="p-3 border-b font-semibold text-blue-900">Total Time</th>
                <th className="p-3 border-b font-semibold text-blue-900">Notes</th>
                <th className="p-3 border-b font-semibold text-blue-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-4">
                    No attendance records for this month.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={r.date} className="hover:bg-blue-50 transition">
                    <td className="p-3 border-b">{r.date}</td>
                    <td className="p-3 border-b">{r.status}</td>
                    <td className="p-3 border-b">{r.checkIn}</td>
                    <td className="p-3 border-b">{r.checkOut}</td>
                    <td className="p-3 border-b">{r.totalTime}</td>
                    <td className="p-3 border-b">{r.notes}</td>
                    <td className="p-3 border-b">
                      <AlertDialog open={deleteIdx === idx} onOpenChange={open => setDeleteIdx(open ? idx : null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="bg-red-600 text-white px-3 py-1"
                            type="button"
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this attendance record? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(idx)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-right font-bold p-3 border-t border-blue-200">
                  Total:
                </td>
                <td className="font-bold p-3 border-t border-blue-200">
                  {totalTimeFormatted}
                </td>
                <td className="border-t border-blue-200"></td>
                <td className="border-t border-blue-200"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;