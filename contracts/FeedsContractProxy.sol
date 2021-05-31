// SPDX-License-Identifier: MIT

pragma solidity =0.7.6;
pragma abicoder v2;

interface IERC165 {
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

contract FeedsContractProxy {
    constructor(address _codeAddress) {
        require(IERC165(_codeAddress).supportsInterface(0xc1fdc5a0), "Contract address not proxiable");

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            sstore(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7, _codeAddress)
        }
    }

    function _fallback() internal {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            let codeAddress := sload(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7)
            calldatacopy(0x0, 0x0, calldatasize())
            let success := delegatecall(sub(gas(), 10000), codeAddress, 0x0, calldatasize(), 0, 0)
            let retSz := returndatasize()
            returndatacopy(0, 0, retSz)
            switch success
                case 0 {
                    revert(0, retSz)
                }
                default {
                    return(0, retSz)
                }
        }
    }

    fallback() external payable {
        _fallback();
    }

    receive() external payable {
        _fallback();
    }
}
