"use strict";
var builder = require("botbuilder");
var azure = require("botbuilder-azure");
var path = require('path');

require('dotenv').config();

var storageConnectionString = process.env.STORAGE_CONNECTION_STRING;
var stateTable = process.env.STATE_TABLE;

var useEmulator = (process.env.NODE_ENV == 'development');

// Connect bot
var connector = useEmulator ? new builder.ChatConnector() : new azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

// Setup bot persistency layer
var azureTableClient = new azure.AzureTableClient(stateTable, storageConnectionString);
var tableStorage = new azure.AzureBotStorage({ gzipData: false }, azureTableClient);

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));
bot.set('storage', tableStorage);

bot.dialog('/', [
    function (session) {
        session.send('Hello user');
    }
]);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('Bot up and running at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = connector.listen();
}