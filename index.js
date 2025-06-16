const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

// Bot configuration
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// n8n workflow endpoint for processing
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

// Executive system configuration
const EXECUTIVE_CONFIG = {
    agents: {
        'ARIA': { name: 'Chief Executive AI', emoji: '👑', color: 0x000080 },
        'SAGE': { name: 'Chief Marketing Officer', emoji: '📈', color: 0x00ff00 },
        'LUNA': { name: 'Chief Creative Officer', emoji: '🎨', color: 0xff69b4 },
        'ECHO': { name: 'Chief Communications Officer', emoji: '📢', color: 0x00bfff },
        'APEX': { name: 'Chief Revenue Officer', emoji: '💰', color: 0xffd700 },
        'PRISM': { name: 'Chief Data Officer', emoji: '📊', color: 0x9370db },
        'VENUS': { name: 'Chief Sales Officer', emoji: '🤝', color: 0xff6347 },
        'NOVA': { name: 'Chief Innovation Officer', emoji: '🚀', color: 0x00ced1 },
        'GENESIS': { name: 'Chief Product Officer', emoji: '⚡', color: 0xff4500 }
    },
    channels: {
        'aria-commands': 'primary',
        'approvals': 'approval',
        'reports': 'analytics',
        'notifications': 'system',
        'task-updates': 'coordination',
        'alerts': 'critical'
    }
};

// Bot startup
client.once('ready', async () => {
    console.log(`🤖 ARIA Executive System Online!`);
    console.log(`📊 Logged in as ${client.user.tag}`);
    console.log(`🏢 Serving ${client.guilds.cache.size} server(s)`);
    
    // Set bot status
    client.user.setActivity('Executive Operations | /aria help', { type: 'WATCHING' });
    
    // Register slash commands
    await registerSlashCommands();
    
    console.log('✅ ARIA Executive System fully operational');
});

// Message processing
client.on('messageCreate', async message => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Check if in executive channels
    if (!EXECUTIVE_CONFIG.channels[message.channel.name]) return;
    
    try {
        // Show typing indicator
        await message.channel.sendTyping();
        
        // Enhanced message data for n8n
        const messageData = {
            content: message.content,
            author: {
                id: message.author.id,
                username: message.author.username,
                displayName: message.author.displayName || message.author.username,
                discriminator: message.author.discriminator
            },
            channel: {
                id: message.channel.id,
                name: message.channel.name,
                type: EXECUTIVE_CONFIG.channels[message.channel.name]
            },
            guild: {
                id: message.guild.id,
                name: message.guild.name
            },
            timestamp: new Date().toISOString(),
            messageId: message.id,
            // Railway bot metadata
            source: 'railway-bot',
            botVersion: '1.0.0'
        };
        
        console.log(`📨 Processing message from ${message.author.username} in #${message.channel.name}`);
        
        // Send to n8n workflow for AI processing
        const response = await axios.post(N8N_WEBHOOK_URL, messageData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000 // 30 second timeout
        });
        
        console.log(`✅ n8n processing completed`);
        
        // Handle response from n8n
        if (response.data && response.data.content) {
            await sendExecutiveResponse(message, response.data);
        }
        
    } catch (error) {
        console.error('❌ Error processing message:', error);
        await sendErrorResponse(message, error);
    }
});

// Slash command handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const { commandName } = interaction;
    
    switch (commandName) {
        case 'aria':
            await handleAriaCommand(interaction);
            break;
        case 'status':
            await handleStatusCommand(interaction);
            break;
        case 'agents':
            await handleAgentsCommand(interaction);
            break;
        default:
            await interaction.reply('❌ Unknown command');
    }
});

// Send executive response to Discord
async function sendExecutiveResponse(message, responseData) {
    try {
        // Create professional embed
        const embed = new EmbedBuilder()
            .setTitle('🤖 ARIA Executive Response')
            .setDescription(responseData.content || 'Executive analysis complete')
            .setColor(0x0066cc)
            .setTimestamp()
            .setFooter({ 
                text: 'ARIA Executive System • Powered by Railway', 
                iconURL: client.user.displayAvatarURL() 
            });
        
        // Add fields if provided by n8n
        if (responseData.embeds && responseData.embeds[0] && responseData.embeds[0].fields) {
            responseData.embeds[0].fields.forEach(field => {
                embed.addFields({ 
                    name: field.name, 
                    value: field.value, 
                    inline: field.inline || false 
                });
            });
        }
        
        await message.reply({ embeds: [embed] });
        console.log(`📤 Response sent to #${message.channel.name}`);
        
    } catch (error) {
        console.error('❌ Error sending response:', error);
        await message.reply('⚠️ Executive response generated but delivery failed. Please try again.');
    }
}

