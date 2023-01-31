import Pusher from 'pusher-js';

const pusher = new Pusher('0510c9bc49b44bfec2c1', {
    cluster: 'ap2'
});

export default pusher;