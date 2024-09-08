import bot from './configs/bot.config.js';

const main = () => {
  console.log(`Start bot at ${new Date().toLocaleString()}`);

  bot.launch();
};

main();
