"use server";

interface SendMessageProps {
  name: string;
  email: string;
  message: string;
}

export async function sendDiscordMessage({
  name,
  email,
  message,
}: SendMessageProps) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("Discord webhook URL is not configured");
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [
          {
            title: "Ny kundeservice henvendelse",
            color: 0x00ff00,
            fields: [
              {
                name: "Navn",
                value: name,
                inline: true,
              },
              {
                name: "Email",
                value: email,
                inline: true,
              },
              {
                name: "Melding",
                value: message,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message to Discord");
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending message to Discord:", error);
    throw new Error("Failed to send message");
  }
}
