
import axios from 'axios';
import store from "@/store";
import router  from "@/router";

export async function makeAuthRequest(method, url, data, params) {
    try {
        console.log(store.getters.getAccessToken)
        const response = await axios({
            method,
            url,
            data,
            params,
            headers: {
                Authorization: `Bearer ${store.getters.getAccessToken}`,
            },
        });

        return response;
    } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 403) {
            await router.push('/login')
        } else {
            throw error;
        }
    }
}


