import { envsafe, str } from 'envsafe';

export const env = envsafe({
  TOKEN: str(),
});
