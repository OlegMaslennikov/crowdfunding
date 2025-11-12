// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract Crowdfunding {
    address public owner;
    string public projectName;
    string public description;
    uint public goal;
    uint public totalFunds;
    bool public goalReached;
    bool public closed;
    uint public deadline;

    bool private locked;

    mapping(address => uint) public contributions;

    event Funded(address indexed contributor, uint amount);
    event Withdrawn(uint amount);
    event Refunded(address indexed contributor, uint amount);
    event Closed(bool goalReached, uint totalFunds);

    constructor(
        string memory _projectName,
        string memory _description,
        uint _goal,
        uint _durationInDays
    ) {
        owner = msg.sender;
        projectName = _projectName;
        description = _description;
        goal = _goal;
        deadline = block.timestamp + (_durationInDays * 1 days);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "Reentrancy");
        locked = true;
        _;
        locked = false;
    }

    modifier campaignActive() {
        require(!closed, "Campaign closed");
        require(block.timestamp < deadline, "Deadline passed");
        _;
    }

    modifier campaignEnded() {
        require(block.timestamp >= deadline, "Campaign still active");
        _;
    }

    function fund() public payable nonReentrant campaignActive {
        require(msg.value > 0, "Zero ETH");

        contributions[msg.sender] += msg.value;
        totalFunds += msg.value;

        if (totalFunds >= goal) {
            goalReached = true;
        }

        emit Funded(msg.sender, msg.value);
    }

    function withdraw() public onlyOwner nonReentrant campaignEnded {
        require(goalReached, "Goal not reached");
        require(!closed, "Already withdrawn");

        closed = true;
        uint amount = address(this).balance;
        payable(owner).transfer(amount);

        emit Withdrawn(amount);
        emit Closed(true, totalFunds);
    }

    function refund() public nonReentrant campaignEnded {
        require(!goalReached, "Goal reached");
        require(!closed, "Campaign closed");

        uint amount = contributions[msg.sender];
        require(amount > 0, "No contribution");

        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit Refunded(msg.sender, amount);
    }
}
