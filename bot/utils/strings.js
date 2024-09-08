import bcrypt from 'bcrypt';
import { createAdapter } from 'iocane';

const adapter = createAdapter();

const saltRounds = 10;

export const hash = async (string) => {
  const hashedString = await bcrypt.hash(string, saltRounds);
  return hashedString;
};

export const compared = async (string, hashedString) => {
  const valid = await bcrypt.compare(string, hashedString);
  return valid;
};

export const encrypt = async (string, key) => {
  const encryptedString = await adapter.encrypt(string, key);
  return encryptedString;
};

export const decrypt = async (encryptedString, key) => {
  const string = await adapter.decrypt(encryptedString, key);
  return string;
};
