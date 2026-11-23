import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config";

export interface AuthUser {
  id: number;
  email: string;
  roles: string[];
}

export interface AuthRequest extends Request {
  auth?: AuthUser;
}

export function signAccessToken(user: AuthUser) {
  return jwt.sign(user, config.JWT_SECRET, {
    expiresIn: "2h",
    issuer: "nexusgamer-api",
    audience: "nexusgamer-web",
  });
}

export function authenticate(request: AuthRequest, response: Response, next: NextFunction) {
  const authorization = request.header("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({ error: "AUTH_REQUIRED", message: "Inicia sesión para continuar." });
    return;
  }

  try {
    request.auth = jwt.verify(authorization.slice(7), config.JWT_SECRET, {
      issuer: "nexusgamer-api",
      audience: "nexusgamer-web",
    }) as AuthUser;
    next();
  } catch {
    response.status(401).json({ error: "INVALID_SESSION", message: "La sesión expiró o no es válida." });
  }
}

export function authorize(...allowedRoles: string[]) {
  return (request: AuthRequest, response: Response, next: NextFunction) => {
    if (!request.auth || !request.auth.roles.some((role) => allowedRoles.includes(role))) {
      response.status(403).json({ error: "FORBIDDEN", message: "No tienes permisos para esta operación." });
      return;
    }
    next();
  };
}
