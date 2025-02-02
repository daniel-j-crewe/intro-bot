import fs from "node:fs";
import path from "node:path";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";

// Setup the discord.js client and delcare the bots intentions
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

// Create a new collection to store all the commands that will be imported from the "commands" dir
client.commands = new Collection();

const commandFolderPath = path.join(import.meta.dirname, "commands");
const commandNames = fs.readdirSync(commandFolderPath);

for (let index = 0; index < commandNames.length; index++) {
  const commandName = commandNames[index];
  const commandPath = path.join(commandFolderPath, commandName);

  const command = await import(commandPath);

  // If the command hasn't been setup correctly it shouldn't be set and a warning logged
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${commandPath} is missing a required "data" or "execute" property.`
    );
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`=== Logged in as ${readyClient.user.tag} ===`);
});

// This handles the users interactions with commands
client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const commandToExecute = interaction.client.commands.get(
    interaction.commandName
  );

  // If the command isn't one we recognise don't do anything with it
  if (!commandToExecute) {
    console.error(
      `No matching command with the name ${interaction.commandName}`
    );
  }

  return commandToExecute.execute(interaction).catch((error) => {
    console.error(error);
    const errorReply = "An error occured when trying to execute this command";

    if (interaction.replied || interaction.deferred) {
      return interaction.followUp({
        content: errorReply,
        flags: MessageFlags.Ephemeral,
      });
    }

    return interaction.reply({
      content: errorReply,
      flags: MessageFlags.Ephemeral,
    });
  });
});

// This handles the connecting to the voice channel and playing the introduction message
client.on(Events.VoiceStateUpdate, (oldState, newState) => {
  // TODO: handle playing audio when a user connects
});

client.login(process.env.DISCORD_TOKEN);
