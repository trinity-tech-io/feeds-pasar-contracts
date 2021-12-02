// SPDX-License-Identifier: MIT

pragma solidity =0.7.6;
pragma abicoder v2;

/**
 * @dev ERC1155TokenReceiver interface of the ERC1155 standard as defined in the EIP.
 * @dev The ERC-165 identifier for this interface is 0x4e2312e0
 */
interface IERC1155TokenReceiver {
    /**
     * @notice Handle the receipt of a single ERC1155 token type.
     * @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeTransferFrom` after the balance has been updated.
     * This function MUST return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))` (i.e. 0xf23a6e61) if it accepts the transfer.
     * This function MUST revert if it rejects the transfer.
     * Return of any other value than the prescribed keccak256 generated value MUST result in the transaction being reverted by the caller.
     * @param _operator  The address which initiated the transfer (i.e. msg.sender)
     * @param _from      The address which previously owned the token
     * @param _id        The ID of the token being transferred
     * @param _value     The amount of tokens being transferred
     * @param _data      Additional data with no specified format
     * @return           `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
     */
    function onERC1155Received(
        address _operator,
        address _from,
        uint256 _id,
        uint256 _value,
        bytes calldata _data
    ) external returns (bytes4);

    /**
     * @notice Handle the receipt of multiple ERC1155 token types.
     * @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeBatchTransferFrom` after the balances have been updated.
     * This function MUST return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))` (i.e. 0xbc197c81) if it accepts the transfer(s).
     * This function MUST revert if it rejects the transfer(s).
     * Return of any other value than the prescribed keccak256 generated value MUST result in the transaction being reverted by the caller.
     * @param _operator  The address which initiated the batch transfer (i.e. msg.sender)
     * @param _from      The address which previously owned the token
     * @param _ids       An array containing ids of each token being transferred (order and length must match _values array)
     * @param _values    An array containing amounts of each token being transferred (order and length must match _ids array)
     * @param _data      Additional data with no specified format
     * @return           `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
     */
    function onERC1155BatchReceived(
        address _operator,
        address _from,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes calldata _data
    ) external returns (bytes4);
}

/**
 * @dev Interface of the ERC165 standard as defined in the EIP.
 */
interface IERC165 {
    /**
     * @notice Query if a contract implements an interface
     * @param interfaceID The interface identifier, as specified in ERC-165
     * @dev Interface identification is specified in ERC-165. This function
     * uses less than 30,000 gas.
     * @return `true` if the contract implements `interfaceID` and
     * `interfaceID` is not 0xffffffff, `false` otherwise
     */
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

/**
 * @dev Interface for proxiable logic contracts.
 * @dev The ERC-165 identifier for this interface is 0xc1fdc5a0
 */
interface IFeedsContractProxiable {
    /**
     * @dev Emit when the logic contract is updated
     */
    event CodeUpdated(address indexed _codeAddress);

    /**
     * @dev upgrade the logic contract to one on the new code address
     * @param _newAddress New code address of the upgraded logic contract
     */
    function updateCodeAddress(address _newAddress) external;

    /**
     * @dev get the code address of the current logic contract
     * @return Logic contract address
     */
    function getCodeAddress() external view returns (address);
}

/**
 * @dev Token interface of the ERC1155 standard as defined in the EIP.
 * @dev With support of custom token royalty methods
 */
interface IERC1155WithRoyalty {
    /**
     * @dev Either `TransferSingle` or `TransferBatch` MUST emit when tokens are transferred, including zero value transfers as well as minting or burning (see "Safe Transfer Rules" section of the standard).
     * The `_operator` argument MUST be the address of an account/contract that is approved to make the transfer (SHOULD be msg.sender).
     * The `_from` argument MUST be the address of the holder whose balance is decreased.
     * The `_to` argument MUST be the address of the recipient whose balance is increased.
     * The `_id` argument MUST be the token type being transferred.
     * The `_value` argument MUST be the number of tokens the holder balance is decreased by and match what the recipient balance is increased by.
     * When minting/creating tokens, the `_from` argument MUST be set to `0x0` (i.e. zero address).
     * When burning/destroying tokens, the `_to` argument MUST be set to `0x0` (i.e. zero address).
     */
    event TransferSingle(
        address indexed _operator,
        address indexed _from,
        address indexed _to,
        uint256 _id,
        uint256 _value
    );

