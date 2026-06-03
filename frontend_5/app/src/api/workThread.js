const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
const APP_TIME_ZONE = import.meta.env.VITE_APP_TIME_ZONE ?? "Asia/Novosibirsk";

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
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  if (data?.error) {
    throw new Error(data.details ? `${data.error}: ${data.details}` : data.error);
  }

  return data;
}

function roleQuery(recipientRole) {
  return recipientRole ? `?recipient_role=${encodeURIComponent(recipientRole)}` : "";
}

function buildMessageForm({
  senderRole,
  senderName,
  recipientName,
  recipientRole,
  text,
  file,
  messageType,
}) {
  const formData = new FormData();
  formData.append("sender_role", senderRole);
  formData.append("sender_name", senderName);
  formData.append("recipient_name", recipientName ?? "");
  formData.append("recipient_role", recipientRole ?? "");
  formData.append("text", text ?? "");
  formData.append("message_type", messageType ?? "message");

  if (file) {
    formData.append("file", file);
  }

  return formData;
}

export async function getWorkThread(studentId = STUDENT_ID, recipientRole = "") {
  return readApiResponse(
    await fetch(`${API_BASE}/work_thread/${studentId}${roleQuery(recipientRole)}`),
  );
}

export async function getTeacherStudents(recipientRole = "teacher") {
  return readApiResponse(
    await fetch(`${API_BASE}/teacher_students${roleQuery(recipientRole)}`),
  );
}

export async function sendWorkMessage(studentId, payload) {
  return readApiResponse(
    await fetch(`${API_BASE}/work_thread/${studentId}/messages`, {
      method: "POST",
      body: buildMessageForm(payload),
    }),
  );
}

export async function submitStudentWork(
  studentId,
  { senderName, recipientRole, text, file },
) {
  const formData = new FormData();
  formData.append("sender_name", senderName);
  formData.append("recipient_role", recipientRole ?? "teacher");
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

export async function markStudentWorkChecked(studentId, checkerRole = "teacher") {
  const formData = new FormData();
  formData.append("checker_role", checkerRole);

  return readApiResponse(
    await fetch(`${API_BASE}/work_thread/${studentId}/mark_checked`, {
      method: "POST",
      body: formData,
    }),
  );
}

export async function updateStudentWorkStatus(
  studentId,
  status,
  actorRole = "teacher",
) {
  const formData = new FormData();
  formData.append("status", status);
  formData.append("actor_role", actorRole);

  return readApiResponse(
    await fetch(`${API_BASE}/work_thread/${studentId}/status`, {
      method: "POST",
      body: formData,
    }),
  );
}

export async function updateStudentWorkGrades(
  studentId,
  { actorRole = "teacher", targetRole = actorRole, grades },
) {
  return readApiResponse(
    await fetch(`${API_BASE}/work_thread/${studentId}/grades`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        actor_role: actorRole,
        target_role: targetRole,
        grades,
      }),
    }),
  );
}

export function getAttachmentUrl(downloadUrl) {
  return downloadUrl ? `${API_BASE}${downloadUrl}` : null;
}

export function formatAppDateTime(value) {
  if (!value) return "";

  const normalized =
    typeof value === "string" && !/[zZ]|[+-]\d{2}:\d{2}$/.test(value)
      ? `${value}Z`
      : value;

  return new Date(normalized).toLocaleString("ru-RU", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
