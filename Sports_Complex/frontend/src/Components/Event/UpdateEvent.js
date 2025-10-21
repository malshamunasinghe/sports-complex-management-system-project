import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../utils/api";

function UpdateEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState({
    name: "",
    type: "",
    description: "",
    date: "",
    location: "",
    maxParticipants: "",
    judgeBoard: "",
    registrationDeadline: "",
    contact: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch existing event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await API.get(`/api/v1/events/${id}`);
        const e = res.data;

        setEvent({
          name: e.title || "",
          type: e.type || "",
          description: e.description || "",
          date: e.time ? e.time.slice(0, 16) : "",
          location: e.venue || "",
          maxParticipants: e.maxParticipants || "",
          judgeBoard: e.judgeBoard ? e.judgeBoard.join(", ") : "",
          registrationDeadline: e.registrationDeadline
            ? e.registrationDeadline.split("T")[0]
            : "",
          contact: e.contacts ? e.contacts[0] : "",
        });
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };
    fetchEvent();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // Validation logic (same as AddEvent)
  const onlyNumbersOrSymbols = (text) => {
    const onlyNumbers = /^[0-9]+$/.test(text);
    const onlySymbols = /^[^a-zA-Z0-9]+$/.test(text);
    return onlyNumbers || onlySymbols;
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
        else if (onlyNumbersOrSymbols(valStr))
          error = "Event name cannot be only numbers or symbols.";
        break;

      case "type":
        if (!value) error = "Type is required.";
        break;

      case "description":
        if (!valStr) error = "Description is required.";
        else if (onlyNumbersOrSymbols(valStr))
          error = "Description cannot be only numbers or symbols.";
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
        else if (onlyNumbersOrSymbols(valStr))
          error = "Judge Board cannot be only numbers or symbols.";
        break;

      case "registrationDeadline":
        if (!value) error = "Registration Deadline required.";
        else if (new Date(value) < new Date(now.setHours(0, 0, 0, 0)))
          error = "Deadline cannot be in the past.";
        break;

      case "contact":
        if (!/^0\d{9}$/.test(valStr))
          error = "Contact must be 10 digits starting with 0.";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    Object.entries(event).forEach(([key, val]) => validateField(key, val));

    if (Object.values(errors).some((err) => err)) {
      alert("Fix errors first.");
      return;
    }

    // Format for API
    const formattedEvent = {
      title: event.name,
      type: event.type,
      description: event.description,
      time: event.date,
      venue: event.location,
      maxParticipants: Number(event.maxParticipants),
      judgeBoard: event.judgeBoard.split(",").map((s) => s.trim()),
      registrationDeadline: event.registrationDeadline,
      contacts: [event.contact],
    };

    try {
      await API.put(`/api/v1/events/${id}`, formattedEvent);
      alert("✅ Event updated successfully!");
      navigate("/events");
    } catch (err) {
      console.error("Error updating:", err.message);
      alert("❌ Failed to update event: " + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>✏️ Update Event</h1>
      <form onSubmit={handleUpdate} style={styles.form}>
        {/* Event Name */}
        <div style={styles.group}>
          <label>Event Name</label>
          <input
            type="text"
            name="name"
            value={event.name}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.name && <small style={styles.error}>{errors.name}</small>}
        </div>

        {/* Type */}
        <div style={styles.group}>
          <label>Type</label>
          <select
            name="type"
            value={event.type}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">-- Select Type --</option>
            <option value="Tournament">Tournament</option>
            <option value="Match">Match</option>
            <option value="Competition">Competition</option>
          </select>
          {errors.type && <small style={styles.error}>{errors.type}</small>}
        </div>

        {/* Venue */}
        <div style={styles.group}>
          <label>Venue</label>
          <select
            name="location"
            value={event.location}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">-- Select Venue --</option>
            <option value="Ground A">Ground A</option>
            <option value="Ground B">Ground B</option>
            <option value="Ground C">Ground C</option>
            <option value="Ground D">Ground D</option>
          </select>
          {errors.location && <small style={styles.error}>{errors.location}</small>}
        </div>

        {/* Description */}
        <div style={styles.groupFull}>
          <label>Description</label>
          <textarea
            name="description"
            value={event.description}
            onChange={handleChange}
            rows="3"
            style={styles.textarea}
          />
          {errors.description && <small style={styles.error}>{errors.description}</small>}
        </div>

        {/* Date & Time */}
        <div style={styles.group}>
          <label>Date & Time</label>
          <input
            type="datetime-local"
            name="date"
            value={event.date}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.date && <small style={styles.error}>{errors.date}</small>}
        </div>

        {/* Max Participants */}
        <div style={styles.group}>
          <label>Max Participants</label>
          <input
            type="number"
            name="maxParticipants"
            value={event.maxParticipants}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.maxParticipants && <small style={styles.error}>{errors.maxParticipants}</small>}
        </div>

        {/* Judge Board */}
        <div style={styles.group}>
          <label>Judge Board</label>
          <input
            type="text"
            name="judgeBoard"
            value={event.judgeBoard}
            onChange={handleChange}
            placeholder="Judge1, Judge2"
            style={styles.input}
          />
          {errors.judgeBoard && <small style={styles.error}>{errors.judgeBoard}</small>}
        </div>

        {/* Registration Deadline */}
        <div style={styles.group}>
          <label>Registration Deadline</label>
          <input
            type="date"
            name="registrationDeadline"
            value={event.registrationDeadline}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.registrationDeadline && <small style={styles.error}>{errors.registrationDeadline}</small>}
        </div>

        {/* Contact */}
        <div style={styles.group}>
          <label>Contact</label>
          <input
            type="text"
            name="contact"
            value={event.contact}
            onChange={handleChange}
            placeholder="0XXXXXXXXX"
            style={styles.input}
          />
          {errors.contact && <small style={styles.error}>{errors.contact}</small>}
        </div>

        <button type="submit" style={styles.saveBtn}>
          Update Event
        </button>
      </form>
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
};

export default UpdateEvent;
