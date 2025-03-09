import { serve } from "bun";
import { join } from "path";
import { readdir, stat, mkdir, exists, unlink } from "fs/promises";
import chalk from "chalk";

const root = join(import.meta.dir, "drive");
const logDir = join(import.meta.dir, "logs");
const PORT = Bun.env.PORT || 5106;

if (!(await exists(root))) {
  await mkdir(root, { recursive: true });
}

if (!(await exists(logDir))) {
  await mkdir(logDir, { recursive: true });
}

const logFilePath = join(logDir, `${new Date().toISOString().replace(/:/g, "-")}.log`);
const logFile = Bun.file(logFilePath).writer();
logFile.write("Server started at " + new Date().toISOString() + "\n\n");
logFile.flush();

function log(message: string) {
  console.log(message);
  logFile.write(message + "\n");
  logFile.flush();
}

async function $(_path: string) {
  // Prevent path traversal attacks
  if (_path.includes("..")) throw new Error("Invalid path");

  return join(root, _path);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve({
  port: PORT,
  routes: {
    "/": new Response("Redirecting to github repo", {
        status: 301,
        headers: { Location: "https://github.com/theatom06/pinas" },
      }),

    "/docs": new Response("Redirecting to github repo", {
      status: 301,
      headers: { Location: "https://github.com/theatom06/pinas" },
    }),

    "/list/:id": async (req) => {
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }
      try {
        if (req.params.id == "root") {
          req.params.id = "";
        }

        log(chalk.white.bgGreen` List ` + ` ${req.params.id} from ${req.headers.get("User-Agent")}`);
        
        const files = await readdir(req.params.id ? await $(req.params.id) : root);
        return new Response(files.join("\n"), {
          headers: { "Content-Type": "text/plain", ...corsHeaders },
        });
      } catch (error) {
        //@ts-ignore
        log(chalk.red(`Error listing files: ${error.message}`));
        return new Response("Failed to list files", { status: 500, headers: corsHeaders });
      }
    },

    "/metadata/:id": async (req) => {
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }
      try {
        log(chalk.whiteBright.bgMagenta` Metadata ` + ` ${req.params.id} from ${req.headers.get("User-Agent")}`);
        const fileStats = await stat(await $(req.params.id));
        const responseString = Object.entries(fileStats).map(([key, value]) => `${key}: ${value}`).join("\n");
        return new Response(responseString, {
          headers: { "Content-Type": "text/plain", ...corsHeaders },
        });
      } catch (error) {
        //@ts-ignore
        log(chalk.red(`Error getting metadata: ${error.message}`));
        return new Response("Failed to get metadata", { status: 500, headers: corsHeaders });
      }
    },

    "/download/:id": async (req) => {
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }
      try {
        log(chalk.white.bgBlue` Download ` + ` ${req.params.id} from ${req.headers.get("User-Agent")}`);
        const fileContent = Bun.file(await $(req.params.id)).toString();
        return new Response(fileContent, { headers: corsHeaders });
      } catch (error) {
        //@ts-ignore
        log(chalk.red(`Error downloading file: ${error.message}`));
        return new Response("Failed to download file", { status: 500, headers: corsHeaders });
      }
    },

    "/delete/:id": async (req) => {
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }
      try {
        log(chalk.white.bgRed` DELETE ` + `${req.params.id} from ${req.headers.get("User-Agent")}`);
        await unlink(await $(req.params.id));
        return new Response("File deleted successfully", { headers: corsHeaders });
      } catch (error) {
        //@ts-ignore
        log(chalk.red(`Error deleting file: ${error.message}`));
        return new Response("Failed to delete file", { status: 500, headers: corsHeaders });
      }
    },

    "/upload/:id": {
      GET: async (req) => {
        if (req.method === "OPTIONS") {
          return new Response(null, { headers: corsHeaders });
        }
        return new Response("Only POST requests are allowed", {
          status: 405,
          headers: { "Content-Type": "text/plain", ...corsHeaders },
        });
      },
      POST: async (req) => {
        if (req.method === "OPTIONS") {
          return new Response(null, { headers: corsHeaders });
        }
        try {
          log(chalk.white.bgYellow` Upload ` + ` ${req.params.id} from ${req.headers.get("User-Agent")}`);
          const fileContent = await req.arrayBuffer();
          Bun.write((await $(req.params.id)), fileContent);
          return new Response("File uploaded successfully", { headers: corsHeaders });
        } catch (error) {
          //@ts-ignore
          log(chalk.red(`Error uploading file: ${error.message}`));
          return new Response("Failed to upload file", { status: 500, headers: corsHeaders });
        }
      },
    },

    "/rename/:id": {
      POST: async (req) => {
        if (req.method === "OPTIONS") {
          return new Response(null, { headers: corsHeaders });
        }
        try {
          const newName = await req.text();
          const oldName = req.params.id;
          log(chalk.white.bgYellow` Rename ` + ` ${oldName} to ${newName} from ${req.headers.get("User-Agent")}`);
          const old = Bun.file(await $(oldName))
          Bun.file(await $(newName)).write(old);
          await old.delete();
          return new Response("File renamed successfully", { headers: corsHeaders });
        } catch (error) {
          //@ts-ignore
          log(chalk.red(`Error renaming file: ${error.message}`));
          return new Response("Failed to rename file", { status: 500, headers: corsHeaders });
        }
      },
    },
    
    "/health": async (req) => {
      log(chalk.white.bgGreen` Health check ` + ` from ${req.headers.get("User-Agent")}`);
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }
      return new Response("OK", { headers: corsHeaders });
    },

    "/hash/:id": async (req) => {
      log(chalk.white.bgGreen` Hash ` + ` from ${req.headers.get("User-Agent")}`);
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }

      const fileContent = await Bun.file(await $(req.params.id)).text();

      function divide(str: string, parts: number): string {
        const len = str.length;
        const partSize = Math.ceil(len / parts);
        const result = [];
      
        for (let i = 0; i < len; i += partSize) {
          result.push(new Bun.SHA512().update(str.slice(i, i + partSize)).digest("hex"));
        }
      
        return result.join('\n');
      }

      return new Response(divide(fileContent, 10), { headers: corsHeaders });
    },


    "/time": async (req) => {
      log(chalk.white.bgGreen` Time ` + ` from ${req.headers.get("User-Agent")}`);
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }
      return new Response(new Date().toISOString(), { headers: corsHeaders });
    },

    "/echo": async (req) => {
      log(chalk.white.bgGreen` Echo ` + ` from ${req.headers.get("User-Agent")}`);
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }
      return new Response(await req.text(), { headers: corsHeaders });
    },

    "/helloworld": async (req) => {
      log(chalk.white.bgGreen` Hello World ` + ` from ${req.headers.get("User-Agent")}`);
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }
      return new Response("Hello, World!", { headers: corsHeaders });
    },

    "/log": async (req) => {
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }

      log(chalk.white.bgGray` Log ` + ` from ${req.headers.get("User-Agent")}`);
      const logContent = await Bun.file(logFilePath).text();
      return new Response(logContent, { headers: corsHeaders });
    },

    "/uuid": async (req) => {
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }

      log(chalk.white.bgGreen` UUID ` + ` from ${req.headers.get("User-Agent")}`);
      return new Response(Bun.randomUUIDv7(), { headers: corsHeaders });
    },

    '/paperplane/upload/:id': {
      POST: async (req, res) => {
          if (req.method === "OPTIONS") {
              return new Response(null, { headers: corsHeaders });
          }

          log(chalk.white.bgYellow` Paperplane ` + ` ${req.params.id} from ${req.headers.get("User-Agent")}`);

          const tarName = req.params.id;
          const folder = tarName.replace(".tar", "");

          try {
            await Bun.file(tarName).write(await req.text());
            await Bun.$`tar -xf ${tarName}`.quiet().catch(console.error)
            await Bun.$`chmod +x ${folder}/deploy.sh`.quiet().catch(console.error);
            const reponse = await Bun.$`cd ${folder} && sh ./deploy.sh`.text()
  
            return new Response(JSON.stringify({ message: "Project deployed successfully", response: reponse }), {
                headers: corsHeaders,
            });
          } catch (error) {
            console.error(error);
            return new Response(JSON.stringify({ message: "Failed to deploy project", error: JSON.stringify(error) }), {
                status: 500,
                headers: corsHeaders,
            });
          } finally {
              await Bun.$`rm ${tarName}`.quiet().catch(console.error);
          }
      }
  }
  },

  fetch(req) {
    log(chalk.white.bgGray` Fetch ` + ` ${req.url} from ${req.headers.get("User-Agent")}`);
    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
  
  error(error) {
    log(chalk.red(`Server error: ${error.message}`));
    return new Response(`Internal Server Error: ${error.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain", ...corsHeaders },
    });
  },
});

process.on('exit', () => {
  logFile.write("Server stopped at " + new Date().toISOString() + "\n\n");
  logFile.flush();
  logFile.end();
}
);

log(chalk.green(`${chalk.bold.bgCyan.black`PiNAS server`} running at http://localhost:${PORT}`));