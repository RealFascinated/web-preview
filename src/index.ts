import Elysia, { t } from "elysia";
import { Controller, decorators, Get } from "elysia-decorators";
import { getScreenshot } from "./common/preview";
import { handleError } from "./common/utils";
import { BadRequestError } from "./common/error";

const app = new Elysia();

const DEFAULTS = {
  width: 1920,
  height: 1080,
  idletime: 500,
};

@Controller()
class AppController {
  @Get("/health")
  health() {
    console.log("Health check endpoint hit");
    return "OK";
  }

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
    if (!url || !url.startsWith("http")) {
      throw new BadRequestError("Invalid or missing URL, example: ?url=https://example.com");
    }

    return new Response(await getScreenshot(url, width, height, idletime), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
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
