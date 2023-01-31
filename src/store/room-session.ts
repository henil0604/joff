import {
    atom
} from 'recoil';
import { setRecoil, getRecoil } from 'recoil-nexus'

const $roomSession = atom({
    key: 'roomSession',
    default: {
        authorized: false,
        anonymous: false,
        anonymousUser: null,
        chats: []
    }
});

export const getRoomSession = (key?: string) => {
    const coil = getRecoil<any>($roomSession);
    return key ? coil[key] : coil;
}

export const setRoomSession = (key: string, value: any) => {
    return setRecoil<any>($roomSession, {
        ...getRoomSession(),
        [key]: value
    });
}

export default $roomSession;