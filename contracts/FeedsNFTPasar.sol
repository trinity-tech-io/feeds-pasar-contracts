// SPDX-License-Identifier: MIT

pragma solidity =0.7.6;
pragma abicoder v2;

interface IERC1155TokenReceiver {
    function onERC1155Received(
        address _operator,
        address _from,
        uint256 _id,
        uint256 _value,
        bytes calldata _data
    ) external returns (bytes4);

    function onERC1155BatchReceived(
        address _operator,
        address _from,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes calldata _data
    ) external returns (bytes4);
}

interface IERC165 {
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

interface IFeedsContractProxiable {
    function updateCodeAddress(address _newAddress) external;

    function getCodeAddress() external view returns (address);
}

interface IERC1155WithRoyalty {
    event TransferSingle(
        address indexed _operator,
        address indexed _from,
        address indexed _to,
        uint256 _id,
        uint256 _value
    );

    event TransferBatch(
        address indexed _operator,
        address indexed _from,
        address indexed _to,
        uint256[] _ids,
        uint256[] _values
    );

    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    event URI(string _value, uint256 indexed _id);

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _id,
        uint256 _value,
        bytes calldata _data
    ) external;

    function safeBatchTransferFrom(
        address _from,
        address _to,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes calldata _data
    ) external;

    function balanceOf(address _owner, uint256 _id) external view returns (uint256);

    function balanceOfBatch(address[] calldata _owners, uint256[] calldata _ids)
        external
        view
        returns (uint256[] memory);

    function setApprovalForAll(address _operator, bool _approved) external;

    function isApprovedForAll(address _owner, address _operator) external view returns (bool);

    function tokenRoyaltyOwner(uint256 _id) external view returns (address);

    function tokenRoyaltyOwnerBatch(uint256[] calldata _ids) external view returns (address[] memory);

    function tokenRoyaltyFee(uint256 _id) external view returns (uint256);

    function tokenRoyaltyFeeBatch(uint256[] calldata _ids) external view returns (uint256[] memory);
}

interface IPasarOrder {
    event ERC1155Received(
        address indexed _operator,
        address indexed _from,
        uint256 indexed _id,
        uint256 _value,
        bytes _data
    );

    event ERC1155BatchReceived(
        address indexed _operator,
        address indexed _from,
        uint256[] _ids,
        uint256[] _values,
        bytes _data
    );

    event OrderForSale(
        address indexed _seller,
        uint256 indexed _orderId,
        uint256 indexed _tokenId,
        uint256 _amount,
        uint256 _price
    );

    event OrderForAuction(
        address indexed _seller,
        uint256 indexed _orderId,
        uint256 indexed _tokenId,
        uint256 _amount,
        uint256 _minPrice,
        uint256 _endTime
    );

    event OrderBid(address indexed _seller, address indexed _buyer, uint256 indexed _orderId, uint256 _price);

    event OrderFilled(
        address indexed _seller,
        address indexed _buyer,
        uint256 indexed _orderId,
        address _copyrightOwner,
        uint256 _price,
        uint256 _royalty
    );

    event OrderCanceled(address indexed _seller, uint256 indexed _orderId);

    event OrderPriceChanged(address indexed _seller, uint256 indexed _orderId, uint256 _oldPrice, uint256 _newPrice);

    function createOrderForSale(
        uint256 _tokenId,
        uint256 _amount,
        uint256 _price
    ) external;

    function createOrderForAuction(
        uint256 _tokenId,
        uint256 _amount,
        uint256 _minPrice,
        uint256 _endTime
    ) external;

    function buyOrder(uint256 _orderId) external payable;

    function bidForOrder(uint256 _orderId) external payable;

    function cancelOrder(uint256 _orderId) external;

    function settleAuctionOrder(uint256 _orderId) external;

    function changeOrderPrice(uint256 _orderId, uint256 _price) external;
}

interface IPasarInfo {
    struct OrderInfo {
        uint256 orderId;
        uint256 orderType;
        uint256 orderState;
        uint256 tokenId;
        uint256 amount;
        uint256 price;
        uint256 endTime;
        address sellerAddr;
        address buyerAddr;
        uint256 bids;
        address lastBidder;
        uint256 lastBid;
        uint256 filled;
        address royaltyOwner;
        uint256 royaltyFee;
        uint256 createTime;
        uint256 updateTime;
    }

    struct SellerInfo {
        uint256 index;
        address sellerAddr;
        uint256 orderCount;
        uint256 openCount;
        uint256 earned;
        uint256 royalty;
    }

