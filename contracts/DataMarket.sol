// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DataMarket {
    struct Dataset {
        address seller;
        string uri; // IPFS CID or URL
        uint256 priceWei;
        bool active;
    }

    uint256 public nextId;
    mapping(uint256 => Dataset) public datasets;
    mapping(uint256 => mapping(address => bool)) public hasAccess; // datasetId => buyer => access

    event Listed(uint256 indexed id, address indexed seller, string uri, uint256 priceWei);
    event Purchased(uint256 indexed id, address indexed buyer, uint256 priceWei);
    event Delisted(uint256 indexed id);

    function list(string calldata uri, uint256 priceWei) external returns (uint256 id) {
        require(priceWei > 0, "price=0");
        id = ++nextId;
        datasets[id] = Dataset({seller: msg.sender, uri: uri, priceWei: priceWei, active: true});
        emit Listed(id, msg.sender, uri, priceWei);
    }

    function delist(uint256 id) external {
        Dataset storage d = datasets[id];
        require(d.seller == msg.sender, "not seller");
        require(d.active, "inactive");
        d.active = false;
        emit Delisted(id);
    }

    function buy(uint256 id) external payable {
        Dataset storage d = datasets[id];
        require(d.active, "inactive");
        require(msg.value == d.priceWei, "bad price");
        hasAccess[id][msg.sender] = true;
        (bool ok, ) = d.seller.call{value: msg.value}("");
        require(ok, "pay fail");
        emit Purchased(id, msg.sender, msg.value);
    }

    function canAccess(uint256 id, address user) external view returns (bool) {
        Dataset storage d = datasets[id];
        return user == d.seller || hasAccess[id][user];
    }
}