    /**
     * @dev Either `TransferSingle` or `TransferBatch` MUST emit when tokens are transferred, including zero value transfers as well as minting or burning (see "Safe Transfer Rules" section of the standard).
     * The `_operator` argument MUST be the address of an account/contract that is approved to make the transfer (SHOULD be msg.sender).
     * The `_from` argument MUST be the address of the holder whose balance is decreased.
     * The `_to` argument MUST be the address of the recipient whose balance is increased.
     * The `_ids` argument MUST be the list of tokens being transferred.
     * The `_values` argument MUST be the list of number of tokens (matching the list and order of tokens specified in _ids) the holder balance is decreased by and match what the recipient balance is increased by.
     * When minting/creating tokens, the `_from` argument MUST be set to `0x0` (i.e. zero address).
     * When burning/destroying tokens, the `_to` argument MUST be set to `0x0` (i.e. zero address).
     */
    event TransferBatch(
        address indexed _operator,
        address indexed _from,
        address indexed _to,
        uint256[] _ids,
        uint256[] _values
    );

    /**
     * @dev MUST emit when approval for a second party/operator address to manage all tokens for an owner address is enabled or disabled (absence of an event assumes disabled).
     */
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    /**
     * @dev MUST emit when the URI is updated for a token ID.
     * URIs are defined in RFC 3986.
     * The URI MUST point to a JSON file that conforms to the "ERC-1155 Metadata URI JSON Schema".
     */
    event URI(string _value, uint256 indexed _id);

    /**
     * @notice Transfers `_value` amount of an `_id` from the `_from` address to the `_to` address specified (with safety call).
     * @dev Caller must be approved to manage the tokens being transferred out of the `_from` account (see "Approval" section of the standard).
     * MUST revert if `_to` is the zero address.
     * MUST revert if balance of holder for token `_id` is lower than the `_value` sent.
     * MUST revert on any other error.
     * MUST emit the `TransferSingle` event to reflect the balance change (see "Safe Transfer Rules" section of the standard).
     * After the above conditions are met, this function MUST check if `_to` is a smart contract (e.g. code size > 0). If so, it MUST call `onERC1155Received` on `_to` and act appropriately (see "Safe Transfer Rules" section of the standard).
     * @param _from    Source address
     * @param _to      Target address
     * @param _id      ID of the token type
     * @param _value   Transfer amount
     * @param _data    Additional data with no specified format, MUST be sent unaltered in call to `onERC1155Received` on `_to`
     */
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _id,
        uint256 _value,
        bytes calldata _data
    ) external;

    /**
     * @notice Transfers `_values` amount(s) of `_ids` from the `_from` address to the `_to` address specified (with safety call).
     * @dev Caller must be approved to manage the tokens being transferred out of the `_from` account (see "Approval" section of the standard).
     * MUST revert if `_to` is the zero address.
     * MUST revert if length of `_ids` is not the same as length of `_values`.
     * MUST revert if any of the balance(s) of the holder(s) for token(s) in `_ids` is lower than the respective amount(s) in `_values` sent to the recipient.
     * MUST revert on any other error.
     * MUST emit `TransferSingle` or `TransferBatch` event(s) such that all the balance changes are reflected (see "Safe Transfer Rules" section of the standard).
     * Balance changes and events MUST follow the ordering of the arrays (_ids[0]/_values[0] before _ids[1]/_values[1], etc).
     * After the above conditions for the transfer(s) in the batch are met, this function MUST check if `_to` is a smart contract (e.g. code size > 0). If so, it MUST call the relevant `ERC1155TokenReceiver` hook(s) on `_to` and act appropriately (see "Safe Transfer Rules" section of the standard).
     * @param _from    Source address
     * @param _to      Target address
     * @param _ids     IDs of each token type (order and length must match _values array)
     * @param _values  Transfer amounts per token type (order and length must match _ids array)
     * @param _data    Additional data with no specified format, MUST be sent unaltered in call to the `ERC1155TokenReceiver` hook(s) on `_to`
     */
    function safeBatchTransferFrom(
        address _from,
        address _to,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes calldata _data
    ) external;

    /**
     * @notice Get the balance of an account's tokens.
     * @param _owner  The address of the token holder
     * @param _id     ID of the token
     * @return        The _owner's balance of the token type requested
     */
    function balanceOf(address _owner, uint256 _id) external view returns (uint256);

    /**
     * @notice Get the balance of multiple account/token pairs
     * @param _owners The addresses of the token holders
     * @param _ids    ID of the tokens
     * @return        The _owner's balance of the token types requested (i.e. balance for each (owner, id) pair)
     */
    function balanceOfBatch(address[] calldata _owners, uint256[] calldata _ids)
        external
        view
        returns (uint256[] memory);

    /**
     * @notice Enable or disable approval for a third party ("operator") to manage all of the caller's tokens.
     * @dev MUST emit the ApprovalForAll event on success.
     * @param _operator  Address to add to the set of authorized operators
     * @param _approved  True if the operator is approved, false to revoke approval
     */
    function setApprovalForAll(address _operator, bool _approved) external;

