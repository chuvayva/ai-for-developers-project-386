import "@typespec/http";
import "@typespec/openapi";

using Http;
using OpenAPI;

@service(#{ title: "Calendar API" })
@info(#{ version: "0.0.0" })
@route("/api")
namespace CalendarApi;

model Health {
  status: "ok";
}

@route("/health")
@tag("Service")
@operationId("getHealth")
@get
op getHealth(): Health;
