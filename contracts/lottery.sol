pragma solidity ^0.4.17;

contract Lottery {
    
    bool public open = false;
    uint private winning_index;
    address private manager;
    address[] private players;
    
    constructor() public {
        manager = msg.sender;
        openLottery();
    }
    
    function enter() public payable {
        require(msg.value == 0.01 ether);
        players.push(msg.sender);
    }

    function viewManager() public view returns (address) {
        return manager;
    }

    function viewPlayers() public view returns (address[]) {
        return players;
    }
    
    function viewBalance() public view returns (uint) {
        uint balance = address(this).balance;
        return balance;
    }

    function viewWinner() public view returns (address) {
        require(open==false);
        address winner = players[winning_index];
        return winner;
    }
    
    function closeLottery() public restricted returns (address) {
        require(open==true);
        require(viewBalance()>0);
        address winner = pickWinner();
        sendPrize(winner);
        open = false;
        return winner;
    }
    
    function openLottery() public restricted {
        require(open==false);
        open = true;
        players = new address[](0);
    }
    
    function pickWinner() private returns (address) {
        uint index = randomIndex(players.length);
        winning_index = index;
        address winner = players[index];
        return winner;
    }

    function sendPrize(address winner) private {
        winner.transfer(address(this).balance);
    }
    
    function randomIndex(uint count) private view returns (uint) {
        return random() % count;
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, now, viewPlayers()));
    }
    
    function isManager() private view returns (bool) {
        return msg.sender == manager;
    }
    
    modifier restricted() {
        require(isManager()==true);
        _;
    }

}