import { gemini, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("lazydev-test-2");
      return sandbox.sandboxId;
    });
    const codeAgent = createAgent({
      name: "code-agent",
      system:
        "You are an expert Next.js developer. You write readable, maintanable code. You write simeple Next.js & React snippets.",
      model: gemini({ model: "gemini-2.0-flash-lite" }),
    });

    const { output } = await codeAgent.run(
      `Write the following snippet: ${event.data.value}`,
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      return sandbox.getHost(3000);
    });

    return { output, sandboxUrl };
  },
);
