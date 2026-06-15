import api from '@/services/api';

function resolveApiAssetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
  const normalizedBase = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}

function normalizeSummary(summary) {
  const files = Array.isArray(summary.files)
    ? summary.files.map((file) => ({
        ...file,
        url: resolveApiAssetUrl(file.url),
      }))
    : [];

  return {
    ...summary,
    files,
  };
}

export async function getSummariesByOwner(ownerId) {
  const { data } = await api.get('/summaries', {
    params: {
      ownerId: Number(ownerId),
    },
  });

  return data.map(normalizeSummary);
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
  return normalizeSummary(data);
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
