import api from '@/services/api';

function sanitizeUser(user) {
  if (!user) return null;

  const { password, passwordHash, ...safeUser } = user;
  return {
    ...safeUser,
    id: Number(safeUser.id),
  };
}

export async function loginRequest(payload) {
  const { data } = await api.post('/auth/login', {
    email: payload.email.trim().toLowerCase(),
    password: String(payload.password ?? ''),
  });

  return {
    user: sanitizeUser(data.user),
    token: data.token,
  };
}

export async function registerRequest(payload) {
  const { data } = await api.post('/users', {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    goal: payload.goal || 'Vestibular',
  });

  return {
    user: sanitizeUser(data.user),
    token: data.token,
  };
}

export async function forgotPasswordRequest(payload) {
  const { data } = await api.post('/auth/forgot-password', {
    email: payload.email.trim().toLowerCase(),
  });

  return data;
}

export async function resetPasswordRequest(payload) {
  const { data } = await api.post('/auth/reset-password', {
    token: payload.token.trim(),
    password: String(payload.password ?? ''),
  });

  return data;
}
