import emailHandler from "@/lib/email/handler";
import scheduledHandler from "@/lib/scheduled/handler";

// 定义handler类型
interface OpenNextHandler {
  fetch: (request: Request, env: CloudflareEnv, ctx: ExecutionContext) => Promise<Response>;
}

// 仅在OpenNext构建过程中导入handler，避免Next.js构建错误
let handler: OpenNextHandler | undefined;

if (process.env.NODE_ENV === "production") {
  // 动态导入，避免Next.js构建错误
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const workerModule = require("../.open-next/worker.js");
  handler = workerModule.default as OpenNextHandler;
}

export default {
  fetch: (request: Request, env: CloudflareEnv, ctx: ExecutionContext) => {
    // 如果handler不存在（在Next.js构建时），返回500错误
    if (!handler) {
      return new Response("Handler not available during build", { status: 500 });
    }
    // 使用类型断言解决Request类型不匹配问题
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return handler.fetch(request as any, env, ctx);
  },

  email: emailHandler,

  scheduled: scheduledHandler,
} satisfies ExportedHandler<CloudflareEnv>;

// 动态导出，避免Next.js构建错误
export const DOQueueHandler = null;
export const DOShardedTagCache = null;
