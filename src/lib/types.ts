export type Consultation = {
  name: string;
  personaId: string;
  ownership: string;
  industry: string;
  services: string[];
  budget: string;
  challenge: string;
  goals: string;
};

export type LeadPayload = Consultation & {
  phone: string;
  email: string;
  preferredChannel: "whatsapp" | "call" | "email";
  intent: "whatsapp" | "schedule" | "proposal" | "meeting";
  summary: string;
  leadSource: string;
  submittedAt: string;
};

export const emptyConsultation: Consultation = {
  name: "",
  personaId: "",
  ownership: "",
  industry: "",
  services: [],
  budget: "",
  challenge: "",
  goals: "",
};
