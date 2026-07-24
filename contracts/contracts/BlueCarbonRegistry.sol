// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title BlueCarbonRegistry
 * @notice Phase 1 placeholder — full registry logic in Phase 8.
 */
contract BlueCarbonRegistry {
    string public constant NAME = "BlueChain MRV Registry";
    string public constant VERSION = "0.1.0-phase1";

    address public admin;

    event RegistryInitialized(address indexed admin);

    constructor() {
        admin = msg.sender;
        emit RegistryInitialized(msg.sender);
    }
}
