import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from '@/server/db/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const data = {
        receivedAt: Date.now(),
        error: null
    } as any;

    let sent = false;

    setTimeout(() => {
        if (!sent) {
            data.error = "timeout";
            res.status(500).json(data)
            sent = true
        }
        return;
    }, 10000)

    if (!sent) {
        data.error = null;
        data.doneAt = Date.now();
        res.status(200).json(data);
        sent = true;
    }
}
