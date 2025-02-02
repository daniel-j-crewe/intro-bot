import { Client, Events, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`=== Logged in as ${readyClient.user.tag} ===`);
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
  // handle playing audio when a user connects
});

client.login(process.env.DISCORD_TOKEN);
