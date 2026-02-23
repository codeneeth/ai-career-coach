"use client";
import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { improveWithAI } from "@/actions/resume"; // adjust path as needed

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

/* -------------------- Spinner -------------------- */
const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

/* -------------------- Field Wrapper -------------------- */
const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
    )}
    {children}
  </div>
);

const inputClass =
  "w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900";

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
  const [enhancing, setEnhancing] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  };

  const handleAIEnhance = async () => {
    if (!form.description.trim()) {
      setAiError("Write a description first before enhancing.");
      return;
    }
    setAiError("");
    setEnhancing(true);
    try {
      const improved = await improveWithAI({
        current: form.description,
        type: type.toLowerCase(),
      });
      setForm((prev) => ({ ...prev, description: improved }));
    } catch (err) {
      setAiError("AI enhancement failed. Please try again.");
    } finally {
      setEnhancing(false);
    }
  };

  const handleAdd = () => {
    if (
      !form.title ||
      !form.organization ||
      !form.startDate ||
      !form.description
    ) {
      alert("Please fill all required fields.");
      return;
    }
    if (!form.current && !form.endDate) {
      alert("End date is required if you are not currently here.");
      return;
    }
    const newEntry = {
      ...form,
      displayStartDate: formatDisplayDate(form.startDate),
      displayEndDate: form.current ? "Present" : formatDisplayDate(form.endDate),
    };
    onChange([...entries, newEntry]);
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
    <div
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      className="rounded-2xl border border-[#2a2a2a] bg-[#141414] shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#2a2a2a] px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-100">Add {type}</h2>
          <p className="text-xs text-slate-500">Fill in the details below</p>
        </div>
      </div>

      {/* Form Body */}
      <div className="space-y-5 p-6">
        {/* Title & Organization */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" required>
            <input
              type="text"
              name="title"
              placeholder={type === "Experience" ? "Software Engineer" : "B.Sc. Computer Science"}
              value={form.title}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>
          <Field label="Organization" required>
            <input
              type="text"
              name="organization"
              placeholder={type === "Experience" ? "Acme Corp" : "MIT"}
              value={form.organization}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Start Date" required>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>
          {!form.current && (
            <Field label="End Date" required>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
          )}
        </div>

        {/* Currently here checkbox */}
        <label className="inline-flex cursor-pointer items-center gap-2.5">
          <div className="relative">
            <input
              type="checkbox"
              name="current"
              checked={form.current}
              onChange={handleChange}
              className="peer sr-only"
            />
            <div className="h-5 w-5 rounded border-2 border-[#3a3a3a] bg-[#1a1a1a] transition peer-checked:border-indigo-500 peer-checked:bg-indigo-600 flex items-center justify-center">
              {form.current && (
                <svg
                  className="h-3 w-3 text-white"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-slate-400 select-none">
            I currently {type === "Experience" ? "work" : "study"} here
          </span>
        </label>

        {/* Description with AI Enhance */}
        <Field label="Description" required>
          <div className="relative">
            <textarea
              name="description"
              placeholder="Describe your responsibilities, achievements, and impact..."
              value={form.description}
              onChange={handleChange}
              rows={4}
              className={`${inputClass} resize-none pr-36`}
            />
            <button
              type="button"
              onClick={handleAIEnhance}
              disabled={enhancing}
              className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md bg-[#1e1e2e] px-2.5 py-1.5 text-xs font-semibold text-indigo-400 border border-indigo-900 hover:bg-[#25253a] disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {enhancing ? (
                <>
                  <Spinner />
                  Enhancing…
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.83-4.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  AI Enhance
                </>
              )}
            </button>
          </div>
          {aiError && (
            <p className="mt-1 text-xs text-rose-500">{aiError}</p>
          )}
        </Field>

        {/* Submit */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add {type}
          </button>
        </div>
      </div>
    </div>
  );
}