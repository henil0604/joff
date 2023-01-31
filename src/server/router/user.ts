import { createRouter } from "./context";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import passwordHash from 'password-hash';
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse, NextPageContext } from "next";
import { RoomVisibility } from '@prisma/client';
import user from "pusher-js/types/src/core/user";
import { ANONYMOUS_USER_AVATAR } from "@/data/STATIC";

function randomInRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

interface GenerateAnonymousData {
    name: string;
    email: string;
    anonymous: boolean;
    image: string;
}

export const generateAnonymousData = async (): Promise<GenerateAnonymousData> => {
    const id = randomInRange(1, 1000)
    const name = `anonymous${id}`;

    const found = await prisma.user.findFirst({
        where: {
            name: name,
        }
    })

    if (found) {
        return await generateAnonymousData();
    }

    return {
        name: name,
        email: `anonymous.${id}@whis`,
        anonymous: true,
        image: ANONYMOUS_USER_AVATAR
    }
}


export const userRouter = createRouter()
    .query("anonymous.create", {
        input: z.object({}).nullish(),
        async resolve() {
            let data: any, user: any;

            try {
                data = await generateAnonymousData();

                user = await prisma.user.create({
                    data
                })
            } catch (e) {
                console.error(e);

                return {
                    success: false,
                    error: true,
                    message: "Failed to create Anonymous User, Please Try Again Later."
                }
            }

            return {
                success: true,
                error: false,
                message: "Anonymous User Created",
                data: user,
            }
        }
    })
    .query("anonymous.delete", {
        input: z.object({
            id: z.string()
        }).nullish(),
        async resolve({ input }) {
            const id = input?.id;

            if (!id) {
                return {
                    success: false,
                    error: true,
                    message: `Not Enough Data`
                }
            }

            try {
                await prisma.user.deleteMany({
                    where: {
                        id: id,
                        anonymous: true
                    }
                })
            } catch (e) {
                console.error(e);

                return {
                    success: false,
                    error: true,
                    message: "Failed to delete Anonymous User, Please Try Again Later."
                }
            }

            return {
                success: true,
                error: false,
                message: "Anonymous User Deleted",
            }
        }
    })
