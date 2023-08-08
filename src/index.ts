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
  EmbedBuilder,
  Colors,
  type TextChannel,
} from 'discord.js';
import { env } from './env/env';

const scriptNames = ['ws_voucher', 'ws_shoprobbery', 'ws_moneywash'] as const;

const commands = [
  {
    data: new SlashCommandBuilder()
      .setName('feedback')
      .setDescription('Provide feedback to the developers!')
      .addStringOption(option =>
        option
          .setName('script')
          .setDescription(
            'The name of the script you are providing feedback for',
          )
          .addChoices(
            ...scriptNames.map(script_name => ({
              name: script_name,
              value: script_name,
            })),
          )
          .setRequired(true),
      )
      .addStringOption(option =>
        option
          .setName('feedback')
          .setDescription('Your feedback')
          .setRequired(true),
      )
      .addIntegerOption(option =>
        option
          .setName('rating')
          .setDescription('Your rating for the script')
          .addChoices(
            ...Array.from({ length: 5 }, (_, i) => i + 1).map(i => ({
              name: i.toString(),
              value: i,
            })),
          )
          .setRequired(true),
      ),
    async execute(interaction: CommandInteraction) {
      await (client.channels.cache.get(env.CHANNEL_ID) as TextChannel).send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${interaction.user.username} - Feedback`)
            .setDescription(
              `**Script Name**: ${
                interaction.options.get('script')?.value as string
              }\n**Feedback**: ${
                interaction.options.get('feedback')?.value as string
              }\n**Rating**: \`${
                interaction.options.get('rating')?.value as number
              }⭐️ / 5⭐️\``,
            )
            .setTimestamp()
            .setThumbnail(env.GUILD_ICON)
            .setColor(Colors.Blue),
        ],
      });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Feedback System')
            .setDescription('Feedback successfully sent!')
            .setFooter({
              text: 'Thank you for your feedback!',
              iconURL: env.GUILD_ICON,
            })
            .setColor(Colors.Green),
        ],
        ephemeral: true,
      });
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