    /**
     * @notice Queries the approval status of an operator for a given owner.
     * @param _owner     The owner of the tokens
     * @param _operator  Address of authorized operator
     * @return           True if the operator is approved, false if not
     */
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);

    /**
     * @notice Get the royalty owner address of a given token type
     * @param _id The token identifier of a given token type
     * @return The royalty owner address
     */
    function tokenRoyaltyOwner(uint256 _id) external view returns (address);

    /**
     * @notice Get the royalty owner address of multiple token types
     * @param _ids The token identifiers of the token types
     * @return The royalty owner addresses
     */
    function tokenRoyaltyOwnerBatch(uint256[] calldata _ids) external view returns (address[] memory);

    /**
     * @notice Get the royalty fee rate of a given token type
     * @param _id The token identifier of a given token type
     * @return The royalty fee rate in terms of parts per million
     */
    function tokenRoyaltyFee(uint256 _id) external view returns (uint256);

    /**
     * @notice Get the royalty fee rate of multiple token types
     * @param _ids The token identifiers of the token types
     * @return The royalty fee rates in terms of parts per million
     */
    function tokenRoyaltyFeeBatch(uint256[] calldata _ids) external view returns (uint256[] memory);
}

/**
 * @dev Interface for displaying sticker NFTs in Galleria.
 */
interface IGalleria {
    /**
     * @dev MUST emit when the contract receives a single ERC1155 token type.
     */
    event ERC1155Received(
        address indexed _operator,
        address indexed _from,
        uint256 indexed _id,
        uint256 _value,
        bytes _data
    );

    /**
     * @dev MUST emit when the contract receives multiple ERC1155 token types.
     */
    event ERC1155BatchReceived(
        address indexed _operator,
        address indexed _from,
        uint256[] _ids,
        uint256[] _values,
        bytes _data
    );

    /**
     * @dev MUST emit when an NFT panel is created to display in Galleria
     * The `_user` argument MUST be the address of the user who created the panel.
     * The `_panelId` argument MUST be the id of the panel created.
     * The `_tokenId` argument MUST be the token type placed in the panel.
     * The `_amount` argument MUST be the amount of token placed in the panel.
     * The `_fee` argument MUST be the amount of fee paid to create the panel.
     */
    event PanelCreated(
        address indexed _user,
        uint256 indexed _panelId,
        uint256 indexed _tokenId,
        uint256 _amount,
        uint256 _fee,
        string didUri
    );

    /**
     * @dev MUST emit when an NFT panel is removed from display in Galleria
     * The `_user` argument MUST be the address of the user who deleted the panel.
     * The `_panelId` argument MUST be the id of the panel deleted.
     */
    event PanelRemoved(address indexed _user, uint256 indexed _panelId);

    /**
     * @notice Create a new panel to display NFT in Galleria
     * @param _tokenId The token type to place in display panel
     * @param _amount The amount of token to display in panel
     */
    function createPanel(
        uint256 _tokenId,
        uint256 _amount,
        string calldata _didUri
    ) external payable;

    /**
     * @notice Remove a panel
     * @param _panelId The id of the panel to be removed
     */
    function removePanel(uint256 _panelId) external;

    /**
     * @dev Panel info data structure
     * @param panelId The identifier of the panel, incrementing uint256 starting from 1
     * @param panelState The state of the panel, 1 is active, 2 is removed
     * @param userAddr The address of the user who created the panel
     * @param tokenId The token type displayed in the panel
     * @param amount The amount of token displayed in the panel
     * @param fee The amount of fee paid to create the panel
     * @param createTime The timestamp of the panel creation
     * @param removeTime The timestamp of the panel removal
     */
    struct PanelInfo {
        uint256 panelId;
        uint256 panelState;
        address userAddr;
        uint256 tokenId;
        uint256 amount;
        uint256 fee;
        string didUri;
        uint256 createTime;
        uint256 removeTime;
    }

    /**
     * @dev User info data structure
     * @param index The index of the user, incrementing uint256 starting from 0
     * @param userAddr The address of the user
     * @param panelTotal The number of panels created by the user
     * @param panelActive The number of active panels created by the user
     * @param feeTotal The total amount of fee the user has paid
     * @param joinTime The timestamp of the user's first activity in Galleria
     * @param lastActionTime The timestamp of the user's most recent activity in Galleria
     */
    struct UserInfo {
        uint256 index;
        address userAddr;
        uint256 panelTotal;
        uint256 panelActive;
        uint256 feeTotal;
        uint256 joinTime;
        uint256 lastActionTime;
    }

    /**
     * @notice Get the NFT token address accepted by the Galleria
     * @return The NFT token address
     */
    function getTokenAddress() external view returns (address);

    /**
     * @notice Get the total number of panels ever created in the Galleria
     * @return The number of panels
     */
    function getPanelCount() external view returns (uint256);