// Error response handling
async function sendErrorResponse(message, error) {
    const errorEmbed = new EmbedBuilder()
        .setTitle('⚠️ Executive System Error')
        .setDescription('ARIA is temporarily experiencing technical difficulties. Our engineering team has been notified.')
        .setColor(0xff6b6b)
        .addFields(
            { name: 'Error Type', value: error.code || 'Unknown', inline: true },
            { name: 'Status', value: 'Engineering Review', inline: true },
            { name: 'Estimated Fix', value: '< 5 minutes', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'ARIA Executive System • Error Handler' });
    
    try {
        await message.reply({ embeds: [errorEmbed] });
    } catch (replyError) {
        console.error('❌ Could not send error response:', replyError);
    }
}

// Slash command handlers
async function handleAriaCommand(interaction) {
    const subcommand = interaction.options.getString('command');
    
    const helpEmbed = new EmbedBuilder()
        .setTitle('🤖 ARIA Executive System')
        .setDescription('Your AI-powered C-suite executive team')
        .setColor(0x0066cc)
        .addFields(
            { name: '👑 Executive Team', value: 'Run `/agents` to see all 9 C-suite agents', inline: true },
            { name: '📊 System Status', value: 'Run `/status` for system health', inline: true },
            { name: '💼 Commands', value: 'Send messages in executive channels for AI analysis', inline: false },
            { name: '🏢 Channels', value: Object.keys(EXECUTIVE_CONFIG.channels).map(ch => `#${ch}`).join('\n'), inline: true }
        )
        .setTimestamp();
    
    await interaction.reply({ embeds: [helpEmbed] });
}

async function handleStatusCommand(interaction) {
    const statusEmbed = new EmbedBuilder()
        .setTitle('📊 ARIA Executive System Status')
        .setColor(0x00ff00)
        .addFields(
            { name: '🤖 Bot Status', value: '✅ Online', inline: true },
            { name: '🧠 AI Processing', value: '✅ Operational', inline: true },
            { name: '☁️ Railway Hosting', value: '✅ Stable', inline: true },
            { name: '🔗 n8n Integration', value: N8N_WEBHOOK_URL ? '✅ Connected' : '❌ Disconnected', inline: true },
            { name: '📈 Uptime', value: `${Math.floor(process.uptime() / 60)} minutes`, inline: true },
            { name: '💾 Memory Usage', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true }
        )
        .setTimestamp();
    
    await interaction.reply({ embeds: [statusEmbed] });
}

async function handleAgentsCommand(interaction) {
    const agentsEmbed = new EmbedBuilder()
        .setTitle('👥 ARIA Executive Team')
        .setDescription('Your complete C-suite AI executive team')
        .setColor(0x9932cc);
    
    Object.entries(EXECUTIVE_CONFIG.agents).forEach(([code, agent]) => {
        agentsEmbed.addFields({
            name: `${agent.emoji} ${code}`,
            value: agent.name,
            inline: true
        });
    });
    
    await interaction.reply({ embeds: [agentsEmbed] });
}

// Register slash commands
async function registerSlashCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('aria')
            .setDescription('ARIA Executive System help and information')
            .addStringOption(option =>
                option.setName('command')
                    .setDescription('Specific help topic')
                    .setRequired(false)),
        
        new SlashCommandBuilder()
            .setName('status')
            .setDescription('Check ARIA Executive System status'),
        
        new SlashCommandBuilder()
            .setName('agents')
            .setDescription('View all executive team agents')
    ].map(command => command.toJSON());
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    try {
        console.log('🔄 Registering slash commands...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('✅ Slash commands registered successfully');
    } catch (error) {
        console.error('❌ Error registering slash commands:', error);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 ARIA Executive System shutting down...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 ARIA Executive System terminated');
    client.destroy();
    process.exit(0);
});

// Start the bot
client.login(process.env.DISCORD_TOKEN);
