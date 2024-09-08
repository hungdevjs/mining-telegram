import admin from 'firebase-admin';

import staging from '../service-accounts/staging.json' assert { type: 'json' };
import production from '../service-accounts/production.json' assert { type: 'json' };
import environments from '../utils/environments.js';

const { ENVIRONMENT } = environments;

const serviceAccounts = {
  staging,
  production,
};

const serviceAccount = serviceAccounts[ENVIRONMENT];

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;

export const firestore = admin.firestore();
