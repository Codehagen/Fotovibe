import { prisma } from "@/lib/db";

interface CronLog {
  jobName: string;
  status: "SUCCESS" | "ERROR";
  message?: string;
  details?: any;
}

export async function logCronJob(log: CronLog) {
  try {
    await prisma.adminSettings.create({
      data: {
        key: `cron_log_${log.jobName}_${new Date().toISOString()}`,
        value: JSON.stringify({
          status: log.status,
          message: log.message,
          details: log.details,
          timestamp: new Date(),
        }),
      },
    });
  } catch (error) {
    console.error("Failed to log cron job:", error);
  }
}
