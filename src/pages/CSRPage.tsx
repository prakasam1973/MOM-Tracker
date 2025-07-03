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

const FINANCIAL_YEARS = ["21-22", "22-23", "23-24", "24-25", "25-26"];
const NGO_NAMES = ["IndiaSudar", "OSSAT", "Diyaghar", "Sapno ke"];
const PHASES = ["Phase 1", "Phase 2", "Phase 3"];
const PROJECTS = [
  "Infrastructure",
  "Painting",
  "Toilet construction",
  "Notebook distribution",
];
const STATUSES = ["Not started", "In Progress", "Completed"];

type CSREvent = {
  financialYear: string;
  ngoName: string;
  phase: string;
  project: string;
  location: string;
  startDate: string;
  endDate: string;
  inaugurationDate: string;
  participants: number;
  totalCost: number;
  googleLocation: string;
  status: string;
};

const CSRPage: React.FC = () => {
  const [form, setForm] = useState<CSREvent>({
    financialYear: "25-26",
    ngoName: NGO_NAMES[0],
    phase: PHASES[0],
    project: PROJECTS[0],
    location: "",
    startDate: "",
    endDate: "",
    inaugurationDate: "",
    participants: 0,
    totalCost: 0,
    googleLocation: "",
    status: STATUSES[0],
  });
  const [events, setEvents] = useState<CSREvent[]>(() => {
    try {
      const saved = localStorage.getItem("csrEvents");
      if (!saved) return [];
      // Migrate old records to include new fields with defaults
      const parsed = JSON.parse(saved);
      return parsed.map((e: any) => ({
        financialYear: typeof e.financialYear === "string" ? e.financialYear : FINANCIAL_YEARS[0],
        ngoName: typeof e.ngoName === "string" ? e.ngoName : NGO_NAMES[0],
        phase: e.phase || PHASES[0],
        project: e.project || PROJECTS[0],
        location: e.location || "",
        startDate: e.startDate || "",
        endDate: e.endDate || "",
        inaugurationDate: e.inaugurationDate || "",
        participants: typeof e.participants === "number" ? e.participants : 0,
        totalCost: typeof e.totalCost === "number" ? e.totalCost : 0,
        googleLocation: typeof e.googleLocation === "string" ? e.googleLocation : "",
        status: typeof e.status === "string" ? e.status : STATUSES[0],
      }));
    } catch {
      return [];
    }
  });

  // For editing
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CSREvent | null>(null);

  // For delete confirmation
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  // Filters
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterNGO, setFilterNGO] = useState<string>("all");

  useEffect(() => {
    localStorage.setItem("csrEvents", JSON.stringify(events));
  }, [events]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "participants" || name === "totalCost" ? Number(value) : value,
    }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!editForm) return;
    const { name, value } = e.target;
    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            [name]: name === "participants" || name === "totalCost" ? Number(value) : value,
          }
        : null
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setEvents((prev) => [...prev, form]);
    setForm({
      financialYear: "25-26",
      ngoName: NGO_NAMES[0],
      phase: PHASES[0],
      project: PROJECTS[0],
      location: "",
      startDate: "",
      endDate: "",
      inaugurationDate: "",
      participants: 0,
      totalCost: 0,
      googleLocation: "",
      status: STATUSES[0],
    });
  };

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditForm({ ...events[idx] });
  };

  const handleEditSave = (idx: number) => {
    if (!editForm) return;
    setEvents((prev) =>
      prev.map((e, i) => (i === idx ? editForm : e))
    );
    setEditIdx(null);
    setEditForm(null);
  };

  const handleEditCancel = () => {
    setEditIdx(null);
    setEditForm(null);
  };

  const handleDelete = (idx: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== idx));
    if (editIdx === idx) {
      setEditIdx(null);
      setEditForm(null);
    }
    setDeleteIdx(null);
  };

  const navigate = useNavigate();

  // Filtering logic
  const filteredEvents = events.filter(e =>
    (filterYear === "all" || e.financialYear === filterYear) &&
    (filterNGO === "all" || e.ngoName === filterNGO)
  );

  // Prevent future dates
  const maxDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col items-center min-h-[80vh] py-10">
      <div className="w-full max-w-full bg-white/90 rounded-2xl shadow-xl p-10 border border-border">
        <div className="flex items-center mb-4">
          <Button
            variant="outline"
            className="mr-4"
            onClick={() => navigate("/")}
          >
            Back
          </Button>
          <h2 className="text-3xl font-extrabold flex-1 text-center text-primary tracking-tight">
            CSR Events
          </h2>
        </div>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          onSubmit={handleAdd}
        >
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Financial Year
            </label>
            <select
              name="financialYear"
              value={form.financialYear}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
              required
            >
              {FINANCIAL_YEARS.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              NGO Name
            </label>
            <select
              name="ngoName"
              value={form.ngoName}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
              required
            >
              {NGO_NAMES.map((ngo) => (
                <option key={ngo} value={ngo}>
                  {ngo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Phase
            </label>
            <select
              name="phase"
              value={form.phase}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
              required
            >
              {PHASES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Project
            </label>
            <select
              name="project"
              value={form.project}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
              required
            >
              {PROJECTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Project Location
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Google Location (URL)
            </label>
            <input
              name="googleLocation"
              value={form.googleLocation}
              onChange={handleChange}
              type="text"
              placeholder="https://maps.google.com/..."
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
              required
              max={maxDate}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
              required
              max={maxDate}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Inauguration Date
            </label>
            <input
              type="date"
              name="inaugurationDate"
              value={form.inaugurationDate}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
              required
              max={maxDate}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Number of Participants
            </label>
            <input
              type="number"
              name="participants"
              value={form.participants}
              min={0}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Total Project Cost
            </label>
            <input
              type="number"
              name="totalCost"
              value={form.totalCost}
              min={0}
              step="0.01"
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Project Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
              required
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-md hover:scale-105 transition w-full"
            >
              Add Event
            </Button>
          </div>
        </form>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Filter by Financial Year
            </label>
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
            >
              <option value="all">All</option>
              {FINANCIAL_YEARS.map(fy => (
                <option key={fy} value={fy}>{fy}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Filter by NGO Name
            </label>
            <select
              value={filterNGO}
              onChange={e => setFilterNGO(e.target.value)}
              className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
            >
              <option value="all">All</option>
              {NGO_NAMES.map(ngo => (
                <option key={ngo} value={ngo}>{ngo}</option>
              ))}
            </select>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-4 text-blue-900">Event Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-cyan-100">
                <th className="p-3 border-b font-semibold text-blue-900">Financial Year</th>
                <th className="p-3 border-b font-semibold text-blue-900">NGO Name</th>
                <th className="p-3 border-b font-semibold text-blue-900">Phase</th>
                <th className="p-3 border-b font-semibold text-blue-900">Project</th>
                <th className="p-3 border-b font-semibold text-blue-900">Location</th>
                <th className="p-3 border-b font-semibold text-blue-900">Google Location</th>
                <th className="p-3 border-b font-semibold text-blue-900">Start Date</th>
                <th className="p-3 border-b font-semibold text-blue-900">End Date</th>
                <th className="p-3 border-b font-semibold text-blue-900">Inauguration Date</th>
                <th className="p-3 border-b font-semibold text-blue-900">Participants</th>
                <th className="p-3 border-b font-semibold text-blue-900">Total Cost</th>
                <th className="p-3 border-b font-semibold text-blue-900">Status</th>
                <th className="p-3 border-b font-semibold text-blue-900">Actions</th>
              </tr>
            </thead>
            {/* ...table body and footer unchanged... */}
          </table>
        </div>
      </div>
    </div>
  );
};

export default CSRPage;