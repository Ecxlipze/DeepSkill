const EMAIL_ENDPOINT = process.env.NEXT_PUBLIC_EMAIL_ENDPOINT || '/api/admission-email.php';

export const EMAIL_EVENTS = {
  REGISTRATION_RECEIVED: 'registration_received',
  ADMISSION_APPROVED: 'admission_approved',
  ADMISSION_REJECTED: 'admission_rejected',
  ADMISSION_INACTIVE: 'admission_inactive',
  RE_ENROLLMENT_REQUESTED: 're_enrollment_requested',
  RE_ENROLLMENT_APPROVED: 're_enrollment_approved',
  RE_ENROLLMENT_REJECTED: 're_enrollment_rejected',
  NOTIFICATION: 'notification'
};

export async function sendAdmissionEmail(event, payload = {}) {
  if (!payload.email) {
    return { ok: false, message: 'Missing recipient email.' };
  }

  try {
    const response = await fetch(EMAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, ...payload })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.status === 'error') {
      return {
        ok: false,
        message: result.message || `Email request failed with status ${response.status}.`
      };
    }

    return { ok: true, message: result.message || 'Email sent.' };
  } catch (error) {
    return { ok: false, message: error.message || 'Email request failed.' };
  }
}
