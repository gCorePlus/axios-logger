[![npm version](http://img.shields.io/npm/v/@gcoreplus/axios-logger.svg?style=flat)](https://npmjs.org/package/@gCorePlus/shortid "View this project on npm")
[![Codecov Coverage](https://codecov.io/gh/gCorePlus/axios-logger/branch/master/graph/badge.svg)](https://codecov.io/gh/gCorePlus/shortid)
[![ISC license](http://img.shields.io/badge/license-ISC-brightgreen.svg)](http://opensource.org/licenses/ISC)

# Axios Logger

## About

`@gcoreplus/axios-logger` creates **random** or **sequential** with **seed** short url-friendly unique ids.

Perfect for url shorteners, MongoDB and Redis ids, and any other id users might see.

Inspired by the [axios-logger](https://www.npmjs.com/package/axios-logger)  

## 👨🏻‍💻Installation

Install the main lib
    
```shell script
npm install --save @gcoreplus/axios-logger
```

### Usage

```js
import shortid from '@gcoreplus/shortid';
shortid.setCharacters('ABC');

let seed;
do {
  seed = shortid.generate(seed);
  console.log(seed); // A, B, C, AA, AB, AC, BA, BB, BC, CA, CB, CC, AAA
} while (seed !== 'AAA')
```

### Example

Example generating sequential ID from 0 to AAA
```bash
~/projects/shortid> node -r ts-node/register examples/example-01.ts
0
1
2
....
AAA
```

Example generating sequential ID from A to AAA using custom alphabet

```bash
~/projects/shortid> node -r ts-node/register examples/example-02.ts
A
B
C
AA
AB
AC
BA
BB
BC
CA
CB
CC
AAA
```

## Backers

<a href="https://github.com/rennanboni">
<img src="https://avatars0.githubusercontent.com/u/9962013?v=4" class="avatar" alt="Rennan Stefan Boni" width="50" />
</a>

## License

Distributed under the ISC License. See `LICENSE` for more information.

## Acknowledgements

- [axios-logger](https://www.npmjs.com/package/axios-logger)

Copyright &copy; 2020 gCorePlus Inc.
