import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as deepl from "deepl-node";
import dotenv from "dotenv";
dotenv.config();

const authKey = process.env.DEEPL_API_KEY;
if (!authKey) {
  throw new Error("DEEPL_API_KEY is not set");
}

const translator = new deepl.Translator(authKey);

async function translateText(
  text: string,
  targetLanguage: deepl.TargetLanguageCode
) {
  const result = await translator.translateText(text, null, targetLanguage);
  return result.text;
}

const server = new McpServer({
  name: "translate",
  version: "1.0.0",
});

server.tool(
  "translate text",
  "Translate a given text to a target language",
  {
    text: z.string().describe("The text to translate"),
    targetLanguage: z
      .string()
      .describe("The target language code (e.g. fr, es, de)"),
  },
  async ({ text, targetLanguage }) => {
    const translatedText = await translateText(
      text,
      targetLanguage as deepl.TargetLanguageCode
    );
    return {
      content: [
        {
          type: "text",
          text: `Translated text in ${targetLanguage}:\n\n${translatedText}`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
