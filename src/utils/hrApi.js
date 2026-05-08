import { supabase } from '../supabaseClient';
import { getTeacherByCnic } from './teacherUtils';
import { buildJdDraft } from './hrJdBuilder';
import { uploadHrAsset, uploadHrBlob } from './hrStorage';

const nowIso = () => new Date().toISOString();

const safeSingle = async (query) => {
  const { data, error } = await query.single();
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data || null;
};

const normalizeHrBundle = ({ profile, teacher, documents, jd, signature, files }) => ({
  teacher,
  profile,
  documents: documents || [],
  jd: jd || null,
  signature: signature || null,
  files: files || []
});

export const fetchTeacherHRApplication = async (cnic) => {
  const teacher = await getTeacherByCnic(cnic);
  if (!teacher) {
    throw new Error('Teacher profile not found for this account.');
  }

  let profile = await safeSingle(
    supabase
      .from('hr_profiles')
      .select('*')
      .eq('teacher_id', teacher.id)
  );

  if (!profile) {
    const payload = {
      teacher_id: teacher.id,
      full_name: teacher.name,
      cnic: teacher.cnic,
      personal_email: teacher.email || '',
      specialization: teacher.specialization || '',
      current_step: 1,
      hr_status: 'pending',
      created_at: nowIso(),
      updated_at: nowIso()
    };

    const { data, error } = await supabase.from('hr_profiles').insert([payload]).select().single();
    if (error) {
      throw error;
    }
    profile = data;
  }

  const [documentsResponse, jd, signature, filesResponse] = await Promise.all([
    supabase.from('hr_documents').select('*').eq('hr_profile_id', profile.id).order('uploaded_at', { ascending: true }),
    safeSingle(supabase.from('hr_jds').select('*').eq('hr_profile_id', profile.id)),
    safeSingle(supabase.from('hr_signatures').select('*').eq('hr_profile_id', profile.id)),
    supabase.from('hr_files').select('*').eq('hr_profile_id', profile.id).order('generated_at', { ascending: false })
  ]);

  if (documentsResponse.error) {
    throw documentsResponse.error;
  }
  if (filesResponse.error) {
    throw filesResponse.error;
  }

  return normalizeHrBundle({
    teacher,
    profile,
    documents: documentsResponse.data || [],
    jd,
    signature,
    files: filesResponse.data || []
  });
};

export const saveHRProfile = async (profile) => {
  const payload = {
    ...profile,
    updated_at: nowIso()
  };
  const { data, error } = await supabase
    .from('hr_profiles')
    .upsert(payload, { onConflict: 'teacher_id' })
    .select()
    .single();

  if (error) {
    throw error;
  }

  if ((data.current_step || 1) < 2) {
    await supabase
      .from('hr_profiles')
      .update({ current_step: 2, updated_at: nowIso() })
      .eq('id', data.id);
    return { ...data, current_step: 2 };
  }
  return data;
};

export const uploadHRDocument = async ({
  file,
  profile,
  teacherId,
  docType,
  category,
  isRequired,
  linkUrl
}) => {
  let fileMeta = {
    filePath: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    mimeType: null
  };

  if (file) {
    fileMeta = await uploadHrAsset({
      bucket: 'hr-documents',
      file,
      teacherId,
      hrProfileId: profile.id,
      docType
    });
  }

  const insertPayload = {
    hr_profile_id: profile.id,
    category,
    doc_type: docType,
    file_name: fileMeta.fileName,
    file_size: fileMeta.fileSize ? String(fileMeta.fileSize) : null,
    file_url: fileMeta.fileUrl,
    file_path: fileMeta.filePath,
    mime_type: fileMeta.mimeType,
    link_url: linkUrl || null,
    is_required: Boolean(isRequired),
    uploaded_at: nowIso()
  };

  const { data, error } = await supabase.from('hr_documents').insert([insertPayload]).select().single();
  if (error) {
    throw error;
  }
  return data;
};

export const removeHRDocument = async (id) => {
  const { error } = await supabase.from('hr_documents').delete().eq('id', id);
  if (error) {
    throw error;
  }
};

export const submitHRDocuments = async (profileId) => {
  const { error } = await supabase
    .from('hr_profiles')
    .update({
      current_step: 3,
      hr_status: 'pending',
      documents_submitted_at: nowIso(),
      updated_at: nowIso()
    })
    .eq('id', profileId);

  if (error) {
    throw error;
  }

  await fetch('/api/hr/notify-admin.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId })
  }).catch(() => null);
};

