import express, { Request, Response, Express } from "express";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

const createServer = async (): Promise<Express> => {
  const app = next({ dev });
  await app.prepare();
  const handle = app.getRequestHandler();

  const server = express();
  server.all("*", (req: Request, res: Response) => {
    return handle(req, res);
  });

  return server;
};

const startServer = (server: Express) => {
  server.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(
      `> Ready on http://localhost:${port} - env ${process.env.NODE_ENV}`
    );
  });
};

const run = () => createServer().then(startServer);

run().catch((e: any) => {
  console.error(e);
  process.exit(1);
});
