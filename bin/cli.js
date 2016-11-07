'use strict';

const commander = require('commander');
const fs = require('fs-extra');
const Q = require('q');
const path = require('path');
const commandsPath = path.resolve(__dirname + '/commands');
const readdir = Q.denodeify(fs.readdir);

readdir(commandsPath).then(items => {
  items.forEach(item => {
    const filePath = path.resolve(item);

    if (fs.statSync(filePath).isFile()) {
      const parsed = path.parse(filePath);
      const commandName = parsed.name;
      const command = commander.command(commandName);

      try {
        require('./commands/' + commandName).createCommand(command);
      } catch (err) {
        console.error('Failed to create command from %s', item);
      }
    } else {
      console.log('%s is not a file and can not be used to create a command', item);
    }
  });
  commander.parse(process.argv);
});
