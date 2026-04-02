import { NextResponse } from "next/server";

function readAuthToken(request: Request) {
  const direct = request.headers.get("x-admin-key");
  if (direct) {
    return direct.trim();
  }

  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

export function assertAdmin(request: Request) {
  const expected = process.env.ADMIN_API_KEY?.trim();

  if (!expected) {
    return null;
  }

  const provided = readAuthToken(request);

  if (!provided || provided !== expected) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  return null;
}