    /**
     * @notice Get panel information of a given panel
     * @param _panelId The id of the panel, should be less than or equal to `getPanelCount`
     * @return Panel information
     */
    function getPanelById(uint256 _panelId) external view returns (PanelInfo memory);

    /**
     * @notice Get panel information of multiple panels
     * @param _panelIds The ids of the panels
     * @return Array of multiple panel information
     */
    function getPanelByIdBatch(uint256[] calldata _panelIds) external view returns (PanelInfo[] memory);

    /**
     * @notice Get the number of active panels currently in the Galleria
     * @return The number of active panels
     */
    function getActivePanelCount() external view returns (uint256);

    /**
     * @notice Enumerate panel information of an active given panel
     * @param _index A counter less than `getActivePanelCount`
     * @return Panel information
     */
    function getActivePanelByIndex(uint256 _index) external view returns (PanelInfo memory);

    /**
     * @notice Enumerate panel information for multiple indexes
     * @param _indexes An array of counters less than `getActivePanelCount`
     * @return Array of multiple panel information
     */
    function getAcitvePanelByIndexBatch(uint256[] calldata _indexes) external view returns (PanelInfo[] memory);

    /**
     * @notice Get the total number of users participated in the Galleria
     * @return The number of users
     */
    function getUserCount() external view returns (uint256);

    /**
     * @notice Get user information of a given user
     * @param _addr The address of the user
     * @return User information
     */
    function getUserByAddr(address _addr) external view returns (UserInfo memory);

    /**
     * @notice Get user information of multiple users
     * @param _addrs The addresses of the users
     * @return Array of multiple user information
     */
    function getUserByAddrBatch(address[] calldata _addrs) external view returns (UserInfo[] memory);

    /**
     * @notice Enumerate user information of a given user
     * @param _index A counter less than `getUserCount`
     * @return User information
     */
    function getUserByIndex(uint256 _index) external view returns (UserInfo memory);

    /**
     * @notice Enumerate user information for multiple indexes
     * @param _indexes An array of counters less than `getUserCount`
     * @return Array of multiple user information
     */
    function getUserByIndexBatch(uint256[] calldata _indexes) external view returns (UserInfo[] memory);

    /**
     * @notice Enumerate panel information created by a given user
     * @param _user A user address
     * @param _index A counter less than `panelTotal` of a given user
     * @return Panel information
     */
    function getUserPanelByIndex(address _user, uint256 _index) external view returns (PanelInfo memory);

    /**
     * @notice Enumerate panel information for multiple indexes created by a given user
     * @param _user A user address
     * @param _indexes An array of counters less than `panelTotal` of a given user
     * @return Array of multiple panel information
     */
    function getUserPanelByIndexBatch(address _user, uint256[] calldata _indexes)
        external
        view
        returns (PanelInfo[] memory);

    /**
     * @notice Enumerate active panel information created by a given user
     * @param _user A user address
     * @param _index A counter less than `panelActive` of a given user
     * @return Panel information
     */
    function getUserActivePanelByIndex(address _user, uint256 _index) external view returns (PanelInfo memory);

    /**
     * @notice Enumerate active panel information for multiple indexes created by a given user
     * @param _user A user address
     * @param _indexes An array of counters less than `panelActive` of a given user
     * @return Array of multiple panel information
     */
    function getUserActivePanelByIndexBatch(address _user, uint256[] calldata _indexes)
        external
        view
        returns (PanelInfo[] memory);

    /**
     * @notice Enumerate active panel information for a token type created by a given user
     * @param _user A user address
     * @param _tokenId ID of a token type
     * @return Panel information
     */
    function getUserActivePanelByToken(address _user, uint256 _tokenId) external view returns (PanelInfo memory);

    /**
     * @notice Enumerate active panel information for multiple token types created by a given user
     * @param _user A user address
     * @param _tokenIds An array of token type IDs
     * @return Array of multiple panel information
     */
    function getUserActivePanelByTokenBatch(address _user, uint256[] calldata _tokenIds)
        external
        view
        returns (PanelInfo[] memory);

    /**
     * @notice Set the minimum fee required for creating a panel and the platform address to receive the fees
     * @param _platformAddress the platform address
     * @param _minFee The minimum fee
     */
    function setFeeParams(address _platformAddress, uint256 _minFee) external;

    /**
     * @notice Get the current fee parameters
     * @return _platformAddress the current platform address
     * @return _minFee the current minimum fee
     */
    function getFeeParams() external view returns (address _platformAddress, uint256 _minFee);
}

interface IVersion {
    function getVersion() external view returns (string memory);

    function getMagic() external view returns (string memory);
}

library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        if (a == 0) {
            return 0;
        }

        c = a * b;
        require(c / a == b, "SafeMath mul failed");
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath sub failed");
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        require(c >= a, "SafeMath add failed");
        return c;
    }
}

