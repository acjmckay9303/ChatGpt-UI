import { createStore } from 'vuex';
import axios from 'axios';

const store = createStore({
    state: {
        accessToken: localStorage.getItem('accessToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
    },
    getters: {
        isLoggedIn: state => !!state.accessToken,
        getAccessToken: state => state.accessToken,
        getRefreshToken: state => state.refreshToken,
    },
    actions: {
        async logout({ commit }) {
            // Here you can perform any actions necessary to log out the user,
            // such as invalidating the token on the backend or clearing any user data.
            // Since we're using JWT, there's no need to contact the backend.
            commit('setAccessToken', null);
            localStorage.removeItem('accessToken');
            commit('setRefreshToken', null);
            localStorage.removeItem('refreshToken');
        },
    },
    mutations: {
        setAccessToken: (state, accessToken) => state.accessToken = accessToken,
        setRefreshToken: (state, refreshToken) => state.refreshToken = refreshToken,
    },
});

// Add a request interceptor to automatically include the access token in all requests
axios.interceptors.request.use(config => {
    if (store.state.accessToken && config.url !== 'http://localhost:8081/v1/login') {
        config.headers['Authorization'] = `Bearer ${store.state.accessToken}`;
    }
    return config;
}, error => Promise.reject(error));

export default store;
