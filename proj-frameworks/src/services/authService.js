import api from '@/services/api';

function sanitizeUser(user) {
  if (!user) return null;

  const { password, ...safeUser } = user;
  return {
    ...safeUser,
    id: Number(safeUser.id),
  };
}

export async function loginRequest(payload) {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const password = String(payload.password ?? '');

  const { data } = await api.get('/users', {
    params: {
      email: normalizedEmail,
    },
  });

  const matchedUser = data.find(
    (user) => user.email?.toLowerCase() === normalizedEmail && String(user.password) === password,
  );

  if (!matchedUser) {
    throw new Error('E-mail ou senha inválidos.');
  }

  return sanitizeUser(matchedUser);
}

export async function registerRequest(payload) {
  const normalizedEmail = payload.email.trim().toLowerCase();

  const existing = await api.get('/users', {
    params: { email: normalizedEmail },
  });

  const emailAlreadyExists = existing.data.some((user) => user.email?.toLowerCase() === normalizedEmail);

  if (emailAlreadyExists) {
    throw new Error('Este e-mail já está cadastrado.');
  }

  const newUser = {
    name: payload.name.trim(),
    email: normalizedEmail,
    password: payload.password,
    goal: payload.goal || 'Vestibular',
  };

  const { data } = await api.post('/users', newUser);
  return sanitizeUser(data);
}
