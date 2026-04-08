<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/login">Login</router-link> |
      <router-link to="/register">Cadastro</router-link> |
      <router-link to="/dashboard">Dashboard</router-link> |
      <router-link to="/abstracts">Resumos</router-link> |
      <router-link to="/evolution">Evolução</router-link> |
      <router-link to="/upload">Upload</router-link>
    </nav>

    <hr />

    <main>
      <router-view />
    </main>
  </div>
</template>

<style>

#app {
  font-family: sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

nav {
  padding: 10px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

nav a {
  text-decoration: none;
  color: #42b983;
  font-weight: bold;
}

nav a.router-link-active {
  color: #35495e;
  text-decoration: underline;
}

main {
  margin-top: 20px;
  padding: 20px;
  border: 1px dashed #ccc;
}
</style>