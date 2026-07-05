import { useState } from "react";
import type { FormEvent } from "react";
import { contactInfo } from "../../content/site";

type ContactFormState = {
  name: string;
  email: string;
  message: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

const initialFormState: ContactFormState = {
  name: "",
  email: "",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialFormState);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");

    try {
      const response = await fetch(contactInfo.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Contact request failed");
      }

      setForm(initialFormState);
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  }

  function updateField(field: keyof ContactFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        Nombre
        <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required autoComplete="name" />
      </label>
      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          required
          autoComplete="email"
        />
      </label>
      <label>
        Mensaje
        <textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} required rows={5} />
      </label>
      <button className="form-submit" type="submit" disabled={submitState === "submitting"}>
        {submitState === "submitting" ? "Enviando..." : "Enviar mensaje"}
      </button>
      {submitState === "success" ? <p className="form-status">Mensaje enviado correctamente.</p> : null}
      {submitState === "error" ? (
        <p className="form-status form-status-error">No se ha podido enviar. Revisa la configuración del endpoint de contacto.</p>
      ) : null}
    </form>
  );
}
