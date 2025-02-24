import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const appRouter = createTRPCRouter({
  // Public procedure
  hello: publicProcedure
    .input(z.object({ text: z.string() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? 'world'}`,
      };
    }),
  
  // Protected procedure example
  getSecretMessage: protectedProcedure
    .query(() => {
      return {
        message: "This is a secret message!",
      };
    }),
    
  // Protected mutation example
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2),
      bio: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Here you would typically update the user's profile in your database
      return {
        status: 'success',
        message: `Profile updated for user ${ctx.session.user.id}`,
        data: input,
      };
    }),
});

export type AppRouter = typeof appRouter;
