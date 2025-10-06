import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

export let langfuseSpanProcessor: LangfuseSpanProcessor | null = null;
let tracerProvider: NodeTracerProvider | null = null;

export function startTracing(): void {
  if (tracerProvider) {
    return;
  }

  langfuseSpanProcessor = new LangfuseSpanProcessor({
    debug: process.env.LANGFUSE_DEBUG === "true",
  });

  tracerProvider = new NodeTracerProvider({
    spanProcessors: [langfuseSpanProcessor],
  });

  tracerProvider.register();
}

export async function shutdownTracing(): Promise<void> {
  if (langfuseSpanProcessor) {
    await langfuseSpanProcessor.forceFlush();
  }

  if (tracerProvider) {
    await tracerProvider.shutdown();
    tracerProvider = null;
    langfuseSpanProcessor = null;
  }
}
