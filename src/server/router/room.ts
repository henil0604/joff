import { createRouter } from "./context";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import passwordHash from 'password-hash';
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse, NextPageContext } from "next";
import { RoomVisibility } from '@prisma/client';
import pusher from '@/utils/pusher-server';
import console from "console";

interface CreateInput {
  name: undefined | null | string
  visibility: undefined | null | RoomVisibility
  password: null | undefined | string
}

export const roomRouter = createRouter()
  .query("create", {
    input: z
      .object({
        name: z.string(),
        visibility: z.string(),
        password: z.string().min(4).nullish()
      })
      .nullish(),
    async resolve(data) {

      const { input, ctx } = data;

      console.log(input)

      if (!input) {
        return {
          success: false,
          error: true,
          message: 'Data not found in the request!'
        }
      }

      if (input.visibility === 'PRIVATE' && !input.password) {
        return {
          success: false,
          error: true,
          message: 'Private Rooms must include Password!'
        }
      }

      const session = await getServerSession(ctx.req as NextApiRequest, ctx.res as NextApiResponse, nextAuthOptions);


      if (!session || !session.user) {
        return {
          success: false,
          error: true,
          message: "Unauthorized"
        }
      }

      const user = session.user;

      const roomWithName = await prisma.room.findFirst({
        where: {
          roomName: input.name
        }
      })

      if (roomWithName) {
        return {
          success: false,
          error: true,
          message: `Room "${input.name}" already exists`
        }
      }

      const hashedPassword = input.visibility === 'PRIVATE' && typeof input.password === 'string' ? passwordHash.generate(input.password) : null;

      // const roomVisibility = input.visibility === 'PUBLIC' ? RoomVisibility.PUBLIC : input.visibility === 'UNLISTED' ? RoomVisibility.UNLISTED : RoomVisibility.PRIVATE;


      const room = await prisma.room.create({
        data: {
          roomName: input.name,
          roomVisibility: input.visibility as RoomVisibility,
          roomPassword: input.visibility === 'PRIVATE' ? hashedPassword : undefined,
          roomOwner: {
            connect: {
              id: user.id
            }
          }
        }
      })

      return {
        success: true,
        error: false,
        message: "Room Created",
        data: {
          roomName: room.roomName,
          roomId: room.id
        }
      }

    },
  })
  .query("get", {
    input: z
      .object({
        name: z.string().nullish(),
        id: z.string().nullish()
      }).nullish(),

    async resolve({ input }) {

      if (!input) {
        return {
          success: false,
          error: true,
          found: false,
          message: "No Data Found!"
        }
      }

      const room = await prisma.room.findFirst({
        where: {
          OR: [
            { id: input.id || undefined },
            { roomName: input.name || undefined }
          ]
        }
      })

      if (!room) {
        return {
          success: false,
          error: true,
          message: "No Room Found!",
          found: false,
          data: null
        }
      }

      return {
        success: true,
        error: false,
        message: "Room Found!",
        found: true,
        data: room
      }

    }
  })
  .query('chat.send', {
    input: z.object({
      roomId: z.string(),
      userId: z.string(),
      message: z.string(),
      sentAt: z.number(),
    }).nullish(),

    async resolve({ input }) {

      if (!input) {
        return {
          success: false,
          error: true,
          message: "Not Enough Data"
        }
      }
      let chat;

      try {
        chat = await prisma.chat.create({
          data: {
            message: input.message,
            chatOwner: {
              connect: {
                id: input.userId,
              }
            },
            room: {
              connect: {
                id: input.roomId,
              }
            },
            createdAt: new Date(input.sentAt)
          }
        })
      } catch (e) {
        console.error(e);
        return {
          success: false,
          error: true,
          message: 'Failed to send message, Please Try Again Later'
        }
      }

      console.log(chat);

      try {
        const room = await prisma.room.findFirst({
          where: {
            id: input.roomId
          }
        })

        if (room) {

          pusher.trigger(`r-${room.roomName}`, `sent`, {
            chatId: chat.id,
          })

          console.log(`r-${room.roomName} event for ${chat.id} triggered`)

        }

      } catch (e) {
        console.warn(e)

        pusher.trigger(`global-r`, `refetch-chat`, null)

      }

      return {
        success: true,
        error: false,
        message: "Message Sent",
        data: {
          chatId: chat.id
        }
      }
    }
  })
  .query('chat.get', {
    input: z.object({
      chatId: z.string(),
    }).nullish(),

    async resolve({ input }) {

      if (!input) {
        return {
          success: false,
          error: true,
          message: "Not Enough Data"
        }
      }
      let chat;

      try {
        chat = await prisma.chat.findFirst({
          where: {
            id: input.chatId
          },
          select: {
            message: true,
            chatOwner: true,
            createdAt: true,
            id: true,
          }
        })
      } catch (e) {
        console.error(e);
        return {
          success: false,
          error: true,
          message: 'Failed to send message, Please Try Again Later'
        }
      }

      return {
        success: true,
        error: false,
        message: "Chat Found",
        data: chat
      }

    }
  })