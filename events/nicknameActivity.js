const { Events } = require("discord.js");
const { STEAM_API_KEY } = require("../config.json");
const fetch = require("node-fetch").default;
const { idNavio } = require("../config.json");
const { gameAppid } = require("../config.json");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    const generateNickname = async () => {
      const steamApiUrl = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=76561198813854287&format=json&include_played_free_games=1`;

      // const gameAppid = 2429640;
      try {
        const response = await fetch(steamApiUrl);
        const data = await response.json();

        if (
          !data.response ||
          !data.response.games ||
          data.response.games.length === 0
        ) {
          console.log("API Error");
        }

        let filteredGames;

        if (data.response && data.response.games) {
          filteredGames = data.response.games.filter(
            (game) => gameAppid == game.appid
          );
        }
        const horasJogadas = Math.round(filteredGames[0].playtime_forever / 60);

        const nickName = `${horasJogadas} HORAS DE THRONE AND LIBERTY`;

        for (const [guildId, guild] of client.guilds.cache) {
          try {
            if (guildId == idNavio) {
              await guild.members.me.setNickname(nickName);
            }
          } catch (error) {
            console.error(
              `Falha ao atualizar on nick na guilda ${guild.name}:`,
              error.message
            );
          }
        }
      } catch (error) {
        console.error("Error fetching Steam data:", error);
      }
      const now = new Date();
    };
    await generateNickname();

    const intervalTime = 36000000;
    setInterval(generateNickname, intervalTime);
  },
};
