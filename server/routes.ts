import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTryoutSchema, insertPlayerProfileSchema, insertClubHistorySchema, insertVideoPortfolioSchema, insertTryoutRegistrationSchema, insertTryoutCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // In dev/no-DB mode, return null so the app shows the Landing page
      if (!process.env.DATABASE_URL) {
        return res.json(null);
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Player profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getPlayerProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertPlayerProfileSchema.parse({ ...req.body, userId });
      const profile = await storage.createPlayerProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      const profile = await storage.updatePlayerProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Club history routes
  app.get('/api/profile/:profileId/clubs', async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      const clubHistory = await storage.getClubHistory(profileId);
      res.json(clubHistory);
    } catch (error) {
      console.error("Error fetching club history:", error);
      res.status(500).json({ message: "Failed to fetch club history" });
    }
  });

  app.post('/api/profile/:profileId/clubs', isAuthenticated, async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      const clubData = insertClubHistorySchema.parse({ ...req.body, profileId });
      const club = await storage.addClubHistory(clubData);
      res.json(club);
    } catch (error) {
      console.error("Error adding club history:", error);
      res.status(500).json({ message: "Failed to add club history" });
    }
  });

  app.delete('/api/clubs/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteClubHistory(id);
      res.json({ message: "Club history deleted successfully" });
    } catch (error) {
      console.error("Error deleting club history:", error);
      res.status(500).json({ message: "Failed to delete club history" });
    }
  });

  // Video portfolio routes
  app.get('/api/profile/:profileId/videos', async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      const videos = await storage.getVideoPortfolio(profileId);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.post('/api/profile/:profileId/videos', isAuthenticated, async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      const videoData = insertVideoPortfolioSchema.parse({ ...req.body, profileId });
      const video = await storage.addVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error("Error adding video:", error);
      res.status(500).json({ message: "Failed to add video" });
    }
  });

  app.delete('/api/videos/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVideo(id);
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Tryout routes
  app.get('/api/tryouts', async (req, res) => {
    try {
      // In environments without a configured database, return an empty list
      if (!process.env.DATABASE_URL) {
        return res.json([]);
      }
      const filters = {
        city: req.query.city as string,
        state: req.query.state as string,
        modality: req.query.modality as string,
        ageMin: req.query.ageMin ? parseInt(req.query.ageMin as string) : undefined,
        ageMax: req.query.ageMax ? parseInt(req.query.ageMax as string) : undefined,
        date: req.query.date as string,
      };
      // Remove undefined values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined)
      );
      const tryouts = await storage.getTryouts(cleanFilters);
      res.json(tryouts);
    } catch (error) {
      console.error("Error fetching tryouts:", error);
      res.status(500).json({ message: "Failed to fetch tryouts" });
    }
  });

  app.get('/api/tryouts/:id', async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.status(404).json({ message: "Tryout not found" });
      }
      const id = parseInt(req.params.id);
      const tryout = await storage.getTryout(id);
      if (!tryout) {
        return res.status(404).json({ message: "Tryout not found" });
      }
      res.json(tryout);
    } catch (error) {
      console.error("Error fetching tryout:", error);
      res.status(500).json({ message: "Failed to fetch tryout" });
    }
  });

  app.post('/api/tryouts', isAuthenticated, async (req: any, res) => {
    try {
      const organizerId = req.user.claims.sub;
      const tryoutData = insertTryoutSchema.parse({ ...req.body, organizerId });
      const tryout = await storage.createTryout(tryoutData);
      res.json(tryout);
    } catch (error) {
      console.error("Error creating tryout:", error);
      res.status(500).json({ message: "Failed to create tryout" });
    }
  });

  // Tryout registration routes
  app.post('/api/tryouts/:id/register', isAuthenticated, async (req: any, res) => {
    try {
      const tryoutId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const registrationData = insertTryoutRegistrationSchema.parse({ tryoutId, userId });
      const registration = await storage.registerForTryout(registrationData);
      res.json(registration);
    } catch (error) {
      console.error("Error registering for tryout:", error);
      res.status(500).json({ message: "Failed to register for tryout" });
    }
  });

  app.get('/api/user/registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const registrations = await storage.getUserRegistrations(userId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // Subscription routes
  app.get('/api/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Comment routes
  app.get('/api/tryouts/:id/comments', async (req, res) => {
    try {
      const tryoutId = parseInt(req.params.id);
      const comments = await storage.getTryoutComments(tryoutId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/tryouts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const tryoutId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const commentData = insertTryoutCommentSchema.parse({ ...req.body, tryoutId, userId });
      const comment = await storage.addComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
