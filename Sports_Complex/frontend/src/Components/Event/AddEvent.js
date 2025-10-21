import React, { useState } from "react";
import API from "../../utils/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function AddEvent() {
  const [event, setEvent] = useState({
    name: "",
    type: "",
    description: "",
    date: "",
    location: "",
    maxParticipants: "",
    judgeBoard: "",
    registrationDeadline: "",
    contact: ""
  });

  const [errors, setErrors] = useState({});
  const [savedEvent, setSavedEvent] = useState(null);

  const onlyNumbersOrSymbols = (text) => {
    const onlyNumbers = /^[0-9]+$/.test(text);
    const onlySymbols = /^[^a-zA-Z0-9]+$/.test(text);
    return onlyNumbers || onlySymbols;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";
    const valStr =
      value == null
        ? ""
        : typeof value === "string"
        ? value.trim()
        : String(value).trim();

    const now = new Date();

    switch (name) {
      case "name":
        if (!valStr) error = "Event name is required.";
        else if (onlyNumbersOrSymbols(valStr)) error = "Event name cannot be only numbers or symbols.";
        break;

      case "type":
        if (!value) error = "Type is required.";
        break;

      case "description":
        if (!valStr) error = "Description is required.";
        else if (onlyNumbersOrSymbols(valStr)) error = "Description cannot be only numbers or symbols.";
        break;

      case "date":
        if (!value) error = "Date & Time required.";
        else if (new Date(value) < new Date(now.setHours(0, 0, 0, 0)))
          error = "Date and Time cannot be in the past.";
        break;

      case "location":
        if (!value) error = "Location is required.";
        break;

      case "maxParticipants":
        if (!value) error = "Max Participants required.";
        else if (Number(value) <= 0) error = "Must be greater than 0.";
        break;

      case "judgeBoard":
        if (!valStr) error = "Judge Board is required.";
        else if (onlyNumbersOrSymbols(valStr)) error = "Judge Board cannot be only numbers or symbols.";
        break;

      case "registrationDeadline":
        if (!value) error = "Registration Deadline required.";
        else if (new Date(value) < new Date(now.setHours(0, 0, 0, 0)))
          error = "Deadline cannot be in the past.";
        break;

      case "contact":
        if (!/^0\d{9}$/.test(valStr)) error = "Contact must be 10 digits starting with 0.";
        break;

      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    Object.entries(event).forEach(([key, val]) => validateField(key, val));
    if (Object.values(errors).some(err => err)) {
      alert("Fix errors first.");
      return;
    }

    const formattedEvent = {
      title: event.name,
      type: event.type,
      description: event.description,
      time: event.date,
      venue: event.location,
      maxParticipants: Number(event.maxParticipants),
      judgeBoard: event.judgeBoard.split(',').map(s => s.trim()),
      registrationDeadline: event.registrationDeadline,
      contacts: [event.contact]
    };

    try {
      const res = await API.post("/api/v1/events", formattedEvent);
      setSavedEvent(res.data);
      alert("✅ Event saved successfully!");
    } catch (err) {
      console.error("Error saving:", err.message);
      alert("❌ Failed to save event: " + err.message);
    }
  };

  const downloadPDF = () => {
    if (!savedEvent) {
      alert("Save first!");
      return;
    }

    const doc = new jsPDF();
    const now = new Date();
    const dateTimeString = now.toLocaleString();

    // PDF Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor("#1d4ed8");
    doc.text("SportSync.LK - Event Details", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor("#000");
    doc.text(`Created by: Manager Malsha Munasinghe`, 105, 28, { align: "center" });
    doc.text(`Date & Time: ${dateTimeString}`, 105, 36, { align: "center" });

    // Table with outlines
    const rows = Object.entries(savedEvent).map(([k, v]) => [
      k,
      Array.isArray(v) ? v.join(", ") : v
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["Field", "Value"]],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [29, 78, 216], textColor: 255, fontStyle: "bold" },
      styles: { cellPadding: 4, fontSize: 11 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    const namePart = savedEvent.title || "Event";
    const formattedDT = now.toISOString().replace("T", "_").substring(0, 16).replace(":", "-");
    doc.save(`SportSync.LK_${namePart}_${formattedDT}.pdf`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏆 Create New Event</h1>
      <form onSubmit={handleSubmit} style={styles.form}>

        <div style={styles.group}>
          <label>Event Name</label>
          <input type="text" name="name" value={event.name} onChange={handleChange} style={styles.input} />
          {errors.name && <small style={styles.error}>{errors.name}</small>}
        </div>

        <div style={styles.group}>
          <label>Type</label>
          <select name="type" value={event.type} onChange={handleChange} style={styles.input}>
            <option value="">-- Select Type --</option>
            <option value="Tournament">Tournament</option>
            <option value="Match">Match</option>
            <option value="Competition">Competition</option>
          </select>
          {errors.type && <small style={styles.error}>{errors.type}</small>}
        </div>

        <div style={styles.group}>
          <label>Venue</label>
          <select name="location" value={event.location} onChange={handleChange} style={styles.input}>
            <option value="">-- Select Venue --</option>
            <option value="Ground A">Ground A</option>
            <option value="Ground B">Ground B</option>
            <option value="Ground C">Ground C</option>
            <option value="Ground D">Ground D</option>
          </select>
          {errors.location && <small style={styles.error}>{errors.location}</small>}
        </div>

        <div style={styles.groupFull}>
          <label>Description</label>
          <textarea name="description" value={event.description} onChange={handleChange} rows="4" style={styles.textarea} />
          {errors.description && <small style={styles.error}>{errors.description}</small>}
        </div>

        <div style={styles.group}>
          <label>Date & Time</label>
          <input type="datetime-local" name="date" value={event.date} onChange={handleChange} style={styles.input} />
          {errors.date && <small style={styles.error}>{errors.date}</small>}
        </div>

        <div style={styles.group}>
          <label>Max Participants</label>
          <input type="number" name="maxParticipants" value={event.maxParticipants} onChange={handleChange} style={styles.input} />
          {errors.maxParticipants && <small style={styles.error}>{errors.maxParticipants}</small>}
        </div>

        <div style={styles.group}>
          <label>Judge Board (comma-separated)</label>
          <input type="text" name="judgeBoard" value={event.judgeBoard} onChange={handleChange} style={styles.input} />
          {errors.judgeBoard && <small style={styles.error}>{errors.judgeBoard}</small>}
        </div>

        <div style={styles.group}>
          <label>Registration Deadline</label>
          <input type="date" name="registrationDeadline" value={event.registrationDeadline} onChange={handleChange} style={styles.input} />
          {errors.registrationDeadline && <small style={styles.error}>{errors.registrationDeadline}</small>}
        </div>

        <div style={styles.group}>
          <label>Contact</label>
          <input type="text" name="contact" value={event.contact} onChange={handleChange} placeholder="0XXXXXXXXX" style={styles.input} />
          {errors.contact && <small style={styles.error}>{errors.contact}</small>}
        </div>

        <button type="submit" style={styles.saveBtn}>Save Event</button>
      </form>

      {savedEvent && (
        <div style={styles.preview}>
          <h2 style={{ textAlign: "center", color: "#1d4ed8", marginBottom: "20px" }}>Event Preview</h2>
          <div style={styles.previewCard}>
            {Object.entries(savedEvent).map(([k, v]) => (
              <div key={k} style={styles.previewItem}>
                <div style={styles.previewLabel}>{k}:</div>
                <div style={styles.previewValue}>{Array.isArray(v) ? v.join(", ") : v}</div>
              </div>
            ))}
            <button onClick={downloadPDF} style={styles.downloadBtn}>Download PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "800px", margin: "20px auto", padding: "20px", background: "#f9f9f9", borderRadius: "12px", fontFamily: "Segoe UI, sans-serif" },
  title: { textAlign: "center", marginBottom: "20px", color: "#22c55e" },
  form: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" },
  group: { display: "flex", flexDirection: "column" },
  groupFull: { gridColumn: "span 2", display: "flex", flexDirection: "column" },
  input: { padding: "8px", borderRadius: "6px", border: "1px solid #ccc" },
  textarea: { padding: "8px", borderRadius: "6px", border: "1px solid #ccc" },
  error: { color: "red", fontSize: "13px" },
  saveBtn: { gridColumn: "span 2", padding: "10px", background: "#22c55e", border: "none", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  preview: { marginTop: "25px", padding: "15px", borderRadius: "12px" },
  previewCard: { padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", background: "white", border: "1px solid #ddd" },
  previewItem: { display: "flex", flexDirection: "column", padding: "12px 0", borderBottom: "1px solid #eee" },
  previewLabel: { fontWeight: "bold", color: "#1d4ed8", marginBottom: "4px" },
  previewValue: { color: "#333", lineHeight: "1.5", whiteSpace: "pre-wrap" },
  downloadBtn: { marginTop: "15px", padding: "10px 16px", background: "#1d4ed8", border: "none", borderRadius: "6px", color: "white", cursor: "pointer", fontWeight: "bold" }
};

export default AddEvent;
