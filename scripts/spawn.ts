import fs from "fs";
import { createSigner } from "@permaweb/aoconnect";
import { spawn } from "./legacy";

// Read in the JWK from the file as a string
const jwk_str = fs.readFileSync(".secret/test_wallet.json", "utf8");
let jwk = JSON.parse(jwk_str);

// Example module IDs and scheduler IDs can be found by spawning a process with AOS
const moduleId = "ISShJH1ij-hPPt9St5UFFr_8Ys3Kj5cyg7zrMGt7H9s";
const schedulerId = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";

async function create() {
    console.log(`Test jwk: ${jwk_str}`);

    // In node, `createSigner` take a JWK (JSON Web Key)
    let signer = createSigner(jwk);

    // `spawn` takes a `signer` object as an argument
    let processId = await spawn({
        module: moduleId,
        scheduler: schedulerId,
        signer: signer
    })

    console.log(`Process created with ID: ${processId}`);
}

create();
