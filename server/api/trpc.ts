import { initTRPC, TRPCError } from "@trpc/server";
import { type Session } from "next-auth";
import { auth } from "@/server/auth";
import superjson from "superjson";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";

export const createTRPCContext = async (opts: { req: Request }) => {
  const session = await auth();
  return {
    session,
    headers: opts.req.headers,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof Error ? error.cause.message : null,
        httpStatus: getHTTPStatusCodeFromError(error),
      },
    };
  },
});

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const createTRPCRouter = t.router;
