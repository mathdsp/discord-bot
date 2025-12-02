const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch").default;

// Replace with your actual Steam Web API Key
const { STEAM_API_KEY } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("steaminfo")
    .setDescription("Gets Steam profile information for a given Steam ID.")
    .addStringOption((option) =>
      option
        .setName("steamid")
        .setDescription("The 64-bit Steam ID of the user")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply(); // Defer the reply as API calls can take time

    const steamId = interaction.options.getString("steamid");
    const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`;

    try {
      const response = await fetch(steamApiUrl);
      const data = await response.json();

      if (
        !data.response ||
        !data.response.players ||
        data.response.players.length === 0
      ) {
        return interaction.editReply(
          "Could not find a Steam profile for that ID."
        );
      }

      const player = data.response.players[0];

      const steamEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`${player.personaname}'s Steam Profile`)
        .setThumbnail(player.avatarfull)
        .addFields(
          { name: "Real Name", value: player.realname || "N/A", inline: true },
          {
            name: "Status",
            value: player.personastate === 1 ? "Online" : "Offline",
            inline: true,
          },
          { name: "Profile URL", value: player.profileurl },
          {
            name: "Country",
            value: player.loccountrycode || "N/A",
            inline: true,
          },
          {
            name: "Created",
            value: new Date(player.timecreated * 1000).toLocaleDateString(),
            inline: true,
          },
          {
            name: "Última vez online",
            value: new Date(player.lastlogoff * 1000).toLocaleDateString(),
            inline: true,
          },
          {
            name: "Jogando",
            value: player.gameextrainfo || "Olhando pro teto",
            inline: true,
          }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [steamEmbed] });
    } catch (error) {
      console.error("Error fetching Steam data:", error);
      await interaction.editReply(
        "There was an error fetching Steam information. Please try again later."
      );
    }
  },
};
