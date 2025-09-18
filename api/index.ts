import {
	HttpApi,
	HttpApiBuilder,
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiScalar,
	HttpServer,
} from "@effect/platform";
import { Effect, Layer, Schema } from "effect";

const Api = HttpApi.make("myApi").add(
	HttpApiGroup.make("group")
		.add(HttpApiEndpoint.get("get", "/").addSuccess(Schema.String))
		.prefix("/api"),
);

const GroupLayer = HttpApiBuilder.group(Api, "group", (handlers) =>
	handlers.handle("get", () => Effect.succeed("Hello, world!")),
);

const ApiLayer = HttpApiBuilder.api(Api).pipe(Layer.provide(GroupLayer));

const ScalarLayer = HttpApiScalar.layer().pipe(Layer.provide(ApiLayer));

const MainLayer = Layer.mergeAll(
	ApiLayer,
	ScalarLayer,
	HttpServer.layerContext,
);

// Convert the API to a web handler
const { dispose, handler } = HttpApiBuilder.toWebHandler(MainLayer);

process.on("SIGTERM", () => {
	dispose();
});

export default {
	fetch: handler,
};
