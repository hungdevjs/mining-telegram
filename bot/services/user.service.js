import { Wallet } from '@ethersproject/wallet';
import admin, { firestore } from '../configs/firebase.config.js';

import { hash, encrypt } from '../utils/strings.js';

export const createUser = async ({ userId, username, chatId }) => {
  try {
    const userRef = firestore.collection('users').doc(`${userId}`);

    await firestore.runTransaction(async (transaction) => {
      const user = await transaction.get(userRef);
      if (user.exists) throw new Error('User existed');

      transaction.set(userRef, {
        username,
        chatId,
        address: null,
        password: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    return { success: true };
  } catch (err) {
    console.error(err);
    console.error(
      `Error while createUser at ${new Date().toLocaleString()}, ${
        err.message
      }, userId ${userId}, username ${username}, chatId ${chatId}`
    );
    return { success: false };
  }
};

export const createUserPasswordAndWallet = async ({ userId, password }) => {
  try {
    const userRef = firestore.collection('users').doc(`${userId}`);
    const walletRef = firestore.collection('wallets').doc(`${userId}`);

    const data = await firestore.runTransaction(async (transaction) => {
      const user = await transaction.get(userRef);
      if (!user.exists) throw new Error('User doesnt exist');

      const { address } = user.data();
      if (!!address) throw new Error('Wallet created');

      const wallet = Wallet.createRandom();
      const hashedPassword = await hash(password);
      const encryptedPrivateKey = await encrypt(wallet.privateKey, password);

      transaction.update(userRef, {
        address: wallet.address.toLowerCase(),
        password: hashedPassword,
      });
      transaction.set(walletRef, {
        address: wallet.address,
        privateKey: encryptedPrivateKey,
      });

      return { address: wallet.address.toLowerCase() };
    });

    return { success: true, data };
  } catch (err) {
    console.error(err);
    console.error(
      `Error while createUserPasswordAndWallet at ${new Date().toLocaleString()}, ${
        err.message
      }, userId ${userId}`
    );
    return { success: false };
  }
};
