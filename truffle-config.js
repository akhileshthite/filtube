require("babel-register");
require("babel-polyfill");
require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    filecoin_wallaby: {
      provider: function () {
        return new HDWalletProvider(
          process.env.REACT_APP_MNEMONIC,
          process.env.REACT_APP_WALLABY_RPC
        );
      },
      network_id: 31415,
      gas: 6000000,
      gasPrice: 10000000000,
    },
  },
  contracts_directory: "./src/contracts/",
  contracts_build_directory: "./src/abis/",
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
