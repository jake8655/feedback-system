import { envsafe, str } from 'envsafe';

export const env = envsafe({
  TOKEN: str(),
  CLIENT_ID: str(),
  GUILD_ID: str(),
});