    struct BuyerInfo {
        uint256 index;
        address buyerAddr;
        uint256 orderCount;
        uint256 filledCount;
        uint256 paid;
        uint256 royalty;
    }

    function getTokenAddress() external view returns (address);

    function getOrderCount() external view returns (uint256);

    function getOrderById(uint256 _orderId) external view returns (OrderInfo memory);

    function getOrderByIdBatch(uint256[] calldata _orderIds) external view returns (OrderInfo[] memory);

    function getOpenOrderCount() external view returns (uint256);

    function getOpenOrderByIndex(uint256 _index) external view returns (OrderInfo memory);

    function getOpenOrderByIndexBatch(uint256[] calldata _indexes) external view returns (OrderInfo[] memory);

    function getSellerCount() external view returns (uint256);

    function getSellerByAddr(address _seller) external view returns (SellerInfo memory);

    function getSellerByIndex(uint256 _index) external view returns (SellerInfo memory);

    function getSellerByIndexBatch(uint256[] calldata _indexes) external view returns (SellerInfo[] memory);

    function getSellerOrderByIndex(address _seller, uint256 _index) external view returns (OrderInfo memory);

    function getSellerOrderByIndexBatch(address _seller, uint256[] calldata _indexes)
        external
        view
        returns (OrderInfo[] memory);

    function getSellerOpenByIndex(address _seller, uint256 _index) external view returns (OrderInfo memory);

    function getSellerOpenByIndexBatch(address _seller, uint256[] calldata _indexes)
        external
        view
        returns (OrderInfo[] memory);

    function getBuyerCount() external view returns (uint256);

    function getBuyerByAddr(address _buyer) external view returns (BuyerInfo memory);

    function getBuyerByIndex(uint256 _index) external view returns (BuyerInfo memory);

    function getBuyerByIndexBatch(uint256[] calldata _indexes) external view returns (BuyerInfo[] memory);

    function getBuyerOrderByIndex(address _buyer, uint256 _index) external view returns (OrderInfo memory);

    function getBuyerOrderByIndexBatch(address _buyer, uint256[] calldata _indexes)
        external
        view
        returns (OrderInfo[] memory);

    function getBuyerFilledByIndex(address _buyer, uint256 _index) external view returns (OrderInfo memory);

