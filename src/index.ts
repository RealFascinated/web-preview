import Elysia, { t } from "elysia";
import { Controller, decorators, Get } from "elysia-decorators";
import { getScreenshot } from "./common/preview";
import { handleError } from "./common/utils";

const app = new Elysia();

const DEFAULTS = {
  width: 1920,
  height: 1080,
  idletime: 500,
};

@Controller("/")
class AppController {
  @Get("/", {
    config: {
      // @ts-ignore
      query: t.Object({
        url: t.String(),
        width: t.Optional(t.Number()),
        height: t.Optional(t.Number()),
        idletime: t.Optional(t.Number()),
      }),
    },
  })
  async index({
    query: { url, width = DEFAULTS.width, height = DEFAULTS.height, idletime = DEFAULTS.idletime },
  }: {
    query: { url: string; width?: number; height?: number; idletime?: number };
  }) {
    return new Response(await getScreenshot(url, width, height, idletime), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  @Get("/health")
  async health() {
    return new Response("OK", {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}

handleError(app);
app.use(
  decorators({
    controllers: [AppController],
  })
);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