library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            size := extcodesize(_addr)
        }
        return size > 0;
    }
}

/**
 * @dev Base contract for some basic common functionalities
 */
abstract contract BaseUtils is IFeedsContractProxiable {
    bytes4 internal constant ERC1155_ACCEPTED = 0xf23a6e61;
    bytes4 internal constant ERC1155_BATCH_ACCEPTED = 0xbc197c81;
    bytes4 internal constant INTERFACE_SIGNATURE_ERC165 = 0x01ffc9a7;
    bytes4 internal constant INTERFACE_SIGNATURE_ERC1155 = 0xd9b67a26;
    bytes4 internal constant INTERFACE_SIGNATURE_ERC1155TokenReceiver = 0x4e2312e0;
    bytes4 internal constant INTERFACE_SIGNATURE_TokenRoyalty = 0x96f7b536;
    bytes4 internal constant INTERFACE_SIGNATURE_FeedsContractProxiable = 0xc1fdc5a0;

    bytes internal constant GALLERIA_DATA_MAGIC = bytes("Feeds NFT Galleria");

    /**
     * @dev Fee rates are calculated with a base of 1/1000000
     */
    uint256 internal constant RATE_BASE = 1000000;

    uint256 private guard;
    uint256 private constant GUARD_PASS = 1;
    uint256 private constant GUARD_BLOCK = 2;

    /**
     * @dev Proxied contracts cannot use contructor but must be intialized manually
     */
    address public owner = address(0x1);
    bool public initialized = false;

    function _initialize() internal {
        require(!initialized, "Contract already initialized");
        require(owner == address(0x0), "Logic contract cannot be initialized");
        initialized = true;
        guard = GUARD_PASS;
        owner = msg.sender;
    }

    function initialize() external virtual {
        _initialize();
    }

    modifier inited() {
        require(initialized, "Contract not initialized");
        _;
    }

    /**
     * @dev Mutex to guard against re-entrancy exploits
     */
    modifier reentrancyGuard() {
        require(guard != GUARD_BLOCK, "Reentrancy blocked");
        guard = GUARD_BLOCK;
        _;
        guard = GUARD_PASS;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Sender must be owner");
        _;
    }

    function transferOwnership(address _owner) external inited onlyOwner {
        owner = _owner;
    }

    /**
     * @notice Upgrade the logic contract to one on the new code address
     * @dev Code position in storage is
     * keccak256("PROXIABLE") = "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7"
     * @param _newAddress New code address of the upgraded logic contract
     */
    function updateCodeAddress(address _newAddress) external override inited onlyOwner {
        require(IERC165(_newAddress).supportsInterface(0xc1fdc5a0), "Contract address not proxiable");

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            sstore(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7, _newAddress)
        }

        emit CodeUpdated(_newAddress);
    }

    /**
     * @notice get the code address of the current logic contract
     * @dev Code position in storage is
     * keccak256("PROXIABLE") = "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7"
     * @return _codeAddress Logic contract address
     */
    function getCodeAddress() external view override returns (address _codeAddress) {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            _codeAddress := sload(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7)
        }
    }
}

/**
 * @notice The implementation of the Galleria contract for showcasing Feeds sticker art tokens
 */
