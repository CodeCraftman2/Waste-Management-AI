import { db } from './dbConfig';
import { Users, Reports, Rewards, CollectedWastes, Notifications, Transactions, SolanaTransactions, UserSettings } from './schema';
import { eq, sql, and, desc, ne } from 'drizzle-orm';

export async function createUser(email: string, name: string) {
  try {
    // First check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return existingUser;
    }
    
    // If user doesn't exist, create new user
    const [user] = await db.insert(Users).values({ email, name }).returning().execute();
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [user] = await db.select().from(Users).where(eq(Users.email, email)).execute();
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function createReport(
  userId: number,
  location: string,
  wasteType: string,
  description: string,
  imageUrl?: string,
  verificationStatus?: string,
  aiAnalysis?: string
) {
  try {
    console.log('Creating report with data:', {
      userId,
      location,
      wasteType,
      description,
      imageUrl: imageUrl ? 'provided' : 'not provided',
      verificationStatus,
      aiAnalysis: aiAnalysis ? 'provided' : 'not provided'
    });

    const [report] = await db
      .insert(Reports)
      .values({
        userId,
        location,
        wasteType,
        description,
        imageUrl,
        verificationStatus: verificationStatus || "pending",
        aiAnalysis: aiAnalysis ? JSON.parse(aiAnalysis) : null,
        status: "pending",
      })
      .returning()
      .execute();

    console.log('Report created successfully:', report);

    // Award points based on verification status
    let pointsEarned = 10; // Default for pending
    if (verificationStatus === 'verified') {
      pointsEarned = 15; // Bonus for AI verification
    } else if (verificationStatus === 'rejected') {
      pointsEarned = 5; // Reduced points for failed verification
    }

    console.log('Awarding points:', pointsEarned);

    await updateRewardPoints(userId, pointsEarned);

    // Create a transaction for the earned points
    const transactionDescription = verificationStatus === 'verified' 
      ? 'Points earned for AI-verified waste report'
      : verificationStatus === 'rejected'
      ? 'Points earned for waste report (verification failed)'
      : 'Points earned for reporting waste';

    await createTransaction(userId, 'earned_report', pointsEarned, transactionDescription);

    // Create a notification for the user
    await createNotification(
      userId,
      `You've earned ${pointsEarned} points for reporting waste!`,
      'reward'
    );

    console.log('Report creation completed successfully');
    return report;
  } catch (error) {
    console.error("Error creating report:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return null;
  }
}

export async function getReportsByUserId(userId: number) {
  try {
    const reports = await db.select().from(Reports).where(eq(Reports.userId, userId)).execute();
    return reports;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

export async function getOrCreateReward(userId: number) {
  try {
    let [reward] = await db.select().from(Rewards).where(eq(Rewards.userId, userId)).execute();
    if (!reward) {
      [reward] = await db.insert(Rewards).values({
        userId,
        name: 'Default Reward',
        collectionInfo: 'Default Collection Info',
        points: 0,
        level: 1,
        isAvailable: true,
      }).returning().execute();
    }
    return reward;
  } catch (error) {
    console.error("Error getting or creating reward:", error);
    return null;
  }
}

export async function updateRewardPoints(userId: number, pointsToAdd: number) {
  try {
    const [updatedReward] = await db
      .update(Rewards)
      .set({ 
        points: sql`${Rewards.points} + ${pointsToAdd}`,
        updatedAt: new Date()
      })
      .where(eq(Rewards.userId, userId))
      .returning()
      .execute();
    return updatedReward;
  } catch (error) {
    console.error("Error updating reward points:", error);
    return null;
  }
}

export async function createCollectedWaste(reportId: number, collectorId: number, notes?: string) {
  try {
    const [collectedWaste] = await db
      .insert(CollectedWastes)
      .values({
        reportId,
        collectorId,
        collectionDate: new Date(),
      })
      .returning()
      .execute();
    return collectedWaste;
  } catch (error) {
    console.error("Error creating collected waste:", error);
    return null;
  }
}

export async function getCollectedWastesByCollector(collectorId: number) {
  try {
    const collectedWastes = await db
      .select({
        id: CollectedWastes.id,
        reportId: CollectedWastes.reportId,
        collectorId: CollectedWastes.collectorId,
        collectionDate: CollectedWastes.collectionDate,
        status: CollectedWastes.status,
        // Join with Reports table to get report details
        location: Reports.location,
        wasteType: Reports.wasteType,
        description: Reports.description,
        imageUrl: Reports.imageUrl,
      })
      .from(CollectedWastes)
      .leftJoin(Reports, eq(CollectedWastes.reportId, Reports.id))
      .where(eq(CollectedWastes.collectorId, collectorId))
      .orderBy(desc(CollectedWastes.collectionDate))
      .execute();
    return collectedWastes;
  } catch (error) {
    console.error("Error fetching collected wastes:", error);
    return [];
  }
}

export async function createNotification(userId: number, message: string, type: string) {
  try {
    const [notification] = await db
      .insert(Notifications)
      .values({ userId, message, type })
      .returning()
      .execute();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function getUnreadNotifications(userId: number) {
  try {
    return await db.select().from(Notifications).where(
      and(
        eq(Notifications.userId, userId),
        eq(Notifications.isRead, false)
      )
    ).execute();
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: number) {
  try {
    await db.update(Notifications).set({ isRead: true }).where(eq(Notifications.id, notificationId)).execute();
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

export async function getPendingReports() {
  try {
    console.log('Fetching pending reports...');
    const reports = await db.select().from(Reports).where(eq(Reports.status, "pending")).execute();
    console.log('Found pending reports:', reports.length);
    return reports;
  } catch (error) {
    console.error("Error fetching pending reports:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return [];
  }
}

export async function updateReportStatus(reportId: number, status: string) {
  try {
    const [updatedReport] = await db
      .update(Reports)
      .set({ status })
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();
    return updatedReport;
  } catch (error) {
    console.error("Error updating report status:", error);
    return null;
  }
}

export async function getRecentReports(limit: number = 10) {
  try {
    const reports = await db
      .select()
      .from(Reports)
      .orderBy(desc(Reports.createdAt))
      .limit(limit)
      .execute();
    return reports;
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }
}

export async function getWasteCollectionTasks(limit: number = 20) {
  try {
    const tasks = await db
      .select({
        id: Reports.id,
        location: Reports.location,
        wasteType: Reports.wasteType,
        description: Reports.description,
        status: Reports.status,
        date: Reports.createdAt,
        collectorId: Reports.collectorId,
      })
      .from(Reports)
      .limit(limit)
      .execute();

    return tasks.map(task => ({
      ...task,
      date: task.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }));
  } catch (error) {
    console.error("Error fetching waste collection tasks:", error);
    return [];
  }
}

export async function saveReward(userId: number, amount: number) {
  try {
    const [reward] = await db
      .insert(Rewards)
      .values({
        userId,
        name: 'Waste Collection Reward',
        collectionInfo: 'Points earned from waste collection',
        points: amount,
        level: 1,
        isAvailable: true,
      })
      .returning()
      .execute();
    
    // Create a transaction for this reward
    await createTransaction(userId, 'earned_collect', amount, 'Points earned for collecting waste');

    return reward;
  } catch (error) {
    console.error("Error saving reward:", error);
    throw error;
  }
}

export async function saveCollectedWaste(reportId: number, collectorId: number, verificationResult: any) {
  try {
    const [collectedWaste] = await db
      .insert(CollectedWastes)
      .values({
        reportId,
        collectorId,
        collectionDate: new Date(),
        status: 'verified',
      })
      .returning()
      .execute();
    return collectedWaste;
  } catch (error) {
    console.error("Error saving collected waste:", error);
    throw error;
  }
}

export async function updateTaskStatus(reportId: number, newStatus: string, collectorId?: number) {
  try {
    const updateData: any = { status: newStatus };
    if (collectorId !== undefined) {
      updateData.collectorId = collectorId;
    }
    const [updatedReport] = await db
      .update(Reports)
      .set(updateData)
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();
    return updatedReport;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
}

export async function getAllRewards() {
  try {
    const rewards = await db
      .select({
        id: Rewards.id,
        userId: Rewards.userId,
        points: Rewards.points,
        level: Rewards.level,
        createdAt: Rewards.createdAt,
        userName: Users.name,
      })
      .from(Rewards)
      .leftJoin(Users, eq(Rewards.userId, Users.id))
      .orderBy(desc(Rewards.points))
      .execute();

    return rewards;
  } catch (error) {
    console.error("Error fetching all rewards:", error);
    return [];
  }
}

export async function getRewardTransactions(userId: number) {
  try {
    console.log('Fetching transactions for user ID:', userId)
    const transactions = await db
      .select({
        id: Transactions.id,
        type: Transactions.type,
        amount: Transactions.amount,
        description: Transactions.description,
        date: Transactions.date,
      })
      .from(Transactions)
      .where(eq(Transactions.userId, userId))
      .orderBy(desc(Transactions.date))
      .limit(10)
      .execute();

    console.log('Raw transactions from database:', transactions)

    const formattedTransactions = transactions.map(t => ({
      ...t,
      date: t.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }));

    console.log('Formatted transactions:', formattedTransactions)
    return formattedTransactions;
  } catch (error) {
    console.error("Error fetching reward transactions:", error);
    return [];
  }
}

export async function getAvailableRewards(userId: number) {
  try {
    console.log('Fetching available rewards for user:', userId);
    
    // Get user's total points
    const userTransactions = await getRewardTransactions(userId);
    const userPoints = userTransactions.reduce((total, transaction) => {
      return transaction.type.startsWith('earned') ? total + transaction.amount : total - transaction.amount;
    }, 0);

    console.log('User total points:', userPoints);

    // Get available rewards from the database
    const dbRewards = await db
      .select({
        id: Rewards.id,
        name: Rewards.name,
        cost: Rewards.points,
        description: Rewards.description,
        collectionInfo: Rewards.collectionInfo,
      })
      .from(Rewards)
      .where(eq(Rewards.isAvailable, true))
      .execute();

    console.log('Rewards from database:', dbRewards);

    // Combine user points and database rewards
    const allRewards = [
      {
        id: 0, // Use a special ID for user's points
        name: "Your Points",
        cost: userPoints,
        description: "Redeem your earned points",
        collectionInfo: "Points earned from reporting and collecting waste"
      },
      ...dbRewards
    ];

    console.log('All available rewards:', allRewards);
    return allRewards;
  } catch (error) {
    console.error("Error fetching available rewards:", error);
    return [];
  }
}

export async function createTransaction(userId: number, type: 'earned_report' | 'earned_collect' | 'redeemed', amount: number, description: string) {
  try {
    const [transaction] = await db
      .insert(Transactions)
      .values({ userId, type, amount, description })
      .returning()
      .execute();
    return transaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

export async function redeemReward(userId: number, rewardId: number) {
  try {
    const userReward = await getOrCreateReward(userId) as any;
    
    if (rewardId === 0) {
      // Redeem all points
      const [updatedReward] = await db.update(Rewards)
        .set({ 
          points: 0,
          updatedAt: new Date(),
        })
        .where(eq(Rewards.userId, userId))
        .returning()
        .execute();

      // Create a transaction for this redemption
      await createTransaction(userId, 'redeemed', userReward.points, `Redeemed all points: ${userReward.points}`);

      return updatedReward;
    } else {
      // Existing logic for redeeming specific rewards
      const availableReward = await db.select().from(Rewards).where(eq(Rewards.id, rewardId)).execute();

      if (!userReward || !availableReward[0] || userReward.points < availableReward[0].points) {
        throw new Error("Insufficient points or invalid reward");
      }

      const [updatedReward] = await db.update(Rewards)
        .set({ 
          points: sql`${Rewards.points} - ${availableReward[0].points}`,
          updatedAt: new Date(),
        })
        .where(eq(Rewards.userId, userId))
        .returning()
        .execute();

      // Create a transaction for this redemption
      await createTransaction(userId, 'redeemed', availableReward[0].points, `Redeemed: ${availableReward[0].name}`);

      return updatedReward;
    }
  } catch (error) {
    console.error("Error redeeming reward:", error);
    throw error;
  }
}

export async function getUserBalance(userId: number): Promise<number> {
  const transactions = await getRewardTransactions(userId);
  const balance = transactions.reduce((acc, transaction) => {
    return transaction.type.startsWith('earned') ? acc + transaction.amount : acc - transaction.amount
  }, 0);
  return Math.max(balance, 0); // Ensure balance is never negative
}

export async function getLeaderboardData() {
  try {
    // Get all users with their total points from transactions
    const users = await db
      .select({
        id: Users.id,
        name: Users.name,
        email: Users.email,
        createdAt: Users.createdAt,
      })
      .from(Users)
      .execute();

    // Calculate points for each user
    const leaderboardData = await Promise.all(
      users.map(async (user) => {
        const transactions = await getRewardTransactions(user.id);
        const totalPoints = transactions.reduce((acc, transaction) => {
          return transaction.type.startsWith('earned') ? acc + transaction.amount : acc - transaction.amount;
        }, 0);

        // Count reports and collections
        const reports = await getReportsByUserId(user.id);
        const collections = await getCollectedWastesByCollector(user.id);

        return {
          id: user.id,
          name: user.name,
          points: Math.max(totalPoints, 0),
          level: Math.floor(totalPoints / 100) + 1, // Simple level calculation
          totalReports: reports.length,
          totalCollections: collections.length,
          createdAt: user.createdAt,
        };
      })
    );

    // Sort by points descending
    return leaderboardData
      .sort((a, b) => b.points - a.points)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return [];
  }
}

// Solana Transaction Functions
export async function createSolanaTransaction(
  userId: number,
  transactionHash: string,
  type: 'reward_payout' | 'transfer_in' | 'transfer_out' | 'staking_reward',
  amount: number,
  usdValue: number,
  description: string,
  fromAddress?: string,
  toAddress?: string,
  blockNumber?: number,
  gasFee?: number
) {
  try {
    const [transaction] = await db
      .insert(SolanaTransactions)
      .values({
        userId,
        transactionHash,
        type,
        amount: amount.toString(),
        usdValue: usdValue.toString(),
        description,
        status: 'confirmed',
        fromAddress,
        toAddress,
        blockNumber,
        gasFee: gasFee ? gasFee.toString() : null,
      })
      .returning()
      .execute();
    return transaction;
  } catch (error) {
    console.error("Error creating Solana transaction:", error);
    throw error;
  }
}

export async function getSolanaTransactions(userId: number, limit: number = 10) {
  try {
    const transactions = await db
      .select({
        id: SolanaTransactions.id,
        transactionHash: SolanaTransactions.transactionHash,
        type: SolanaTransactions.type,
        amount: SolanaTransactions.amount,
        usdValue: SolanaTransactions.usdValue,
        description: SolanaTransactions.description,
        status: SolanaTransactions.status,
        fromAddress: SolanaTransactions.fromAddress,
        toAddress: SolanaTransactions.toAddress,
        blockNumber: SolanaTransactions.blockNumber,
        gasFee: SolanaTransactions.gasFee,
        createdAt: SolanaTransactions.createdAt,
      })
      .from(SolanaTransactions)
      .where(eq(SolanaTransactions.userId, userId))
      .orderBy(desc(SolanaTransactions.createdAt))
      .limit(limit)
      .execute();

    return transactions.map(t => ({
      ...t,
      amount: parseFloat(t.amount),
      usdValue: parseFloat(t.usdValue),
      gasFee: t.gasFee ? parseFloat(t.gasFee) : null,
    }));
  } catch (error) {
    console.error("Error fetching Solana transactions:", error);
    return [];
  }
}

export async function getSolanaBalance(userId: number): Promise<number> {
  try {
    const transactions = await getSolanaTransactions(userId, 1000); // Get all transactions
    const balance = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'reward_payout' || transaction.type === 'transfer_in' || transaction.type === 'staking_reward') {
        return acc + transaction.amount;
      } else if (transaction.type === 'transfer_out') {
        return acc - transaction.amount;
      }
      return acc;
    }, 0);
    return Math.max(balance, 0);
  } catch (error) {
    console.error("Error calculating Solana balance:", error);
    return 0;
  }
}

// User Settings Functions
export async function getUserSettings(userId: number) {
  try {
    let [settings] = await db.select().from(UserSettings).where(eq(UserSettings.userId, userId)).execute();
    
    if (!settings) {
      // Create default settings if none exist
      [settings] = await db.insert(UserSettings).values({
        userId,
        emailNotifications: true,
        pushNotifications: true,
        reportNotifications: true,
        collectionNotifications: false,
        leaderboardNotifications: true,
        profileVisible: true,
        showLocation: false,
        showStats: true,
        bio: 'Passionate about environmental conservation and waste management.',
        location: 'New York, NY',
      }).returning().execute();
    }
    
    return settings;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return null;
  }
}

export async function updateUserSettings(userId: number, settings: {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  reportNotifications?: boolean;
  collectionNotifications?: boolean;
  leaderboardNotifications?: boolean;
  profileVisible?: boolean;
  showLocation?: boolean;
  showStats?: boolean;
  bio?: string;
  location?: string;
}) {
  try {
    // First check if settings exist
    const existingSettings = await getUserSettings(userId);
    
    if (existingSettings) {
      // Update existing settings
      const [updatedSettings] = await db
        .update(UserSettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(UserSettings.userId, userId))
        .returning()
        .execute();
      
      return updatedSettings;
    } else {
      // Create new settings
      const [newSettings] = await db
        .insert(UserSettings)
        .values({
          userId,
          ...settings,
        })
        .returning()
        .execute();
      
      return newSettings;
    }
  } catch (error) {
    console.error("Error updating user settings:", error);
    return null;
  }
}

export async function updateUserProfile(userId: number, profile: {
  name?: string;
  email?: string;
  bio?: string;
  location?: string;
}) {
  try {
    const updates: any = {};
    
    // Update user table if name or email provided
    if (profile.name || profile.email) {
      const userUpdates: any = {};
      if (profile.name) userUpdates.name = profile.name;
      if (profile.email) userUpdates.email = profile.email;
      
      await db
        .update(Users)
        .set(userUpdates)
        .where(eq(Users.id, userId))
        .execute();
    }
    
    // Update settings table for bio and location
    if (profile.bio !== undefined || profile.location !== undefined) {
      const settingsUpdates: any = {};
      if (profile.bio !== undefined) settingsUpdates.bio = profile.bio;
      if (profile.location !== undefined) settingsUpdates.location = profile.location;
      
      await updateUserSettings(userId, settingsUpdates);
    }
    
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
}