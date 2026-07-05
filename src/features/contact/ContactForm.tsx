import { useState } from "react";
import type { FormEvent } from "react";
import { contactInfo } from "../../content/site";

type ContactFormState = {
  name: string;
  email: string;
  message: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";
type ContactResponse = {
  delivered?: boolean;
  mode?: string;
  provider?: string;
  message?: string;
};

const initialFormState: ContactFormState = {
  name: "",
  email: "",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialFormState);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");

    try {
      const response = await fetch(contactInfo.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = (await response.json()) as ContactResponse;

      if (!response.ok) {
        throw new Error("Contact request failed");
      }

      setForm(initialFormState);
      setSubmitState("success");
      setStatusMessage(
        result.delivered
          ? "Mensaje enviado correctamente."
          : result.message ?? "Mensaje recibido en modo local. Falta configurar el proveedor de email.",
      );
    } catch {
      setSubmitState("error");
      setStatusMessage("No se ha podido enviar. Revisa la configuración del endpoint de contacto.");
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
      {submitState === "success" ? <p className="form-status">{statusMessage}</p> : null}
      {submitState === "error" ? <p className="form-status form-status-error">{statusMessage}</p> : null}
    </form>
  );
}
