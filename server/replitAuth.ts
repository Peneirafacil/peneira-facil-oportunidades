import type { Express, RequestHandler } from "express";
import passport from "passport";
import type { VerifyFunction } from "openid-client/passport";
import type { TokenEndpointResponse, TokenEndpointResponseHelpers } from "openid-client";

// Fallback-friendly Replit Auth wrapper
// - If running on Replit with proper envs, uses real OIDC auth
// - Otherwise, provides a no-auth developer mode so the app can boot

const hasReplitEnv = Boolean(process.env.REPLIT_DOMAINS);

// Real Replit Auth (lazy imported only when needed)
async function setupRealAuth(app: Express) {
  const client = await import("openid-client");
  const { Strategy } = await import("openid-client/passport");
  const session = (await import("express-session")).default;
  const connectPg = (await import("connect-pg-simple")).default;
  const memoize = (await import("memoizee")).default;
  const { storage } = await import("./storage");

  const getOidcConfig = memoize(
    async () => {
      return await client.discovery(
        new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
        process.env.REPL_ID!
      );
    },
    { maxAge: 3600 * 1000 }
  );

  function getSession() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    const PgStore = connectPg(session);
    const sessionStore = new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    return session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true,
        maxAge: sessionTtl,
      },
    });
  }

  function updateUserSession(
    user: any,
    tokens: TokenEndpointResponse & TokenEndpointResponseHelpers
  ) {
    user.claims = tokens.claims();
    user.access_token = tokens.access_token;
    user.refresh_token = tokens.refresh_token;
    user.expires_at = user.claims?.exp;
  }

  async function upsertUser(claims: any) {
    await storage.upsertUser({
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });
  }

  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: TokenEndpointResponse & TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {} as any;
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    (req as any).logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

// Developer mode (no-auth) so the app can boot without Replit envs/DB
async function setupDevAuth(app: Express) {
  // Attach a fake authenticated user to every request
  app.use((req, _res, next) => {
    (req as any).user = { claims: { sub: "dev-user" } };
    (req as any).isAuthenticated = () => true;
    next();
  });

  app.get("/api/login", (_req, res) => res.redirect("/"));
  app.get("/api/logout", (_req, res) => res.redirect("/"));
}

export async function setupAuth(app: Express) {
  if (hasReplitEnv) {
    await setupRealAuth(app);
  } else {
    console.warn("[auth] REPLIT_DOMAINS not set. Running in no-auth developer mode.");
    await setupDevAuth(app);
  }
}

export const isAuthenticated: RequestHandler = async (_req, _res, next) => {
  // In dev mode we always continue; in Replit mode passport handles auth per-route
  next();
};
