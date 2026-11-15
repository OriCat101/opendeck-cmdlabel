import { exec, spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";

const args = process.argv.slice(2);
const arg = (name) => args[args.indexOf(name) + 1];

const visible = new Map();
const ws = new WebSocket(`ws://localhost:${arg("-port")}`);
const send = (payload) => ws.send(JSON.stringify(payload));

function run(context, command, done) {
  if (!command) return;
  exec(command, { timeout: 5000 }, (error, stdout) => {
    if (!visible.has(context) || ws.readyState !== WebSocket.OPEN) return;
    done(error, stdout.trim());
  });
}

function refresh(context) {
  const { command, image } = visible.get(context) ?? {};
  run(context, command, (error, title) => {
    send({
      event: "setTitle",
      context,
      payload: { title: error ? "!" : title, target: 0 },
    });
  });
  run(context, image, async (error, path) => {
    if (error) return;
    try {
      const data = await readFile(path);
      const type = extname(path) === ".svg" ? "image/svg+xml" : "image/png";
      send({
        event: "setImage",
        context,
        payload: {
          image: `data:${type};base64,${data.toString("base64")}`,
          target: 0,
        },
      });
    } catch {}
  });
}

ws.addEventListener("open", () => {
  send({ event: arg("-registerEvent"), uuid: arg("-pluginUUID") });
});

ws.addEventListener("message", ({ data }) => {
  const { event, context, payload } = JSON.parse(data);
  switch (event) {
    case "willAppear":
    case "didReceiveSettings":
      visible.set(context, payload?.settings ?? {});
      refresh(context);
      break;
    case "willDisappear":
      visible.delete(context);
      break;
    case "keyDown": {
      const press = payload?.settings?.press;
      if (press) {
        spawn("sh", ["-c", press], { detached: true, stdio: "ignore" }).unref();
      }
      break;
    }
  }
});

ws.addEventListener("close", () => process.exit(0));
ws.addEventListener("error", () => process.exit(1));

setInterval(() => {
  for (const context of visible.keys()) refresh(context);
}, 60_000);
