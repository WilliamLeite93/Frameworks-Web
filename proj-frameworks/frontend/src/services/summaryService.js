import api from '@/services/api';

export async function getSummariesByOwner(ownerId) {
  const { data } = await api.get('/summaries', {
    params: {
      ownerId: Number(ownerId),
    },
  });

  return data;
}

export async function createSummary(payload) {
  const body = {
    ownerId: Number(payload.ownerId),
    title: payload.title,
    subject: payload.subject,
    description: payload.description,
    status: 'Novo',
    createdAt: new Date().toISOString(),
    fileNames: payload.fileNames || [],
  };

  const { data } = await api.post('/summaries', body);
  return data;
}

export async function uploadSummaryFiles(summaryId, files) {
  if (!files?.length) return [];

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file.raw);
  });

  const { data } = await api.post(`/summaries/${summaryId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}