export const approveJD = async (jdId, profileId) => {
  const approvedAt = nowIso();
  const { error } = await supabase
    .from('hr_jds')
    .update({
      teacher_status: 'approved',
      approved_at: approvedAt,
      updated_at: approvedAt
    })
    .eq('id', jdId);

  if (error) {
    throw error;
  }

  const { error: profileError } = await supabase
    .from('hr_profiles')
    .update({
      current_step: 4,
      hr_status: 'jd_approved',
      updated_at: approvedAt
    })
    .eq('id', profileId);

  if (profileError) {
    throw profileError;
  }
};

export const requestJDChanges = async (jdId, message) => {
  const { error } = await supabase
    .from('hr_jds')
    .update({
      teacher_status: 'changes_requested',
      change_request: message,
      is_sent_to_teacher: false,
      updated_at: nowIso()
    })
    .eq('id', jdId);

  if (error) {
    throw error;
  }
};

export const saveSignature = async (profileId, payload) => {
  const row = {
    hr_profile_id: profileId,
    signature_type: payload.signatureType,
    signature_data: payload.signatureData,
    signed_at: nowIso()
  };

  const existing = await safeSingle(supabase.from('hr_signatures').select('*').eq('hr_profile_id', profileId));
  let response;
  if (existing) {
    response = await supabase.from('hr_signatures').update(row).eq('id', existing.id).select().single();
  } else {
    response = await supabase.from('hr_signatures').insert([row]).select().single();
  }
  if (response.error) {
    throw response.error;
  }

  const { error: profileError } = await supabase
    .from('hr_profiles')
    .update({
      current_step: 5,
      hr_status: 'signed',
      updated_at: nowIso()
    })
    .eq('id', profileId);
  if (profileError) {
    throw profileError;
  }

  return response.data;
};

export const fetchAdminHRApplications = async () => {
  const { data: profiles, error } = await supabase.from('hr_profiles').select('*').order('updated_at', { ascending: false });
  if (error) {
    throw error;
  }

  const teacherIds = profiles.map((profile) => profile.teacher_id).filter(Boolean);
  const profileIds = profiles.map((profile) => profile.id);

  const [teachersRes, docsRes, jdRes, sigRes, fileRes] = await Promise.all([
    supabase.from('teachers').select('*').in('id', teacherIds),
    supabase.from('hr_documents').select('*').in('hr_profile_id', profileIds),
    supabase.from('hr_jds').select('*').in('hr_profile_id', profileIds),
    supabase.from('hr_signatures').select('*').in('hr_profile_id', profileIds),
    supabase.from('hr_files').select('*').in('hr_profile_id', profileIds)
  ]);

  [teachersRes, docsRes, jdRes, sigRes, fileRes].forEach((result) => {
    if (result.error) {
      throw result.error;
    }
  });

  const teacherMap = Object.fromEntries((teachersRes.data || []).map((teacher) => [teacher.id, teacher]));
  const docsMap = (docsRes.data || []).reduce((accumulator, document) => {
    if (!accumulator[document.hr_profile_id]) {
      accumulator[document.hr_profile_id] = [];
    }
    accumulator[document.hr_profile_id].push(document);
    return accumulator;
  }, {});
  const jdMap = Object.fromEntries((jdRes.data || []).map((jd) => [jd.hr_profile_id, jd]));
  const signatureMap = Object.fromEntries((sigRes.data || []).map((signature) => [signature.hr_profile_id, signature]));
  const filesMap = (fileRes.data || []).reduce((accumulator, file) => {
    if (!accumulator[file.hr_profile_id]) {
      accumulator[file.hr_profile_id] = [];
    }
    accumulator[file.hr_profile_id].push(file);
    return accumulator;
  }, {});

  return profiles.map((profile) => ({
    teacher: teacherMap[profile.teacher_id] || null,
    profile,
    documents: docsMap[profile.id] || [],
    jd: jdMap[profile.id] || null,
    signature: signatureMap[profile.id] || null,
    files: filesMap[profile.id] || []
  }));
};

export const fetchJDTemplates = async () => {
  const { data, error } = await supabase
    .from('hr_jd_templates')
    .select('*')
    .eq('is_active', true)
    .order('specialization', { ascending: true });
  if (error) {
    throw error;
  }
  return data || [];
};

export const createJDDraft = (profile, template, options) => buildJdDraft(profile, template, options);

