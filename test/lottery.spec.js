const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { interface, bytecode } = require('../compile');

let web3 = new Web3(ganache.provider());
let fetchedAccounts;
let lottery;
const MAX_GAS = 500000;
const ARGS = [];

describe('Lottery', () => {
    beforeEach(async () => {
        // Get a list of all accounts
        fetchedAccounts = await web3.eth.getAccounts();
        // use an account to deploy the contract
        lottery = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({ data: `0x${bytecode}`, arguments: ARGS })
            .send({ from: fetchedAccounts[0], gas: MAX_GAS });
    });
    it('should fetch accounts', () => {
        assert.ok(fetchedAccounts);
    })
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });
});
