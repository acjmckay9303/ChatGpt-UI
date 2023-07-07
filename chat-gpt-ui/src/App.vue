<template>
  <div id="app">
    <button v-if="isLoggedIn" @click="logout" class="logout-button">Logout</button>
    <router-view/>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'App',
  computed: {
    ...mapState([
      'isLoggedIn'
    ])
  },
  methods: {
    ...mapActions([
      'logout'
    ])
  }
};
</script>

<style>
.logout-button {
  position: fixed;
  top: 10px;
  right: 10px;
}
</style>
