import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import type { Session } from 'next-auth'

export default function useUser() {
    const [user, setUser] = useState<null | Session["user"]>(null);

    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated' && session && session.user) {
            setUser(session.user)
        }
    }, [session, status]);

    return user;
}