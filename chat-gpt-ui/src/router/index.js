import { createRouter, createWebHistory } from 'vue-router';
import ChatInterface from '@/components/ChatInterface';
import LoginComponent from "@/components/LoginComponent";
import ConversationSelection from "@/components/ConversationSelection";
import { makeAuthRequest } from '../security/tokenUtils';
import store from "@/store";

const routes = [
    {
        path: '/login',
        name: 'login',
        component: LoginComponent,
    },
    {
        path: '/conversations',
        name: 'conversations',
        component: ConversationSelection,
    },
    {
        path: '/chat/:conversationId',
        name: 'ChatInterface',
        component: ChatInterface,
    },
    {
        path: '/',
        redirect: '/conversations'
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

router.beforeEach(async (to, from, next) => {
    const publicPages = ['/login'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = store.state.accessToken;
    let isExpired = true;
    if (authRequired) {
        if (loggedIn) {
            try {
                isExpired = await makeAuthRequest('get', 'http://localhost:8081/v1/validate-token')
                if(isExpired) {
                    store.commit('setAccessToken', null);
                    return next('/login');
                }
            } catch (e) {
                console.log(e)
            }
        } else {
            return next('/login');
        }
    }
    next();
});

export default router;