    function getBuyerFilledByIndexBatch(address _buyer, uint256[] calldata _indexes)
        external
        view
        returns (OrderInfo[] memory);
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

abstract contract BaseUtils is IFeedsContractProxiable {
    bytes4 internal constant ERC1155_ACCEPTED = 0xf23a6e61;
    bytes4 internal constant ERC1155_BATCH_ACCEPTED = 0xbc197c81;
    bytes4 internal constant INTERFACE_SIGNATURE_ERC165 = 0x01ffc9a7;
    bytes4 internal constant INTERFACE_SIGNATURE_ERC1155 = 0xd9b67a26;
    bytes4 internal constant INTERFACE_SIGNATURE_ERC1155TokenReceiver = 0x4e2312e0;
    bytes4 internal constant INTERFACE_SIGNATURE_TokenRoyalty = 0x96f7b536;
    bytes4 internal constant INTERFACE_SIGNATURE_FeedsContractProxiable = 0xc1fdc5a0;

    bytes internal constant PASAR_DATA_MAGIC = bytes("Feeds NFT Pasar");

    uint256 internal constant RATE_BASE = 1000000;

    uint256 private guard;
    uint256 private constant GUARD_PASS = 1;
    uint256 private constant GUARD_BLOCK = 2;

    address public owner;
    bool public initialized = false;

    function _initialize() internal {
        require(!initialized, "Contract already initialized");
        initialized = true;
        guard = GUARD_PASS;
        owner = msg.sender;
    }

    function initialize() external {
        _initialize();
    }

    modifier inited() {
        require(initialized, "Contract not initialized");
        _;
    }

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
}

contract FeedsNFTPasar is IERC165, IERC1155TokenReceiver, IPasarOrder, IPasarInfo, BaseUtils {
    using SafeMath for uint256;
    using AddressUtils for address;

    address internal tokenAddress;
    IERC1155WithRoyalty internal token;

    OrderInfo[] internal orders;
    uint256[] internal openOrders;
    mapping(uint256 => uint256) openOrderToIndex;

    mapping(address => SellerInfo) internal addrToSeller;
    mapping(address => BuyerInfo) internal addrToBuyer;
    address[] internal sellers;
    address[] internal buyers;

    mapping(address => uint256[]) sellerOrders;
    mapping(address => uint256[]) sellerOpenOrders;
    mapping(address => mapping(uint256 => uint256)) sellerOpenToIndex;

    mapping(address => uint256[]) buyerOrders;
    mapping(address => uint256[]) buyerFilledOrders;
    mapping(address => mapping(uint256 => bool)) buyerOrderParticipated;

    string internal constant contractName = "Feeds NFT Pasar";
    string internal constant version = "v0.1";
    string internal constant magic = "20210516";

    function supportsInterface(bytes4 _interfaceId) public pure override returns (bool) {
        return
            _interfaceId == INTERFACE_SIGNATURE_ERC165 ||
            _interfaceId == INTERFACE_SIGNATURE_ERC1155TokenReceiver ||
            _interfaceId == INTERFACE_SIGNATURE_FeedsContractProxiable;
    }

    function initialize(address _tokenAddress) external {
        _initialize();

        require(
            IERC165(_tokenAddress).supportsInterface(INTERFACE_SIGNATURE_ERC1155) &&
                IERC165(_tokenAddress).supportsInterface(INTERFACE_SIGNATURE_TokenRoyalty),
            "Token must be ERC1155 compliant with TokenRoyalty extension"
        );
        tokenAddress = _tokenAddress;
        token = IERC1155WithRoyalty(_tokenAddress);
    }

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

    function createOrderForSale(
        uint256 _tokenId,
        uint256 _amount,
        uint256 _price
    ) external override inited reentrancyGuard {
        require(token.isApprovedForAll(msg.sender, address(this)), "Contract is not approved");
        require(_amount > 0 && _price > 0, "Amount and price cannot be zero");

        token.safeTransferFrom(msg.sender, address(this), _tokenId, _amount, PASAR_DATA_MAGIC);

        OrderInfo memory newOrder;
        newOrder.orderId = orders.length;
        newOrder.orderType = 1;
        newOrder.orderState = 1;
        newOrder.tokenId = _tokenId;
        newOrder.amount = _amount;
        newOrder.price = _price;
        newOrder.sellerAddr = msg.sender;
        newOrder.createTime = block.timestamp;
        newOrder.updateTime = block.timestamp;
        orders.push(newOrder);

        openOrderToIndex[newOrder.orderId] = openOrders.length;
        openOrders.push(newOrder.orderId);

        _newOrderSeller(msg.sender, newOrder.orderId);

        emit OrderForSale(msg.sender, newOrder.orderId, _tokenId, _amount, _price);
    }

    function createOrderForAuction(
        uint256 _tokenId,
        uint256 _amount,
        uint256 _minPrice,
        uint256 _endTime
    ) external override inited reentrancyGuard {
        require(token.isApprovedForAll(msg.sender, address(this)), "Contract is not approved");
        require(_amount > 0 && _minPrice > 0, "Amount and price cannot be zero");
        require(_endTime > block.timestamp, "End time cannot be in the past");

        token.safeTransferFrom(msg.sender, address(this), _tokenId, _amount, PASAR_DATA_MAGIC);

        OrderInfo memory newOrder;
        newOrder.orderId = orders.length;
        newOrder.orderType = 2;
        newOrder.orderState = 1;
        newOrder.tokenId = _tokenId;
        newOrder.amount = _amount;
        newOrder.price = _minPrice;
        newOrder.endTime = _endTime;
        newOrder.sellerAddr = msg.sender;
        newOrder.createTime = block.timestamp;
        newOrder.updateTime = block.timestamp;
        orders.push(newOrder);

        openOrderToIndex[newOrder.orderId] = openOrders.length;
        openOrders.push(newOrder.orderId);

        _newOrderSeller(msg.sender, newOrder.orderId);

        emit OrderForAuction(msg.sender, newOrder.orderId, _tokenId, _amount, _minPrice, _endTime);
    }

    function _newOrderSeller(address _seller, uint256 _id) internal {
        if (addrToSeller[_seller].sellerAddr == address(0x0)) {
            addrToSeller[_seller].index = sellers.length;
            addrToSeller[_seller].sellerAddr = _seller;
            sellers.push(_seller);
        }

        sellerOpenToIndex[_seller][_id] = sellerOpenOrders[_seller].length;
        sellerOrders[_seller].push(_id);
        sellerOpenOrders[_seller].push(_id);

        addrToSeller[_seller].orderCount = sellerOrders[_seller].length;
        addrToSeller[_seller].openCount = sellerOpenOrders[_seller].length;
    }

    function buyOrder(uint256 _orderId) external payable override inited reentrancyGuard {
        require(orders[_orderId].orderType == 1 && orders[_orderId].orderState == 1, "Invalid order ID");
        require(msg.value == orders[_orderId].price, "Must pay the exact price for order");

        _newOrderBuyer(msg.sender, _orderId);
        _fillOrder(msg.sender, _orderId, msg.value);
    }

    function bidForOrder(uint256 _orderId) external payable override inited reentrancyGuard {
        require(orders[_orderId].orderType == 2 && orders[_orderId].orderState == 1, "Invalid order ID");
        if (orders[_orderId].endTime < block.timestamp) {
            _settleAuction(_orderId);
            return;
        }

        require(msg.value >= orders[_orderId].price && msg.value > orders[_orderId].lastBid, "Invalid bid");

        _newOrderBuyer(msg.sender, _orderId);
        if (orders[_orderId].lastBidder != address(0x0)) {
            (bool success, ) = payable(orders[_orderId].lastBidder).call{value: orders[_orderId].lastBid}("");
            require(success || orders[_orderId].lastBidder.isContract(), "Something is wrong in auction");
        }
        orders[_orderId].lastBidder = msg.sender;
        orders[_orderId].lastBid = msg.value;
        orders[_orderId].bids = orders[_orderId].bids.add(1);
        orders[_orderId].updateTime = block.timestamp;
        emit OrderBid(orders[_orderId].sellerAddr, msg.sender, _orderId, msg.value);
    }

    function _newOrderBuyer(address _buyer, uint256 _id) internal {
        if (addrToBuyer[_buyer].buyerAddr == address(0x0)) {
            addrToBuyer[_buyer].index = buyers.length;
            addrToBuyer[_buyer].buyerAddr = _buyer;
            buyers.push(_buyer);
        }

        if (!buyerOrderParticipated[_buyer][_id]) {
            buyerOrderParticipated[_buyer][_id] = true;
            buyerOrders[_buyer].push(_id);
            addrToBuyer[_buyer].orderCount = buyerOrders[_buyer].length;
        }
    }

    function cancelOrder(uint256 _orderId) external override inited reentrancyGuard {
        require(orders[_orderId].orderState == 1, "Invalid order state");
        require(msg.sender == orders[_orderId].sellerAddr, "Only seller can cancel own order");

        if (orders[_orderId].orderType == 2) {
            if (orders[_orderId].endTime < block.timestamp) {
                _settleAuction(_orderId);
                return;
            }
            require(orders[_orderId].lastBidder == address(0x0), "Cannot cancel auction with valid bid");
        }

        _cancelOrder(_orderId);
    }

    function settleAuctionOrder(uint256 _orderId) external override inited reentrancyGuard {
        require(orders[_orderId].orderType == 2 && orders[_orderId].endTime < block.timestamp, "Invalid order ID");

        _settleAuction(_orderId);
    }

    function changeOrderPrice(uint256 _orderId, uint256 _price) external override inited reentrancyGuard {
        require(orders[_orderId].orderState == 1, "Invalid order state");
        require(msg.sender == orders[_orderId].sellerAddr, "Only seller can change own order price");

        if (orders[_orderId].orderType == 2) {
            if (orders[_orderId].endTime < block.timestamp) {
                _settleAuction(_orderId);
                return;
            }
            require(orders[_orderId].lastBidder == address(0x0), "Cannot change auction price with valid bid");
        }

        uint256 oldPrice = orders[_orderId].price;
        orders[_orderId].price = _price;
        orders[_orderId].updateTime = block.timestamp;

        emit OrderPriceChanged(msg.sender, _orderId, oldPrice, _price);
    }

    function _settleAuction(uint256 _id) internal {
        if (msg.value > 0) {
            (bool success, ) = msg.sender.call{value: msg.value}("");
            require(success, "Refund failed in settleAuction");
        }
        if (orders[_id].lastBidder == address(0x0)) {
            _cancelOrder(_id);
        } else {
            _fillOrder(orders[_id].lastBidder, _id, orders[_id].lastBid);
        }
    }

    function _cancelOrder(uint256 _id) internal {
        orders[_id].orderState = 3;
        orders[_id].updateTime = block.timestamp;

        if (openOrderToIndex[_id] != openOrders.length.sub(1)) {
            uint256 index = openOrderToIndex[_id];
            openOrders[index] = openOrders[openOrders.length.sub(1)];
            openOrderToIndex[openOrders[index]] = index;
        }
        openOrderToIndex[_id] = 0;
        openOrders.pop();

        address seller = orders[_id].sellerAddr;
        if (sellerOpenToIndex[seller][_id] != sellerOpenOrders[seller].length.sub(1)) {
            uint256 index = sellerOpenToIndex[seller][_id];
            sellerOpenOrders[seller][index] = sellerOpenOrders[seller][sellerOpenOrders[seller].length.sub(1)];
            sellerOpenToIndex[seller][sellerOpenOrders[seller][index]] = index;
        }
        sellerOpenToIndex[seller][_id] = 0;
        sellerOpenOrders[seller].pop();
        addrToSeller[seller].openCount = sellerOpenOrders[seller].length;

        token.safeTransferFrom(address(this), seller, orders[_id].tokenId, orders[_id].amount, PASAR_DATA_MAGIC);

        emit OrderCanceled(seller, _id);
    }

    function _fillOrder(
        address _buyer,
        uint256 _id,
        uint256 _value
    ) internal {
        orders[_id].orderState = 2;
        orders[_id].buyerAddr = _buyer;
        orders[_id].filled = _value;
        orders[_id].royaltyOwner = token.tokenRoyaltyOwner(orders[_id].tokenId);
        orders[_id].royaltyFee = _value.mul(token.tokenRoyaltyFee(orders[_id].tokenId)).div(RATE_BASE);
        orders[_id].updateTime = block.timestamp;

        if (openOrderToIndex[_id] != openOrders.length.sub(1)) {
            uint256 index = openOrderToIndex[_id];
            openOrders[index] = openOrders[openOrders.length.sub(1)];
            openOrderToIndex[openOrders[index]] = index;
        }
        openOrderToIndex[_id] = 0;
        openOrders.pop();

        address seller = orders[_id].sellerAddr;
        if (sellerOpenToIndex[seller][_id] != sellerOpenOrders[seller].length.sub(1)) {
            uint256 index = sellerOpenToIndex[seller][_id];
            sellerOpenOrders[seller][index] = sellerOpenOrders[seller][sellerOpenOrders[seller].length.sub(1)];
            sellerOpenToIndex[seller][sellerOpenOrders[seller][index]] = index;
        }
        sellerOpenToIndex[seller][_id] = 0;
        sellerOpenOrders[seller].pop();
        addrToSeller[seller].openCount = sellerOpenOrders[seller].length;
        addrToSeller[seller].earned = _value.sub(orders[_id].royaltyFee).add(addrToSeller[seller].earned);
        addrToSeller[seller].royalty = orders[_id].royaltyFee.add(addrToSeller[seller].royalty);

        buyerFilledOrders[_buyer].push(_id);
        addrToBuyer[_buyer].filledCount = buyerFilledOrders[_buyer].length;
        addrToBuyer[_buyer].paid = _value.add(addrToBuyer[_buyer].paid);
        addrToBuyer[_buyer].royalty = orders[_id].royaltyFee.add(addrToBuyer[_buyer].royalty);

        token.safeTransferFrom(address(this), _buyer, orders[_id].tokenId, orders[_id].amount, PASAR_DATA_MAGIC);
        (bool success, ) = payable(orders[_id].royaltyOwner).call{value: orders[_id].royaltyFee}("");
        require(success, "Royalty transfer failed");
        (success, ) = payable(seller).call{value: orders[_id].filled.sub(orders[_id].royaltyFee)}("");
        require(success, "Payment transfer failed");

        emit OrderFilled(seller, _buyer, _id, orders[_id].royaltyOwner, _value, orders[_id].royaltyFee);
    }

    function getTokenAddress() external view override returns (address) {
        return tokenAddress;
    }

    function getOrderCount() external view override returns (uint256) {
        return orders.length;
    }

    function getOrderById(uint256 _orderId) external view override returns (OrderInfo memory) {
        return orders[_orderId];
    }

    function getOrderByIdBatch(uint256[] calldata _orderIds) external view override returns (OrderInfo[] memory) {
        OrderInfo[] memory _orders = new OrderInfo[](_orderIds.length);

        for (uint256 i = 0; i < _orderIds.length; ++i) {
            _orders[i] = orders[_orderIds[i]];
        }

        return _orders;
    }

    function getOpenOrderCount() external view override returns (uint256) {
        return openOrders.length;
    }

    function getOpenOrderByIndex(uint256 _index) external view override returns (OrderInfo memory) {
        return orders[openOrders[_index]];
    }

    function getOpenOrderByIndexBatch(uint256[] calldata _indexes)
        external
        view
        override
        returns (OrderInfo[] memory)
    {
        OrderInfo[] memory _orders = new OrderInfo[](_indexes.length);

        for (uint256 i = 0; i < _indexes.length; ++i) {
            _orders[i] = orders[openOrders[_indexes[i]]];
        }

        return _orders;
    }

    function getSellerCount() external view override returns (uint256) {
        return sellers.length;
    }

    function getSellerByAddr(address _seller) external view override returns (SellerInfo memory) {
        return addrToSeller[_seller];
    }

    function getSellerByIndex(uint256 _index) external view override returns (SellerInfo memory) {
        return addrToSeller[sellers[_index]];
    }

    function getSellerByIndexBatch(uint256[] calldata _indexes) external view override returns (SellerInfo[] memory) {
        SellerInfo[] memory _sellers = new SellerInfo[](_indexes.length);

        for (uint256 i = 0; i < _indexes.length; ++i) {
            _sellers[i] = addrToSeller[sellers[_indexes[i]]];
        }

        return _sellers;
    }

    function getSellerOrderByIndex(address _seller, uint256 _index)
        external
        view
        override
        returns (OrderInfo memory)
    {
        return orders[sellerOrders[_seller][_index]];
    }

    function getSellerOrderByIndexBatch(address _seller, uint256[] calldata _indexes)
        external
        view
        override
        returns (OrderInfo[] memory)
    {
        OrderInfo[] memory _orders = new OrderInfo[](_indexes.length);

        for (uint256 i = 0; i < _indexes.length; ++i) {
            _orders[i] = orders[sellerOrders[_seller][_indexes[i]]];
        }

        return _orders;
    }

    function getSellerOpenByIndex(address _seller, uint256 _index) external view override returns (OrderInfo memory) {
        return orders[sellerOpenOrders[_seller][_index]];
    }

    function getSellerOpenByIndexBatch(address _seller, uint256[] calldata _indexes)
        external
        view
        override
        returns (OrderInfo[] memory)
    {
        OrderInfo[] memory _orders = new OrderInfo[](_indexes.length);

        for (uint256 i = 0; i < _indexes.length; ++i) {
            _orders[i] = orders[sellerOpenOrders[_seller][_indexes[i]]];
        }

        return _orders;
    }

    function getBuyerCount() external view override returns (uint256) {
        return buyers.length;
    }

    function getBuyerByAddr(address _buyer) external view override returns (BuyerInfo memory) {
        return addrToBuyer[_buyer];
    }

    function getBuyerByIndex(uint256 _index) external view override returns (BuyerInfo memory) {
        return addrToBuyer[buyers[_index]];
    }

    function getBuyerByIndexBatch(uint256[] calldata _indexes) external view override returns (BuyerInfo[] memory) {
        BuyerInfo[] memory _buyers = new BuyerInfo[](_indexes.length);

        for (uint256 i = 0; i < _indexes.length; ++i) {
            _buyers[i] = addrToBuyer[buyers[_indexes[i]]];
        }

        return _buyers;
    }

    function getBuyerOrderByIndex(address _buyer, uint256 _index) external view override returns (OrderInfo memory) {
        return orders[buyerOrders[_buyer][_index]];
    }

    function getBuyerOrderByIndexBatch(address _buyer, uint256[] calldata _indexes)
        external
        view
        override
        returns (OrderInfo[] memory)
    {
        OrderInfo[] memory _orders = new OrderInfo[](_indexes.length);

        for (uint256 i = 0; i < _indexes.length; ++i) {
            _orders[i] = orders[buyerOrders[_buyer][_indexes[i]]];
        }

        return _orders;
    }

    function getBuyerFilledByIndex(address _buyer, uint256 _index) external view override returns (OrderInfo memory) {
        return orders[buyerFilledOrders[_buyer][_index]];
    }

    function getBuyerFilledByIndexBatch(address _buyer, uint256[] calldata _indexes)
        external
        view
        override
        returns (OrderInfo[] memory)
    {
        OrderInfo[] memory _orders = new OrderInfo[](_indexes.length);

        for (uint256 i = 0; i < _indexes.length; ++i) {
            _orders[i] = orders[buyerFilledOrders[_buyer][_indexes[i]]];
        }

        return _orders;
    }
}
