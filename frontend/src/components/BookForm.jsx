import { useState } from "react";

const initialForm = {
  name: "",
  amount: "",
  type: "income",
  date: new Date().toISOString().slice(0, 16),
  notes: ""
};

export default function BookForm({ onSubmit, submitLabel, defaultValue }) {
  const [form, setForm] = useState(
    defaultValue
      ? {
          ...defaultValue,
          amount: String(defaultValue.amount ?? ""),
          date: defaultValue.date ? defaultValue.date.slice(0, 16) : initialForm.date
        }
      : initialForm
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      ...form,
      amount: Number(form.amount),
      date: new Date(form.date).toISOString()
    });
    if (!defaultValue) {
      setForm(initialForm);
    }
  }

  return (
    <form className="grid-form" onSubmit={handleSubmit}>
      <label>
        Entry name
        <input required name="name" value={form.name} onChange={handleChange} />
      </label>
      <label>
        Amount (integer)
        <input required type="number" step="1" min="1" name="amount" value={form.amount} onChange={handleChange} />
      </label>
      <label>
        Type
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="income">Income</option>
          <option value="spending">Spending</option>
        </select>
      </label>
      <label>
        Date & time
        <input required type="datetime-local" name="date" value={form.date} onChange={handleChange} />
      </label>
      <label className="notes-field">
        Notes
        <textarea name="notes" value={form.notes} onChange={handleChange} rows="2" />
      </label>
      <button type="submit">{submitLabel}</button>
    </form>
  );
}
