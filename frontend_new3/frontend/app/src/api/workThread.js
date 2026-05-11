const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export const STUDENT_ID = 1;

async function readApiResponse(response) {
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.error ||
      (typeof data === "string" && data) ||
      `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (data?.error) {
    throw new Error(data.details ? `${data.error}: ${data.details}` : data.error);
  }

  return data;
}

function buildMessageForm({ senderRole, senderName, recipientName, text, file, messageType }) {
  const formData = new FormData();
  formData.append("sender_role", senderRole);
  formData.append("sender_name", senderName);
  formData.append("recipient_name", recipientName ?? "");
  formData.append("text", text ?? "");
  formData.append("message_type", messageType ?? "message");

  if (file) {
    formData.append("file", file);
  }

  return formData;
}

export async function getWorkThread(studentId = STUDENT_ID) {
  return readApiResponse(await fetch(`${API_BASE}/work_thread/${studentId}`));
}

export async function getTeacherStudents() {
  return readApiResponse(await fetch(`${API_BASE}/teacher_students`));
}

export async function sendWorkMessage(studentId, payload) {
  return readApiResponse(
    await fetch(`${API_BASE}/work_thread/${studentId}/messages`, {
      method: "POST",
      body: buildMessageForm(payload),
    }),
  );
}

export async function submitStudentWork(studentId, { senderName, text, file }) {
  const formData = new FormData();
  formData.append("sender_name", senderName);
  formData.append("text", text ?? "Работа отправлена на проверку.");

  if (file) {
    formData.append("file", file);
  }

  return readApiResponse(
    await fetch(`${API_BASE}/work_thread/${studentId}/submit`, {
      method: "POST",
      body: formData,
    }),
  );
}

export async function markStudentWorkChecked(studentId) {
  return readApiResponse(
    await fetch(`${API_BASE}/work_thread/${studentId}/mark_checked`, {
      method: "POST",
    }),
  );
}

export function getAttachmentUrl(downloadUrl) {
  return downloadUrl ? `${API_BASE}${downloadUrl}` : null;
}
