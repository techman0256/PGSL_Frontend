
import { useEffect, useState } from "react";
import "./MilkReception.css";

const STORAGE_KEY = "gadvasu_milk_receptions";

const initialRecords = [
  {
    id: "MR-20261007-004",
    date: "2026-10-07",
    milkType: "Cow",
    quantity: 1250,
    shift: "Morning",
    time: "08:30",
  },
  {
    id: "MR-20261007-003",
    date: "2026-10-07",
    milkType: "Buffalo",
    quantity: 800,
    shift: "Morning",
    time: "09:00",
  },
  {
    id: "MR-20261006-002",
    date: "2026-10-06",
    milkType: "Goat",
    quantity: 250,
    shift: "Evening",
    time: "17:00",
  },
  {
    id: "MR-20261006-001",
    date: "2026-10-06",
    milkType: "Sahiwal",
    quantity: 600,
    shift: "Evening",
    time: "17:30",
  },
];

const emptyForm = {
  milkType: "Cow",
  quantity: "1250",
  date: "2026-10-07",
  shift: "Morning",
  time: "08:30",
};

function formatDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatQuantity(quantity) {
  return Number(quantity).toLocaleString("en-IN");
}

function formatTime(timeString) {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${String(displayHours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")} ${suffix}`;
}

function getNextBatchId(date, records) {
  const datePart = date.replaceAll("-", "");
  const prefix = `MR-${datePart}-`;

  const highestNumber = records.reduce((highest, record) => {
    if (!record.id.startsWith(prefix)) return highest;

    const number = Number(record.id.slice(prefix.length));
    return Number.isFinite(number) ? Math.max(highest, number) : highest;
  }, 0);

  return `${prefix}${String(highestNumber + 1).padStart(3, "0")}`;
}

function readSavedRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error("Could not load milk reception records:", error);
  }

  return initialRecords;
}

export default function MilkReception() {
  const [records, setRecords] = useState(readSavedRecords);
  const [form, setForm] = useState({ ...emptyForm });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error("Could not save milk reception records:", error);
      setMessage("Could not save records in this browser.");
      setMessageType("error");
    }
  }, [records]);

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setMessage("");
    setMessageType("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const quantity = Number(form.quantity);

    if (!form.date || !form.time || !form.milkType || !form.shift) {
      setMessage("Please complete all required fields.");
      setMessageType("error");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setMessage("Quantity must be a number greater than zero.");
      setMessageType("error");
      return;
    }

    const newRecord = {
      id: getNextBatchId(form.date, records),
      date: form.date,
      milkType: form.milkType,
      quantity,
      shift: form.shift,
      time: form.time,
    };

    setRecords((previous) => [newRecord, ...previous]);
    setForm({ ...emptyForm });
    setMessage(`Milk reception saved successfully. Batch ID: ${newRecord.id}`);
    setMessageType("success");
  }

  const recentRecords = [...records]
    .sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date);
      if (dateComparison !== 0) return dateComparison;
      return b.time.localeCompare(a.time);
    })
    .slice(0, 4);

  return (
    <div className="reception-page">
      <div className="reception-heading">
        <h1>Milk Reception</h1>
        <p>Record incoming milk and create a milk batch.</p>
      </div>

      <form className="reception-card" onSubmit={handleSubmit}>
        <div className="reception-card-title">New Milk Reception</div>

        <div className="reception-form-body">
          <div className="reception-grid">
            <div className="reception-field">
              <label htmlFor="batch-id">Milk Batch ID</label>
              <div className="input-with-icon">
                <input
                  id="batch-id"
                  value="Auto Generated"
                  readOnly
                  className="readonly-input"
                />
                <span className="field-icon" aria-hidden="true">♙</span>
              </div>
            </div>

            <fieldset className="reception-field segmented-field">
              <legend>Milk Type</legend>
              <div className="segment-control">
                {["Cow", "Buffalo", "Goat", "Sahiwal"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={form.milkType === type ? "segment active" : "segment"}
                    onClick={() => updateField("milkType", type)}
                    aria-pressed={form.milkType === type}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="reception-field full-width">
              <label htmlFor="quantity">Quantity (Litres)</label>
              <input
                id="quantity"
                type="number"
                min="0.01"
                step="any"
                value={form.quantity}
                onChange={(event) => updateField("quantity", event.target.value)}
                placeholder="Enter quantity in litres"
                required
              />
            </div>

            <div className="reception-field">
              <label htmlFor="reception-date">Date</label>
              <input
                id="reception-date"
                type="date"
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
                required
              />
            </div>

            <fieldset className="reception-field segmented-field">
              <legend>Shift</legend>
              <div className="segment-control shift-control">
                {["Morning", "Evening"].map((shift) => (
                  <button
                    key={shift}
                    type="button"
                    className={form.shift === shift ? "segment active" : "segment"}
                    onClick={() => updateField("shift", shift)}
                    aria-pressed={form.shift === shift}
                  >
                    {shift}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="reception-field">
              <label htmlFor="reception-time">Time</label>
              <input
                id="reception-time"
                type="time"
                value={form.time}
                onChange={(event) => updateField("time", event.target.value)}
                required
              />
            </div>

            <div className="batch-note">
              Batch ID will be assigned when the reception is saved.
            </div>
          </div>

          {message && (
            <div
              className={`reception-message ${messageType}`}
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}
        </div>

        <div className="reception-form-footer">
          <button type="submit" className="save-reception-button">
            Save Reception
          </button>
        </div>
      </form>

      <section className="reception-card recent-receptions">
        <div className="recent-receptions-heading">
          <h2>Recent Milk Reception</h2>
          <span>Latest {Math.min(4, records.length)} receptions</span>
        </div>

        <div className="reception-table-wrapper">
          <table className="reception-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Batch ID</th>
                <th>Milk Type</th>
                <th className="quantity-column">Quantity</th>
                <th>Shift</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((record) => (
                <tr key={record.id}>
                  <td>{formatDate(record.date)}</td>
                  <td>{record.id}</td>
                  <td>{record.milkType}</td>
                  <td className="quantity-column">
                    {formatQuantity(record.quantity)} L
                  </td>
                  <td>{record.shift}</td>
                </tr>
              ))}

              {recentRecords.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-records">
                    No milk reception records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
