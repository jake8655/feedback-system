import '@total-typescript/ts-reset';
import { Client, GatewayIntentBits } from 'discord.js';
import { env } from './env/env';

const client = new Client({
  intents: [GatewayIntentBits.GuildMessages],
});

client.on('ready', () => {
  console.log('✅ Ready!');
});

void client.login(env.TOKEN);
