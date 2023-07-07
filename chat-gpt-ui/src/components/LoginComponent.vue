<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit="login">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="username" id="username" v-model="username" class="form-control" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" class="form-control" required />
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import store from "@/store";
import router from "@/router";

export default {
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async login(event) {
      event.preventDefault();
      try {
        const response = await axios.post('http://localhost:8081/v1/login', {
          login: this.username,
          password: this.password,
        });
        const accessToken = response.data;
        console.log(accessToken); // before storing the tokens
        store.commit('setAccessToken', accessToken);
        // reset fields
        this.username = '';
        this.password = '';
        // navigate to conversations
        await router.push('/conversations');
      } catch (error) {
        console.error(error);
        this.username = '';
        this.password = '';
        await router.push('/login');
      }
    },
  },
};
</script>

<!-- CSS omitted for brevity -->


<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 1em;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1em;
}

label {
  font-weight: bold;
}

.btn {
  display: block;
  width: 100%;
}
</style>
