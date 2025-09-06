import { connect } from "@permaweb/aoconnect";

let instance = connect({
    MODE: "legacy",
});

let { spawn, message, result } = instance;

export { spawn, message, result };
