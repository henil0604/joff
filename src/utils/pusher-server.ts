import Pusher from "pusher";
import { env } from '@/env/server.mjs';

const pusher = new Pusher({
    appId: env.PUSHER_APPID,
    key: env.PUSHER_KEY,
    secret: env.PUSHER_SECRET,
    cluster: env.PUSHER_CLUSTER,
    useTLS: true
});

export default pusher;