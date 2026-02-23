import { format, isValid } from "date-fns";

// Safe date formatter
function formatDisplayDate(dateString) {
  if (!dateString) return "";

  const parsed = new Date(dateString);

  if (!isValid(parsed)) return dateString; // fallback to raw value

  return format(parsed, "MMM yyyy");
}

// Helper function to convert entries to markdown
export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const start = formatDisplayDate(entry.startDate);
        const end = entry.current
          ? "Present"
          : formatDisplayDate(entry.endDate);

        const dateRange = `${start} - ${end}`;

        return `### ${entry.title} @ ${entry.organization}
${dateRange}

${entry.description}`;
      })
      .join("\n\n")
  );
}