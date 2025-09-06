import fs from "fs";
import { createSigner, message, result } from "@permaweb/aoconnect";

// Read in the JWK from the file as a string
const jwkStr = fs.readFileSync(".secret/test_wallet.json", "utf8");
let jwk = JSON.parse(jwkStr);

async function message_verbose(message_args: Parameters<typeof message>[0]) {
    console.log(`Sending message to process ${message_args.process}...`);
    console.log(`  - Tags (${message_args.tags?.length ?? 0})`);
    for (let j = 0; j < (message_args.tags?.length ?? 0); j++) {
        console.log(`    - ${message_args.tags![j].name}: ${message_args.tags![j].value}`);
    }
    {
        if ((message_args.data?.length ?? 0) > 20) {
            console.log(`  - Data: ${message_args.data!.substring(0, 20)}...`)
        } else {
            console.log(`  - Data: ${message_args.data}`)
        }
    }
    let messageId = await message(message_args);
    console.log(`Sent message with ID: ${messageId}`);
    return messageId;
}

async function send_junk(processId: string) {
    await message_verbose({
        process: processId,
        tags: [{ name: "Action", value: "Junk" }],
        data: "Just some junk",
        signer: createSigner(jwk)
    });
}

async function send_eval_file(processId: string, filePath: string) {
    let fileSrc = fs.readFileSync(filePath, "utf8");
    await message_verbose({
        process: processId,
        tags: [{ name: "Action", value: "Eval" }],
        data: fileSrc,
        signer: createSigner(jwk)
    })
}

async function result_verbose(processId: string, messageId: string) {
    console.log(`Getting result for message ${messageId} on process ${processId}...`);
    let resultData = await result({
        process: processId,
        message: messageId
    });
    console.log(`Result Error: ${resultData.Error}`);
    console.log(`Result Output: ${resultData.Output}`);
    console.log(`Result Output.data: ${resultData.Output.data}`);
    console.log(`Result Output.prompt: ${resultData.Output.prompt}`);
    console.log(`Result Messages (${resultData.Messages.length}):`);
    // Print all messages by index with their tags
    for (let i = 0; i < resultData.Messages.length; i++) {
        let message = resultData.Messages[i];
        console.log(`- Message[${i}]:`);
        console.log(`  - Target ${message.Target}`);
        console.log(`  - Tags (${message.Tags.length})`);
        for (let j = 0; j < message.Tags.length; j++) {
            console.log(`    - ${message.Tags[j].name}: ${message.Tags[j].value}`);
        }
        console.log(`  - Data: ${message.Data}`);
    }
    console.log(`Result Spawns (${resultData.Spawns.length})`);
    return resultData;
}

async function message_and_result_verbose(message_args: Parameters<typeof message>[0]) {
    let messageId = await message_verbose(message_args);
    let resultData = await result_verbose(message_args.process, messageId);
    return {
        messageId: messageId,
        result_data: resultData
    };
}

async function send_action(processId: string, action: string, data: string) {
    message_and_result_verbose({
        process: processId,
        tags: [{ name: "Action", value: action }],
        data: data,
        signer: createSigner(jwk)
    })
}

async function main() {
    // get args
    const args = process.argv;

    // First arg can be `junk`, `eval`, or `action`
    if (args[2] === "junk") {
        if (args[3] === undefined) {
            console.error("Process ID is required");
            return;
        }
        send_junk(args[3]);
    } else if (args[2] === "eval") {
        if (args[3] === undefined) {
            console.error("Process ID is required");
            return;
        }
        if (args[4] === undefined) {
            console.error("File path is required");
            return;
        }
        send_eval_file(args[3], args[4]);
    } else if (args[2] === "action") {
        if (args[3] === undefined) {
            console.error("Process ID is required");
            return;
        }
        if (args[4] === undefined) {
            console.error("Action is required");
            return;
        }
        // if (args[5] === undefined) {
        //     console.error("Data is required");
        //     return;
        // }
        send_action(args[3], args[4], args[5]);
    } else {
        console.error("Invalid argument");
    }
}

main();