contract FeedsNFTGalleria is IERC165, IERC1155TokenReceiver, IGalleria, IVersion, BaseUtils {
    using SafeMath for uint256;
    using AddressUtils for address;

    string internal constant contractName = "Feeds NFT Galleria";
    string internal constant version = "v0.1";
    string internal constant magic = "20211101";

    address internal tokenAddress;
    IERC1155WithRoyalty internal token;

    mapping(uint256 => PanelInfo) internal panels;
    uint256 internal panelCount;
    uint256[] internal activePanels;
    mapping(uint256 => uint256) internal activePanelToIndex;

    mapping(address => UserInfo) internal addrToUser;
    address[] internal users;

    mapping(address => mapping(uint256 => uint256)) internal userTokenToPanel;

    mapping(address => uint256[]) internal userPanels;
    mapping(address => uint256[]) internal userActivePanels;
    mapping(address => mapping(uint256 => uint256)) internal userActivePanelToIndex;

    address internal platformAddress;
    uint256 internal minFee;

    function supportsInterface(bytes4 _interfaceId) public pure override returns (bool) {
        return
            _interfaceId == INTERFACE_SIGNATURE_ERC165 ||
            _interfaceId == INTERFACE_SIGNATURE_ERC1155TokenReceiver ||
            _interfaceId == INTERFACE_SIGNATURE_FeedsContractProxiable;
    }

    function initialize() external pure override {
        revert("Do not use this method");
    }

    function initialize(
        address _tokenAddress,
        address _platformAddress,
        uint256 _minFee
    ) external {
        _initialize();

        require(
            IERC165(_tokenAddress).supportsInterface(INTERFACE_SIGNATURE_ERC1155) &&
                IERC165(_tokenAddress).supportsInterface(INTERFACE_SIGNATURE_TokenRoyalty),
            "Token must be ERC1155 compliant with TokenRoyalty extension"
        );
        tokenAddress = _tokenAddress;
        token = IERC1155WithRoyalty(_tokenAddress);

        platformAddress = _platformAddress;
        minFee = _minFee;
    }

    /**
     * @notice Handle the receipt of a single ERC1155 token type.
     * @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeTransferFrom` after the balance has been updated.
     * This function MUST return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))` (i.e. 0xf23a6e61) if it accepts the transfer.
     * This function MUST revert if it rejects the transfer.
     * Return of any other value than the prescribed keccak256 generated value MUST result in the transaction being reverted by the caller.
     * @param _operator  The address which initiated the transfer (i.e. msg.sender)
     * @param _from      The address which previously owned the token
     * @param _id        The ID of the token being transferred
     * @param _value     The amount of tokens being transferred
     * @param _data      Additional data with no specified format
     * @return           `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
     */
    function onERC1155Received(
        address _operator,
        address _from,
        uint256 _id,
        uint256 _value,
        bytes calldata _data
    ) external override inited returns (bytes4) {
        emit ERC1155Received(_operator, _from, _id, _value, _data);
        return ERC1155_ACCEPTED;
    }

    /**
     * @notice Handle the receipt of multiple ERC1155 token types.
     * @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeBatchTransferFrom` after the balances have been updated.
     * This function MUST return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))` (i.e. 0xbc197c81) if it accepts the transfer(s).
     * This function MUST revert if it rejects the transfer(s).
     * Return of any other value than the prescribed keccak256 generated value MUST result in the transaction being reverted by the caller.
     * @param _operator  The address which initiated the batch transfer (i.e. msg.sender)
     * @param _from      The address which previously owned the token
     * @param _ids       An array containing ids of each token being transferred (order and length must match _values array)
     * @param _values    An array containing amounts of each token being transferred (order and length must match _ids array)
     * @param _data      Additional data with no specified format
     * @return           `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
     */
    function onERC1155BatchReceived(
        address _operator,
        address _from,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes calldata _data
    ) external override inited returns (bytes4) {
        emit ERC1155BatchReceived(_operator, _from, _ids, _values, _data);
        return ERC1155_BATCH_ACCEPTED;
    }

    /**
     * @notice Create a new panel to display NFT in Galleria
     * @param _tokenId The token type to place in display panel
     * @param _amount The amount of token to display in panel
     */
    function createPanel(
        uint256 _tokenId,
        uint256 _amount,
        string calldata _didUri
    ) external payable override inited reentrancyGuard {
        require(token.isApprovedForAll(msg.sender, address(this)), "Contract is not approved");
        require(_amount > 0, "Amount cannot be zero");
        require(msg.value >= minFee, "Paid fee not enough");
        require(
            userTokenToPanel[msg.sender][_tokenId] == 0,
            "User cannot have more than one active panel for one token type"
        );

        token.safeTransferFrom(msg.sender, address(this), _tokenId, _amount, GALLERIA_DATA_MAGIC);
        (bool success, ) = payable(platformAddress).call{value: msg.value}("");
        require(success, "Fee transfer failed");

        panelCount = panelCount.add(1);
        PanelInfo memory newPanel;
        newPanel.panelId = panelCount;
        newPanel.userAddr = msg.sender;
        newPanel.panelState = 1;
        newPanel.tokenId = _tokenId;
        newPanel.amount = _amount;
        newPanel.fee = msg.value;
        newPanel.didUri = _didUri;
        newPanel.createTime = block.timestamp;
        panels[panelCount] = newPanel;

        activePanelToIndex[newPanel.panelId] = activePanels.length;
        activePanels.push(newPanel.panelId);

        userTokenToPanel[msg.sender][_tokenId] = newPanel.panelId;

        _newPanelUser(msg.sender, newPanel.panelId);

        emit PanelCreated(msg.sender, newPanel.panelId, _tokenId, _amount, msg.value, _didUri);
    }

    function _newPanelUser(address _user, uint256 _id) internal {
        if (addrToUser[_user].userAddr == address(0x0)) {
            addrToUser[_user].index = users.length;
            addrToUser[_user].userAddr = _user;
            addrToUser[_user].joinTime = block.timestamp;
            users.push(_user);
        }
        addrToUser[_user].lastActionTime = block.timestamp;

        userActivePanelToIndex[_user][_id] = userActivePanels[_user].length;
        userPanels[_user].push(_id);
        userActivePanels[_user].push(_id);

        addrToUser[_user].panelTotal = userPanels[_user].length;
        addrToUser[_user].panelActive = userActivePanels[_user].length;

        addrToUser[_user].feeTotal = msg.value.add(addrToUser[_user].feeTotal);
    }

    /**
     * @notice Remove a panel
     * @param _panelId The id of the panel to be removed
     */
    function removePanel(uint256 _panelId) external override inited reentrancyGuard {
        require(panels[_panelId].panelState == 1, "Invalid panel");
        require(msg.sender == panels[_panelId].userAddr, "Only panel creator can remove own panel");

        panels[_panelId].panelState = 2;
        panels[_panelId].removeTime = block.timestamp;

        if (activePanelToIndex[_panelId] != activePanels.length.sub(1)) {
            uint256 index = activePanelToIndex[_panelId];
            activePanels[index] = activePanels[activePanels.length.sub(1)];
            activePanelToIndex[activePanels[index]] = index;
        }
        activePanelToIndex[_panelId] = 0;
        activePanels.pop();

        address user = panels[_panelId].userAddr;
        if (userActivePanelToIndex[user][_panelId] != userActivePanels[user].length.sub(1)) {
            uint256 index = userActivePanelToIndex[user][_panelId];
            userActivePanels[user][index] = userActivePanels[user][userActivePanels[user].length.sub(1)];
            userActivePanelToIndex[user][userActivePanels[user][index]] = index;
        }
        userActivePanelToIndex[user][_panelId] = 0;
        userActivePanels[user].pop();
        addrToUser[user].panelActive = userActivePanels[user].length;

        token.safeTransferFrom(
            address(this),
            user,
            panels[_panelId].tokenId,
            panels[_panelId].amount,
            GALLERIA_DATA_MAGIC
        );

        userTokenToPanel[msg.sender][panels[_panelId].tokenId] = 0;
        addrToUser[user].lastActionTime = block.timestamp;
        emit PanelRemoved(user, _panelId);
    }

    /**
     * @notice Get the NFT token address accepted by the Galleria
     * @return The NFT token address
     */
    function getTokenAddress() external view override returns (address) {
        return tokenAddress;
    }

    /**
     * @notice Get the total number of panels ever created in the Galleria
     * @return The number of panels
     */
    function getPanelCount() external view override returns (uint256) {
        return panelCount;
    }

    /**
     * @notice Get panel information of a given panel
     * @param _panelId The id of the panel, should be less than or equal to `getPanelCount`
     * @return Panel information
     */
    function getPanelById(uint256 _panelId) external view override returns (PanelInfo memory) {
        return panels[_panelId];
    }

    /**
     * @notice Get panel information of multiple panels
     * @param _panelIds The ids of the panels
     * @return Array of multiple panel information
     */
    function getPanelByIdBatch(uint256[] calldata _panelIds) external view override returns (PanelInfo[] memory) {
        PanelInfo[] memory _panels = new PanelInfo[](_panelIds.length);

        for (uint256 i = 0; i < _panelIds.length; ++i) {
            _panels[i] = panels[_panelIds[i]];
        }

        return _panels;
    }

    /**
     * @notice Get the number of active panels currently in the Galleria
     * @return The number of active panels
     */
    function getActivePanelCount() external view override returns (uint256) {
        return activePanels.length;
    }

    /**
     * @notice Enumerate panel information of an active given panel
     * @param _index A counter less than `getActivePanelCount`
     * @return Panel information
     */
    function getActivePanelByIndex(uint256 _index) external view override returns (PanelInfo memory) {
        return panels[activePanels[_index]];
    }

    /**
     * @notice Enumerate panel information for multiple indexes
     * @param _indexes An array of counters less than `getActivePanelCount`
     * @return Array of multiple panel information
     */
    function getAcitvePanelByIndexBatch(uint256[] calldata _indexes)
        external
        view
        override
        returns (PanelInfo[] memory)
    {
        PanelInfo[] memory _panels = new PanelInfo[](_indexes.length);

        for (uint256 i = 0; i < _indexes.length; ++i) {
            _panels[i] = panels[activePanels[_indexes[i]]];
        }

        return _panels;
    }

    /**
     * @notice Get the total number of users participated in the Galleria
     * @return The number of users
     */
    function getUserCount() external view override returns (uint256) {
        return users.length;
    }

    /**
     * @notice Get user information of a given user
     * @param _addr The address of the user
     * @return User information
     */
    function getUserByAddr(address _addr) external view override returns (UserInfo memory) {
        return addrToUser[_addr];
    }

    /**
     * @notice Get user information of muultiple users
     * @param _addrs The addresses of the users
     * @return Array of multiple user information
     */
    function getUserByAddrBatch(address[] calldata _addrs) external view override returns (UserInfo[] memory) {
        UserInfo[] memory _users = new UserInfo[](_addrs.length);

        for (uint256 i = 0; i < _addrs.length; ++i) {
            _users[i] = addrToUser[_addrs[i]];
        }

        return _users;
    }

    /**
     * @notice Enumerate user information of a given user
     * @param _index A counter less than `getUserCount`
     * @return User information
     */
    function getUserByIndex(uint256 _index) external view override returns (UserInfo memory) {
        return addrToUser[users[_index]];
    }

    /**
     * @notice Enumerate user information for multiple indexes
     * @param _indexes An array of counters less than `getUserCount`
     * @return Array of multiple user information
     */
    function getUserByIndexBatch(uint256[] calldata _indexes) external view override returns (UserInfo[] memory) {
        UserInfo[] memory _users = new UserInfo[](_indexes.length);

        for (uint256 i = 0; i < _indexes.length; ++i) {
            _users[i] = addrToUser[users[_indexes[i]]];
        }

        return _users;
    }

    /**
     * @notice Enumerate panel information created by a given user
     * @param _user A user address
     * @param _index A counter less than `panelTotal` of a given user
     * @return Panel information
     */
    function getUserPanelByIndex(address _user, uint256 _index) external view override returns (PanelInfo memory) {
        return panels[userPanels[_user][_index]];
    }

    /**
     * @notice Enumerate panel information for multiple indexes created by a given user
     * @param _user A user address
     * @param _indexes An array of counters less than `panelTotal` of a given user
     * @return Array of multiple panel information
     */
    function getUserPanelByIndexBatch(address _user, uint256[] calldata _indexes)
        external
        view
        override
        returns (PanelInfo[] memory)
    {
        PanelInfo[] memory _panels = new PanelInfo[](_indexes.length);

        for (uint256 i = 0; i < _indexes.length; ++i) {
            _panels[i] = panels[userPanels[_user][_indexes[i]]];
        }

        return _panels;
    }

    /**
     * @notice Enumerate active panel information created by a given user
     * @param _user A user address
     * @param _index A counter less than `panelActive` of a given user
     * @return Panel information
     */
    function getUserActivePanelByIndex(address _user, uint256 _index) external view override returns (PanelInfo memory) {
        return panels[userActivePanels[_user][_index]];
    }

    /**
     * @notice Enumerate active panel information for multiple indexes created by a given user
     * @param _user A user address
     * @param _indexes An array of counters less than `panelActive` of a given user
     * @return Array of multiple panel information
     */
    function getUserActivePanelByIndexBatch(address _user, uint256[] calldata _indexes)
        external
        view
        override
        returns (PanelInfo[] memory) {
        PanelInfo[] memory _panels = new PanelInfo[](_indexes.length);

        for (uint256 i = 0; i < _indexes.length; ++i) {
            _panels[i] = panels[userActivePanels[_user][_indexes[i]]];
        }

        return _panels;
        }

    /**
     * @notice Enumerate active panel information for a token type created by a given user
     * @param _user A user address
     * @param _tokenId ID of a token type
     * @return Panel information
     */
    function getUserActivePanelByToken(address _user, uint256 _tokenId) external view override returns (PanelInfo memory) {
        return panels[userTokenToPanel[_user][_tokenId]];    
    }

    /**
     * @notice Enumerate active panel information for multiple token types created by a given user
     * @param _user A user address
     * @param _tokenIds An array of token type IDs
     * @return Array of multiple panel information
     */
    function getUserActivePanelByTokenBatch(address _user, uint256[] calldata _tokenIds)
        external
        view
        override
        returns (PanelInfo[] memory) {
        PanelInfo[] memory _panels = new PanelInfo[](_tokenIds.length);

        for (uint256 i = 0; i < _tokenIds.length; ++i) {
            _panels[i] = panels[userTokenToPanel[_user][_tokenIds[i]]];
        }

        return _panels;
    }

    /**
     * @notice Set the minimum fee required for creating a panel and the platform address to receive the fees
     * @param _platformAddress the platform address
     * @param _minFee The minimum fee
     */
    function setFeeParams(address _platformAddress, uint256 _minFee) external override inited onlyOwner {
        platformAddress = _platformAddress;
        minFee = _minFee;
    }

    /**
     * @notice Get the current fee parameters
     * @return _platformAddress the current platform address
     * @return _minFee the current minimum fee
     */
    function getFeeParams() external view override returns (address _platformAddress, uint256 _minFee) {
        _platformAddress = platformAddress;
        _minFee = minFee;
    }

    function getVersion() external pure override returns (string memory) {
        return version;
    }

    function getMagic() external pure override returns (string memory) {
        return magic;
    }
}
