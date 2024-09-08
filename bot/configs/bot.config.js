import { Telegraf, Scenes, session } from 'telegraf';

import {
  createUser,
  createUserPasswordAndWallet,
} from '../services/user.service.js';
import environments from '../utils/environments.js';

const { TELEGRAM_BOT_TOKEN } = environments;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// send message to an user that interacted with bot
// bot.telegram.sendMessage(ctx.update.message.chat.id, '123123123');

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

export const SceneIds = {
  CreateUserWizardScene: 'CreateUserWizardScene',
};

export const createUserWizard = new Scenes.WizardScene(
  SceneIds.CreateUserWizardScene,
  async (ctx) => {
    const message = await ctx.reply(
      'Welcome to Potato Treasure!\nPlease wait, your account is being created...'
    );

    const chatId = ctx.update.message.chat.id;
    const user = ctx.update.message.from;
    const { id: userId, username } = user;
    const { success } = await createUser({ userId, username, chatId });
    if (success) {
      await bot.telegram.editMessageText(
        chatId,
        message.message_id,
        undefined,
        'Welcome to Potato Treasure!\nYour account is created.'
      );
      ctx.reply(
        'Please create your password to start playing game.\nYour password must have at least 8 characters and includes at least 1 uppercase, 1 lowercase and 1 number and 1 special character (@$!%*?&).\nYour password will automatically disapear after being sent.'
      );
      return ctx.wizard.next();
    } else {
      ctx.reply('You have already joined the game');
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    console.log(ctx.message);
    const chatId = ctx.message.chat.id;
    const messageId = ctx.message.message_id;
    await bot.telegram.deleteMessage(chatId, messageId);

    const password = ctx.message.text;
    if (!password.match(passwordRegex)) {
      ctx.reply(
        'Invalid password.\nYour password must have at least 8 characters and includes at least 1 uppercase, 1 lowercase and 1 number and 1 special character (@$!%*?&).\nPlease retry.'
      );
      return;
    }

    const message = await ctx.reply(
      'Please wait, your in-game wallet is being created...'
    );

    const user = ctx.update.message.from;
    const { id: userId } = user;
    const { success, data } = await createUserPasswordAndWallet({
      userId,
      password,
    });
    if (success) {
      await bot.telegram.deleteMessage(chatId, message.message_id);
      await ctx.reply(
        `Set password successfully.\nThis is your in-game wallet.\nPlease deposit some fund in this wallet to start buying assets.`
      );
      await ctx.reply(data.address);
      await ctx.reply('View guide at /how-to-play');
    } else {
      ctx.reply('Something is wrong. Please try again later.');
    }

    return ctx.scene.leave();
  }
);

bot.use(session());
const stage = new Scenes.Stage([createUserWizard]);
bot.use(stage.middleware());
bot.use(Telegraf.log());

bot.help((ctx) => ctx.reply('Send me a sticker'));

bot.start(async (ctx) => {
  ctx.scene.enter(SceneIds.CreateUserWizardScene);
});

bot.command('help', (ctx) => {});

bot.command('how-to-play', (ctx) => {});

bot.command('roll', async (ctx) => {
  const res1 = await ctx.replyWithDice();
  const res2 = await ctx.replyWithDice();
  const result = res1.dice.value + res2.dice.value;
  await delay(3000);
  ctx.reply(`Result: ${result}. send hello to us /hello`);
});

bot.command('buy-mining-machine', (ctx) => {});

bot.command('buy-scanning-machine', (ctx) => {});

bot.command('buy-energy', (ctx) => {});

bot.command('withdraw', (ctx) => {});

bot.command('assets', (ctx) => {});

bot.command('wallet', (ctx) => {});

bot.command('balances', (ctx) => {});

bot.command('mine', (ctx) => {});

bot.command('scan', (ctx) => {});

bot.command('move-to-latest-city', (ctx) => {});

bot.command('city-list', (ctx) => {});

export default bot;
