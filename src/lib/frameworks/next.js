'use strict';

const nextjs = {
  'id': 'Nextjs',
  'runtime': 'nodejs',
  'website': 'https://nextjs.org',
  'detectors': {
    'and': [
      {
        'type': 'regex',
        'path': 'package.json',
        'content': '"(dev)?(d|D)ependencies":\\s*{[^}]*"next":\\s*".+?"[^}]*}'
      }
    ]
  },
  'actions': [
    {
      'condition': true,
      'description': 'use npx next to start server',
      'processors': [
        {
          'type': 'generateFile',
          'path': 'bootstrap',
          'mode': '0755',
          'content': `#!/usr/bin/env bash
export PORT=9000
npx next start --port $PORT
`
        }
      ]
    }
  ]
};

module.exports = nextjs;