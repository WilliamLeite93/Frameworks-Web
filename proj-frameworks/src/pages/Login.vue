<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent>
      <input type="text" placeholder="Usuário" />
      <input type="password" placeholder="Senha" />
      <button>Entrar</button>
    </form>
  </div>
</template>