// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Crowdfunding.sol";

contract DeployCrowdfunding is Script {
    function run() external {
        vm.startBroadcast();
        new Crowdfunding(
            (unicode"На капитальный ремонт провала"),
            "",
            1 ether,
            5
        );
        vm.stopBroadcast();
    }
}
