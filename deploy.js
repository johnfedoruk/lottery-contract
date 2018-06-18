const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
const config = require('./config.json');

const main = async (interface, bytecode, config) => {
    let exit_code = 0;
    console.log("Getting ready to deploy the contract");
    try {
        const provider = await getProvider(config.mnemonic, config.network);
        const web3 = new Web3(provider);
        const account = await getAccount(web3);
        const deploy_address = await deploy(web3, interface, bytecode, account, config.arguments, config.gas);
        console.log(`Successfully deployed contract to ${deploy_address}`);
    } catch(e) {
        console.error("Error!! Could not deploy the contract.");
        console.error(e);
        exit_code = 1;
    } finally {
        process.exit(exit_code);
    }
}

const getProvider = async (mnemonic, network) => {
    // create a provider
    console.log("Generating a provider instance");
    const provider = new HDWalletProvider(
        mnemonic,
        network
    );
    return provider;
}

const getAccount = async (web3) => {
    // get accounts
    console.log("Getting account");
    const accounts = await web3.eth.getAccounts();
    if (accounts.length < 1) {
        throw new Error("No accounts");
    }
    const account = accounts[0];
    return account;
}

const deploy = async (web3, interface, bytecode, account, arguments, gas) => {
    // deploy the contract to the network
    console.log(`Deploying contract with account ${account} using ${gas} gas`);
    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: `0x${bytecode}`, arguments: arguments })
        .send({ from: account, gas: `${gas}` });
    return result.options.address;
}

main(interface, bytecode, config);