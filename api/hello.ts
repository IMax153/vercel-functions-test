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
	HttpApiGroup.make("group").add(
		HttpApiEndpoint.get("get", "/api/hello").addSuccess(Schema.String),
	),
);

const groupLive = HttpApiBuilder.group(Api, "group", (handlers) =>
	handlers.handle("get", () => Effect.succeed("Hello, world!")),
);

const MyApiLive = HttpApiBuilder.api(Api).pipe(Layer.provide(groupLive));

const ScalarLayer = HttpApiScalar.layer().pipe(Layer.provide(MyApiLive));

const MainLayer = Layer.mergeAll(
	MyApiLive,
	ScalarLayer,
	HttpServer.layerContext,
);

// Convert the API to a web handler
const { dispose, handler } = HttpApiBuilder.toWebHandler(MainLayer);

process.on("SIGTERM", () => {
	dispose();
});

export default {
	fetch: (request) => {
		console.log(request);
		return handler(request);
	},
};
