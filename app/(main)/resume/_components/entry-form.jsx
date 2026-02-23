"use client";

import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";

/* -------------------- Safe Date Formatter -------------------- */

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";

  try {
    const parsed = parseISO(dateString);

    if (!isValid(parsed)) return "";

    return format(parsed, "MMM yyyy");
  } catch {
    return "";
  }
};

/* -------------------- Entry Form -------------------- */

export function EntryForm({ type, entries = [], onChange }) {
  const [form, setForm] = useState({
    title: "",
    organization: "",
    startDate: "",
    endDate: "",
    description: "",
    current: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdd = () => {
    if (!form.title || !form.organization || !form.startDate || !form.description) {
      alert("Please fill all required fields");
      return;
    }

    if (!form.current && !form.endDate) {
      alert("End date required if not current");
      return;
    }

    const newEntry = {
      ...form,
      displayStartDate: formatDisplayDate(form.startDate),
      displayEndDate: form.current
        ? "Present"
        : formatDisplayDate(form.endDate),
    };

    onChange([...entries, newEntry]);

    // Reset form
    setForm({
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    });
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg">
      <h2 className="text-lg font-semibold">{type}</h2>

      <input
        type="text"
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="organization"
        placeholder="Organization"
        value={form.organization}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <input
        type="date"
        name="startDate"
        value={form.startDate}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {!form.current && (
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      )}

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="current"
          checked={form.current}
          onChange={handleChange}
        />
        Currently working here
      </label>

      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <button
        onClick={handleAdd}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Add {type}
      </button>
    </div>
  );
}