export const saveJD = async (profileId, jdPayload) => {
  const existing = await safeSingle(supabase.from('hr_jds').select('*').eq('hr_profile_id', profileId));
  const payload = {
    hr_profile_id: profileId,
    template_id: jdPayload.templateId || null,
    position_title: jdPayload.positionTitle,
    department: jdPayload.department,
    reporting_to: jdPayload.reportingTo,
    employment_type: jdPayload.employmentType,
    location: jdPayload.location,
    responsibilities: jdPayload.responsibilities,
    requirements: jdPayload.requirements,
    what_we_offer: jdPayload.whatWeOffer,
    working_hours: jdPayload.workingHours,
    compensation_text: jdPayload.compensationText,
    issue_date: jdPayload.issueDate,
    admin_edited: Boolean(jdPayload.adminEdited),
    updated_at: nowIso()
  };

  const response = existing
    ? await supabase.from('hr_jds').update(payload).eq('id', existing.id).select().single()
    : await supabase.from('hr_jds').insert([{ ...payload, generated_at: nowIso() }]).select().single();

  if (response.error) {
    throw response.error;
  }
  return response.data;
};

export const sendJD = async (profileId, jdPayload) => {
  const saved = await saveJD(profileId, { ...jdPayload, adminEdited: true });
  const { error } = await supabase
    .from('hr_jds')
    .update({
      is_sent_to_teacher: true,
      teacher_status: 'pending',
      updated_at: nowIso()
    })
    .eq('id', saved.id);
  if (error) {
    throw error;
  }

  await supabase
    .from('hr_profiles')
    .update({
      hr_status: 'jd_sent',
      updated_at: nowIso()
    })
    .eq('id', profileId);

  await fetch('/api/admin/hr/send-jd.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, jd: jdPayload })
  }).catch(() => null);

  return saved;
};

export const rejectApplication = async (profileId, reason) => {
  const payload = {
    hr_status: 'rejected',
    rejection_reason: reason,
    rejected_at: nowIso(),
    updated_at: nowIso()
  };
  const { error } = await supabase.from('hr_profiles').update(payload).eq('id', profileId);
  if (error) {
    throw error;
  }
  await fetch('/api/admin/hr/reject.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, reason })
  }).catch(() => null);
};

export const finalizeHiring = async ({
  application,
  adminNote,
  acceptanceBlob,
  hiringBlob
}) => {
  const { profile, teacher, jd } = application;

  const acceptanceUpload = await uploadHrBlob({
    bucket: 'hr-files',
    blob: acceptanceBlob,
    teacherId: teacher.id,
    hrProfileId: profile.id,
    fileType: 'acceptance-letter',
    fileName: `acceptance-letter-${profile.id}.pdf`
  });

  const hiringUpload = await uploadHrBlob({
    bucket: 'hr-files',
    blob: hiringBlob,
    teacherId: teacher.id,
    hrProfileId: profile.id,
    fileType: 'hiring-file',
    fileName: `hiring-file-${profile.id}.pdf`
  });

  const rows = [
    {
      hr_profile_id: profile.id,
      file_type: 'acceptance_letter',
      file_url: acceptanceUpload.fileUrl,
      file_path: acceptanceUpload.filePath,
      file_name: acceptanceUpload.fileName,
      file_size: acceptanceUpload.fileSize,
      admin_note: adminNote || null,
      generated_at: nowIso()
    },
    {
      hr_profile_id: profile.id,
      file_type: 'hiring_file',
      file_url: hiringUpload.fileUrl,
      file_path: hiringUpload.filePath,
      file_name: hiringUpload.fileName,
      file_size: hiringUpload.fileSize,
      admin_note: adminNote || null,
      generated_at: nowIso()
    }
  ];

  await supabase.from('hr_files').delete().eq('hr_profile_id', profile.id);
  const { error: fileError } = await supabase.from('hr_files').insert(rows);
  if (fileError) {
    throw fileError;
  }

  const { error: profileError } = await supabase
    .from('hr_profiles')
    .update({
      hr_status: 'hired',
      hired_at: nowIso(),
      current_step: 5,
      updated_at: nowIso()
    })
    .eq('id', profile.id);
  if (profileError) {
    throw profileError;
  }

  const { error: accessError } = await supabase.from('allowed_cnics').upsert([{
    cnic: teacher.cnic,
    name: teacher.name,
    role: 'teacher',
    assigned_course: teacher.specialization || jd?.position_title || 'Teacher'
  }], { onConflict: 'cnic' });
  if (accessError) {
    throw accessError;
  }

  await fetch('/api/admin/hr/finalize.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileId: profile.id,
      adminNote,
      files: rows
    })
  }).catch(() => null);
};

export const shareHiringFiles = async (profileId) => {
  const response = await fetch('/api/hr/share-files.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId })
  });

  if (!response.ok) {
    throw new Error('Failed to email hiring documents.');
  }

  return response.json();
};
