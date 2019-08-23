'use strict';

const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const assert = sinon.assert;
const expect = require('expect.js');

const proxyquire = require('proxyquire');
const { setProcess } = require('./test-utils');

const service = require('../lib/import/service');

const fc = require('../lib/fc');
const prompt = require('../lib/init/prompt');

const { detectTplPath} = require('../lib/tpl');

const fs = require('fs-extra');
const path = require('path');

const rimraf = require('rimraf');

const mockData = require('./tpl-mock-data');

const validate = sandbox.stub();


const tpl = {

  getTpl: sandbox.stub(),
  detectTplPath: sandbox.stub().resolves({})
};

const file = {
  getEvent: sandbox.stub()
};

describe('fun-invoke test', () => {
  let restoreProcess;

  beforeEach(() => {

    sandbox.stub(service, 'getTriggerMetas').resolves({});

    sandbox.stub(prompt, 'promptForFunctionSelection').resolves({
      serviceName: 'localdemo',
      functionName: 'python3'
    });

    sandbox.stub(fc, 'invokeFunction').resolves({});

    restoreProcess = setProcess({
      ACCOUNT_ID: 'ACCOUNT_ID',
      ACCESS_KEY_ID: 'ACCESS_KEY_ID',
      ACCESS_KEY_SECRET: 'ACCESS_KEY_SECRET',
      DEFAULT_REGION: 'cn-shanghai'
    });
  });

  afterEach(() => {
    sandbox.restore();
    restoreProcess();
  });

  async function invokeFuntion(invokeName, options) {

    await proxyquire('../lib/commands/invoke.js', {
      '../fc': fc,
      '../tpl': tpl,
      '../init/prompt': prompt,
      '../utils/file': file,
      '../../lib/commands/validate': validate
    })(invokeName, options);
  }

  it('serviceName/functionName and event is empty stirng and uppercase Sync', async () => {

    await invokeFuntion('serviceName/functionName', {
      event: '',
      invocationType: 'Sync'

    });

    assert.calledWith(fc.invokeFunction, {
      serviceName: 'serviceName',
      functionName: 'functionName',
      event: '',
      invocationType: 'Sync'
    });
  });

  it('serviceName/functionName and event is eventStdin and uppercase Sync', async () => {

    file.getEvent.returns('eventStdin');

    await invokeFuntion('serviceName/functionName', {
      event: '',
      invocationType: 'Sync',
      eventStdin: 'eventStdin'
    });

    assert.calledWith(fc.invokeFunction, {
      serviceName: 'serviceName',
      functionName: 'functionName',
      event: 'eventStdin',
      invocationType: 'Sync'
    });
  });

  it('serviceName/functionName and event is empty stirng and lowercase async', async () => {

    await invokeFuntion('serviceName/functionName', {
      event: '',
      invocationType: 'async'

    });

    assert.calledWith(fc.invokeFunction, {
      serviceName: 'serviceName',
      functionName: 'functionName',
      event: '',
      invocationType: 'Async'
    });
  });


  it('serviceName/functionName and event is eventFile and uppercase Sync', async () => {

    file.getEvent.returns('eventFile');

    await invokeFuntion('serviceName/functionName', {
      event: '',
      invocationType: 'Sync',
      eventFile: './'
    });

    assert.calledWith(fc.invokeFunction, {
      serviceName: 'serviceName',
      functionName: 'functionName',
      event: 'eventFile',
      invocationType: 'Sync'
    });
  });


  it('single functionName and event is empty stirng and uppercase Sync', async () => {

    tpl.getTpl.returns(mockData.tpl);

    await invokeFuntion('python3', {
      event: '',
      invocationType: 'Sync'

    });

    assert.calledWith(fc.invokeFunction, {
      serviceName: 'localdemo',
      functionName: 'python3',
      event: '',
      invocationType: 'Sync'
    });
  });

  it('duplicated functions and event is empty stirng and uppercase Sync', async () => {

    tpl.getTpl.returns(mockData.tplWithDuplicatedFunction);

    await invokeFuntion('python3', {
      event: '',
      invocationType: 'Sync'

    });

    assert.calledWith(fc.invokeFunction, {
      serviceName: 'localdemo',
      functionName: 'python3',
      event: '',
      invocationType: 'Sync'
    });
  });
});

describe('tpl detectTplPath test', () => {

  it('yml exits', async () => {
    const ymlPath = path.join(process.cwd(), './template.yml');
    await fs.createFile(ymlPath);
    const result = await detectTplPath();
    rimraf.sync(ymlPath);
    expect(result).to.be(path.join(process.cwd(), './template.yml'));
  });

  it('yml not exits', async () => {
    const result = await detectTplPath();
    expect(result).to.be(null);
  });
});
