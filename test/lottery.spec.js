const ganache = require('ganache-cli');
const Web3 = require('web3');
const chai = require('chai');
const { interface, bytecode } = require('../compile');

const expect = chai.expect;
let web3 = new Web3(ganache.provider());
let accounts;
let lottery;
const MAX_GAS = 500000;
const ARGS = [];

describe('Lottery', () => {
    beforeEach(async () => {
        // Get a list of all accounts
        accounts = await web3.eth.getAccounts();
        // use an account to deploy the contract
        lottery = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({ data: `0x${bytecode}`, arguments: ARGS })
            .send({ from: accounts[0], gas: MAX_GAS });
    });
    it('should fetch accounts', () => {
        expect(accounts).not.to.be.undefined;
    })
    it('deploys a contract', () => {
        expect(lottery.options.address).not.to.be.undefined;
    });
    describe('enter', () => {
        it('should fail if less then 0.01 ether is added', async () => {
            const wager = 0.01 - 0.0000001;
            try {
                await lottery.methods.enter().send({
                    from: accounts[0],
                    value: web3.utils.toWei(`${wager}`, 'ether')
                });
                chai.assert.fail();
            } catch (e) {

            }
        });
        it('should fail if more then 0.01 ether is added', async () => {
            const wager = 0.01 + 0.0000001;
            try {
                await lottery.methods.enter().send({
                    from: accounts[0],
                    value: web3.utils.toWei(`${wager}`, 'ether')
                });
                chai.assert.fail();
            } catch (e) {

            }
        });
        it('should add user if exactly 0.01 ether is added', async () => {
            const wager = 0.01;
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei(`${wager}`, 'ether')
            });
            const players = await lottery.methods.viewPlayers().call({
                from: accounts[0]
            });
            expect(players[0]).to.equal(accounts[0]);
        });
        it('should allow multiple users to enter', async () => {
            const wager = 0.01;
            await (async () => {
                return new Promise(
                    (resolve) => {
                        accounts.forEach(async (account, index) => {
                            await lottery.methods.enter().send({
                                from: account,
                                value: web3.utils.toWei(`${wager}`, 'ether')
                            });
                            if (index === accounts.length - 1) {
                                resolve();
                            }
                        });
                    }
                );
            })();
            const players = await lottery.methods.viewPlayers().call({
                from: accounts[0]
            });
            expect(players).deep.to.equal(accounts);
        });
    });
    describe('closeLottery', () => {
        it('manager can not call closeLottery when no balance exists', async () => {
            try {
                await lottery.methods.closeLottery().send({
                    from: accounts[0]
                });
                chai.assert.fail();
            } catch (e) {

            }
        });
        beforeEach(async ()=>{
            const wager = 0.01;
            await (async () => {
                return new Promise(
                    (resolve) => {
                        accounts.forEach(async (account, index) => {
                            await lottery.methods.enter().send({
                                from: account,
                                value: web3.utils.toWei(`${wager}`, 'ether')
                            });
                            if (index === accounts.length - 1) {
                                resolve();
                            }
                        });
                    }
                );
            })();
        });
        it('non-manager can not call closeLottery when balance exists', async () => {
            try {
                await lottery.methods.closeLottery().send({
                    from: accounts[1]
                });
                chai.assert.fail();
            } catch (e) {

            }
        });
        it('manager can call closeLottery when balance exists', async () => {
            try {
                await lottery.methods.closeLottery().send({
                    from: accounts[0]
                });
            } catch (e) {
                chai.assert.fail();
            }
        });
    });
});
