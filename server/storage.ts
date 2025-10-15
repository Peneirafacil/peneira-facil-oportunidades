import {
  users,
  playerProfiles,
  tryouts,
  clubHistory,
  videoPortfolio,
  subscriptions,
  paymentHistory,
  tryoutRegistrations,
  tryoutComments,
  userPreferences,
  type User,
  type UpsertUser,
  type PlayerProfile,
  type InsertPlayerProfile,
  type Tryout,
  type InsertTryout,
  type ClubHistory,
  type InsertClubHistory,
  type VideoPortfolio,
  type InsertVideoPortfolio,
  type Subscription,
  type InsertSubscription,
  type TryoutRegistration,
  type InsertTryoutRegistration,
  type TryoutComment,
  type InsertTryoutComment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Player profile operations
  getPlayerProfile(userId: string): Promise<PlayerProfile | undefined>;
  createPlayerProfile(profile: InsertPlayerProfile): Promise<PlayerProfile>;
  updatePlayerProfile(userId: string, profile: Partial<InsertPlayerProfile>): Promise<PlayerProfile>;
  
  // Club history operations
  getClubHistory(profileId: number): Promise<ClubHistory[]>;
  addClubHistory(clubHistory: InsertClubHistory): Promise<ClubHistory>;
  deleteClubHistory(id: number): Promise<void>;
  
  // Video portfolio operations
  getVideoPortfolio(profileId: number): Promise<VideoPortfolio[]>;
  addVideo(video: InsertVideoPortfolio): Promise<VideoPortfolio>;
  deleteVideo(id: number): Promise<void>;
  
  // Tryout operations
  getTryouts(filters?: {
    city?: string;
    state?: string;
    modality?: string;
    ageMin?: number;
    ageMax?: number;
    date?: string;
  }): Promise<Tryout[]>;
  getTryout(id: number): Promise<Tryout | undefined>;
  createTryout(tryout: InsertTryout): Promise<Tryout>;
  updateTryout(id: number, tryout: Partial<InsertTryout>): Promise<Tryout>;
  deleteTryout(id: number): Promise<void>;
  
  // Tryout registration operations
  registerForTryout(registration: InsertTryoutRegistration): Promise<TryoutRegistration>;
  getUserRegistrations(userId: string): Promise<TryoutRegistration[]>;
  getTryoutRegistrations(tryoutId: number): Promise<TryoutRegistration[]>;
  
  // Subscription operations
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(userId: string, subscription: Partial<InsertSubscription>): Promise<Subscription>;
  
  // Comment operations
  getTryoutComments(tryoutId: number): Promise<TryoutComment[]>;
  addComment(comment: InsertTryoutComment): Promise<TryoutComment>;
  deleteComment(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Player profile operations
  async getPlayerProfile(userId: string): Promise<PlayerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(playerProfiles)
      .where(eq(playerProfiles.userId, userId));
    return profile;
  }

  async createPlayerProfile(profile: InsertPlayerProfile): Promise<PlayerProfile> {
    const [newProfile] = await db
      .insert(playerProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updatePlayerProfile(userId: string, profile: Partial<InsertPlayerProfile>): Promise<PlayerProfile> {
    const [updatedProfile] = await db
      .update(playerProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(playerProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Club history operations
  async getClubHistory(profileId: number): Promise<ClubHistory[]> {
    return await db
      .select()
      .from(clubHistory)
      .where(eq(clubHistory.profileId, profileId))
      .orderBy(desc(clubHistory.startYear));
  }

  async addClubHistory(clubHistoryData: InsertClubHistory): Promise<ClubHistory> {
    const [newClubHistory] = await db
      .insert(clubHistory)
      .values(clubHistoryData)
      .returning();
    return newClubHistory;
  }

  async deleteClubHistory(id: number): Promise<void> {
    await db.delete(clubHistory).where(eq(clubHistory.id, id));
  }

  // Video portfolio operations
  async getVideoPortfolio(profileId: number): Promise<VideoPortfolio[]> {
    return await db
      .select()
      .from(videoPortfolio)
      .where(eq(videoPortfolio.profileId, profileId))
      .orderBy(desc(videoPortfolio.createdAt));
  }

  async addVideo(video: InsertVideoPortfolio): Promise<VideoPortfolio> {
    const [newVideo] = await db
      .insert(videoPortfolio)
      .values(video)
      .returning();
    return newVideo;
  }

  async deleteVideo(id: number): Promise<void> {
    await db.delete(videoPortfolio).where(eq(videoPortfolio.id, id));
  }

  // Tryout operations
  async getTryouts(filters?: {
    city?: string;
    state?: string;
    modality?: string;
    ageMin?: number;
    ageMax?: number;
    date?: string;
  }): Promise<Tryout[]> {
    const conditions = [eq(tryouts.status, "active")];

    if (filters) {
      if (filters.city) {
        conditions.push(ilike(tryouts.city, `%${filters.city}%`));
      }
      
      if (filters.state) {
        conditions.push(eq(tryouts.state, filters.state));
      }
      
      if (filters.modality) {
        conditions.push(eq(tryouts.modality, filters.modality));
      }
      
      if (filters.ageMin) {
        conditions.push(gte(tryouts.ageMaximum, filters.ageMin));
      }
      
      if (filters.ageMax) {
        conditions.push(lte(tryouts.ageMinimum, filters.ageMax));
      }
      
      if (filters.date) {
        const filterDate = new Date(filters.date);
        const nextDay = new Date(filterDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const dateCondition = and(
          gte(tryouts.date, filterDate),
          lte(tryouts.date, nextDay)
        );
        if (dateCondition) {
          conditions.push(dateCondition);
        }
      }
    }

    return await db
      .select()
      .from(tryouts)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(tryouts.createdAt));
  }

  async getTryout(id: number): Promise<Tryout | undefined> {
    const [tryout] = await db
      .select()
      .from(tryouts)
      .where(eq(tryouts.id, id));
    return tryout;
  }

  async createTryout(tryout: InsertTryout): Promise<Tryout> {
    const [newTryout] = await db
      .insert(tryouts)
      .values(tryout)
      .returning();
    return newTryout;
  }

  async updateTryout(id: number, tryout: Partial<InsertTryout>): Promise<Tryout> {
    const [updatedTryout] = await db
      .update(tryouts)
      .set({ ...tryout, updatedAt: new Date() })
      .where(eq(tryouts.id, id))
      .returning();
    return updatedTryout;
  }

  async deleteTryout(id: number): Promise<void> {
    await db.delete(tryouts).where(eq(tryouts.id, id));
  }

  // Tryout registration operations
  async registerForTryout(registration: InsertTryoutRegistration): Promise<TryoutRegistration> {
    const [newRegistration] = await db
      .insert(tryoutRegistrations)
      .values(registration)
      .returning();
    return newRegistration;
  }

  async getUserRegistrations(userId: string): Promise<TryoutRegistration[]> {
    return await db
      .select()
      .from(tryoutRegistrations)
      .where(eq(tryoutRegistrations.userId, userId))
      .orderBy(desc(tryoutRegistrations.registeredAt));
  }

  async getTryoutRegistrations(tryoutId: number): Promise<TryoutRegistration[]> {
    return await db
      .select()
      .from(tryoutRegistrations)
      .where(eq(tryoutRegistrations.tryoutId, tryoutId));
  }

  // Subscription operations
  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  }

  async updateSubscription(userId: string, subscription: Partial<InsertSubscription>): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({ ...subscription, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return updatedSubscription;
  }

  // Comment operations
  async getTryoutComments(tryoutId: number): Promise<TryoutComment[]> {
    return await db
      .select()
      .from(tryoutComments)
      .where(eq(tryoutComments.tryoutId, tryoutId))
      .orderBy(desc(tryoutComments.createdAt));
  }

  async addComment(comment: InsertTryoutComment): Promise<TryoutComment> {
    const [newComment] = await db
      .insert(tryoutComments)
      .values(comment)
      .returning();
    return newComment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(tryoutComments).where(eq(tryoutComments.id, id));
  }
}

export const storage = new DatabaseStorage();
