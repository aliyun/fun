#!/usr/bin/env node

'use strict';

const handle = function (err) {
  console.error(err.stack);
  process.exit(-1);
};

const program = require('commander');

program.version(require('../package.json').version, '-v, --version')
  .description('The fun tool use template.yml to describe the API Gateway & Function Compute things, then publish it online.');

program.command('config')
  .description('Configure the fun')
  .action(()=> {
    require('../lib/commands/config')().catch(handle);
  });

program.command('validate')
  .description('Validate a fun template')
  .option('-t, --template [template]', 'path of fun template file. defaults to \'template.{yaml|yml}\'', 'template.{yaml|yml}')
  .action((options)=>{
    require('../lib/commands/validate')(options.template).catch(handle);
  });

program.command('deploy')
  .description('Deploy a project to AliCloud')
  .option('-k, --accessKeyId [access key id]', '')
  .option('-s, --accessKeySecret [access key id]', '')
  .option('-i, --accountId [account id]', '')
  .option('-r, --defaultRegion [region]', '')
  .option('-t, --timeout [timeout]', '')
  .action((stage, options)=> {
    if (typeof stage === 'object') {
      options = stage;
      stage = undefined;
    }
    require('../lib/commands/deploy')(stage, options).catch(handle);
  });

program.command('build')
  .description('Build the dependencies')
  .action(()=>{
    require('../lib/commands/build')().catch(handle);
  });

program.parse(process.argv);

if (!program.args.length) {program.help();}
