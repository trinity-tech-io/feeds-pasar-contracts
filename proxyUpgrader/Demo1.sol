// SPDX-License-Identifier: MIT

pragma solidity =0.7.6;
pragma abicoder v2;

interface IERC165 {
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

interface IFeedsContractProxiable {
    function updateCodeAddress(address _newAddress) external;

    function getCodeAddress() external view returns (address);
}

contract Demo1 is IERC165, IFeedsContractProxiable {
    // Methods for upgradeable contract
    address public owner;
    bool public initialized = false;

    function initialize() external {
        require(!initialized, "Contract already initialized");
        initialized = true;
        owner = msg.sender;
    }

    modifier inited() {
        require(initialized, "Contract not initialized");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Sender must be owner");
        _;
    }

    function updateCodeAddress(address _newAddress) external override inited onlyOwner {
        require(IERC165(_newAddress).supportsInterface(0xc1fdc5a0), "Contract address not proxiable");

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            sstore(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7, _newAddress)
        }
    }

    function getCodeAddress() external view override returns (address _codeAddress) {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            _codeAddress := sload(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7)
        }
    }

    function supportsInterface(bytes4 _interfaceId) external pure override returns (bool) {
        return _interfaceId == 0xc1fdc5a0;
    }

    // Methods for base logic contract
    uint256 private a;
    uint256 private b;

    function setA(uint256 _a) external {
        a = _a;
    }

    function getA() external view returns (uint256) {
        return a;
    }
}
