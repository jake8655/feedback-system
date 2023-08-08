import '@total-typescript/ts-reset';
import {
  Client,
  Collection,
  type CommandInteraction,
  GatewayIntentBits,
  SlashCommandBuilder,
  Events,
  REST,
  Routes,
} from 'discord.js';
import { env } from './env/env';

const commands = [
  {
    data: new SlashCommandBuilder()
      .setName('feedback')
      .setDescription('Provide feedback to the developers!'),
    async execute(interaction: CommandInteraction) {
      await interaction.reply('hehehehaa!');
    },
  },
];

type Command = (typeof commands)[number];

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
}) as Client & { commands: Collection<string, Command> };

client.commands = new Collection();

commands.forEach(command => {
  client.commands.set(command.data.name, command);
});

client.on('ready', async () => {
  console.log('✅ Ready!');

  await refreshCommands();
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

const rest = new REST().setToken(env.TOKEN);

const refreshCommands = async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    const data = (await rest.put(
      Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID),
      {
        body: commands.map(command => command.data.toJSON()),
      },
    )) as readonly unknown[];

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    console.error(error);
  }
};

void client.login(env.TOKEN);
