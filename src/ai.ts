import { openai } from "@ai-sdk/openai";
import { generateObject, generateText, streamObject, streamText } from "ai";
import dotenv from "dotenv";
import { z } from "zod";


dotenv.config()


async function main() {
    // straight text generation
    // const result = await generateText({
    //     model: openai("gpt-4o"),
    //     prompt: "Tell me a joke.",
    // });

    // console.log(result.text);

    // streamed text generation
    // const result = await streamText({
    //     model: openai("gpt-4o"),
    //     prompt: "Tell me a joke.",
    // });

    // for await (const textPart of result.textStream) {
    //     process.stdout.write(textPart);
    // }

    // straight object generation
    // const result = await generateObject({
    //     model: openai("gpt-4o"),
    //     prompt: "Tell me a joke.",
    //     schema: z.object({
    //         setup: z.string().describe("the setup of the joke"),
    //         punchline: z.string().describe("the punchline of the joke"),
    //     }),
    // });

    // console.log(result.object);

    // streamed object generation
    // const result = await streamObject({
    //     model: openai("gpt-4o"),
    //     prompt: "Tell me a joke.",
    //     schema: z.object({
    //         setup: z.string().describe("the setup of the joke"),
    //         punchline: z.string().describe("the punchline of the joke"),
    //     }),
    // });

    // for await (const partialObject of result.partialObjectStream) {
    //     console.clear();
    //     console.log(partialObject);
    // }

    // tool use
    const location = "Marysville";
    const result = await generateText({
        model: openai("gpt-4o"),
        prompt: `You are a funny chat bot. User's location: ${location}`,
        tools: {
            weather: {
                description: "Get the weather for the user's location.",
                parameters: z.object({
                    location: z.string().describe("user's location"),
                }),
                execute: async ({ location }) => {
                    const temperature = 108;
                    return { temperature };
                },
            },
        }
    });

    if (result.toolResults && result.toolCalls) {
        const joke = await streamText({
            model: openai("gpt-4o"),
            prompt: `Tell me a joke that incorporates ${location} 
                     and it's current temperature 
                     (${result.toolResults[0].result.temperature})`,
        });
        for await (const textPart of joke.textStream) {
            process.stdout.write(textPart);
        }
    }


}

main().catch(console.error);

