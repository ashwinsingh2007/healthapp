export const exampleTranscript = `Doctor: What brings you in today?\nPatient: I've been having a lot of fatigue lately and my blood pressure feels high when I'm moving fast.\nDoctor: Any dizziness or swelling?\nPatient: Yes, especially in my ankles when I'm standing.\nDoctor: Do you have any known allergies?\nPatient: Yes, dairy gives me hives.\nDoctor: Are you on any medication?\nPatient: I take Zyrtec sometimes, and some BP meds but I don't recall the name.`;

export const exampleOutputObj = {
  "Chief Complaint": {
    "soapNote": "Fatigue and high blood pressure on exertion.",
    "transcriptionMapping": "I've been having a lot of fatigue lately and my blood pressure feels high when I'm moving fast."
  },
  "History of Present Illness": {
    "soapNote": "Dizziness and ankle swelling on standing.",
    "transcriptionMapping": "Yes, especially in my ankles when I'm standing."
  },
  "Past Medical History": {
    "soapNote": "N/A",
    "transcriptionMapping": "N/A"
  },
  "Family History": {
    "soapNote": "N/A",
    "transcriptionMapping": "N/A"
  },
  "Social History": {
    "soapNote": "N/A",
    "transcriptionMapping": "N/A"
  },
  "Allergies": {
    "soapNote": "Dairy allergy with hives.",
    "transcriptionMapping": "Yes, dairy gives me hives."
  },
  "Medications": {
    "soapNote": "Zyrtec and unnamed BP medication.",
    "transcriptionMapping": "I take Zyrtec sometimes, and some BP meds but I don't recall the name."
  },
  "Review of Systems": {
    "soapNote": "Negative except fatigue, dizziness, and swelling.",
    "transcriptionMapping": "I've been having a lot of fatigue lately... especially in my ankles when I'm standing."
  },
  "Vitals": {
    "soapNote": "N/A",
    "transcriptionMapping": "N/A"
  },
  "General Appearance": {
    "soapNote": "N/A",
    "transcriptionMapping": "N/A"
  },
  "Physical Exam": {
    "soapNote": "N/A",
    "transcriptionMapping": "N/A"
  },
  "Additional Observations": {
    "soapNote": "N/A",
    "transcriptionMapping": "N/A"
  },
  "Summary of findings": {
    "soapNote": "Fatigue and BP elevation on exertion with dizziness and hives — consistent with hypertension.",
    "transcriptionMapping": "Fatigue, BP feels high, dizziness, ankles swell, and hives from dairy."
  },
  "Differential diagnosis": {
    "soapNote": "Hypertension, allergy-induced symptoms.",
    "transcriptionMapping": "BP meds, hives, dizziness suggest hypertension and allergy."
  },
  "Primary diagnosis": {
    "soapNote": "Hypertension.",
    "transcriptionMapping": "blood pressure feels high when I'm moving fast."
  }
};

export const exampleOutput = JSON.stringify(exampleOutputObj, null, 2);

export function createSoapNotePrompt(transcript: string): string {
  return `You are a medical assistant.

You will receive a transcript of a conversation between a doctor and a patient.

Your task is to return a STRICT JSON object, exactly in this format:

{
  "Chief Complaint": {
    "soapNote": "string",
    "transcriptionMapping": "string"
  },
  ...
}

- Do NOT return markdown or explanation.
- If you do not have an answer for a field, return "N/A" for both soapNote and transcriptionMapping.
- If the conversation is NOT meaningful or lacks medical context, return all fields with:
  {
    "soapNote": "N/A",
    "transcriptionMapping": "N/A"
  }

Here is a sample transcript:
${exampleTranscript}

Here is the correct JSON output for that sample:
${exampleOutput}

Now here is the transcript to analyze:
"${transcript}"
`;
} 