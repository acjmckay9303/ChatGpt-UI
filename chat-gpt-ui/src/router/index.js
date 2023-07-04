import { createRouter, createWebHistory } from 'vue-router';
import ChatComponent from '@/components/ChatComponent';

const routes = [
    {
        path: '/chat',
        name: 'Chat',
        component: ChatComponent,
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
