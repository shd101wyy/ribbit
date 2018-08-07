pragma solidity ^0.4.22;
// https://medium.com/daox/three-methods-to-transfer-funds-in-ethereum-by-means-of-solidity-5719944ed6e9

interface Ribbit {
    function transferOwnership(address addr) external;
    function transferAccount(address from, address to) external;
    function getUsernameFromAddress(address addr) external view returns (bytes32);
    function getAddressFromUsername(bytes32 username) external view returns (address);
    function getAccountsNum() external view returns (uint256);
    function getAccountNoFromAddress(address addr) external view returns (uint256);
    function getAddressFromAccountNo(uint256 n) external view returns (address);
    function setUsernameAndMetadataJSONString(bytes32 username, string value) external;
    function getState(bytes32 transactionHash, uint256 field) external view returns (uint256);
    function setMetadataJSONStringValue(string value) external;
    function getMetadataJSONStringValue(address addr) external view returns (string);
    function getCurrentFeedInfo(address authorAddress) external view returns (uint256);
    function getCurrentTagInfoByTime(bytes32 tag) external view returns (uint256);
    function getCurrentTagInfoByTrend(bytes32 tag) external view returns (uint256);
    function setDonationBar(uint256 _donationBar) external;
    function setUpvoteBar(uint256 _upvoteBar) external;
    function setDeveloperIncomePercent(uint256 _percent) external;
    function setReportDownvoteEqNum(uint256 _reportDownvoteEqNum) external;
    event SavePreviousFeedInfoEvent(uint256 previousFeedInfoBN);
    event SavePreviousTagInfoByTimeEvent(uint256 previousTagInfoBN, bytes32 tag);
    event SavePreviousTagInfoByTrendEvent(uint256 previousTagInfoBN, bytes32 tag);
    function post(uint256 timestamp, string message, bytes32[] tags) external;
    event DonateEvent(uint256 value);
    function upvote(uint256 timestamp, bytes32 parentTransactionHash, bytes32[] tags, bool repost, address authorAddress) external payable;
    function downvote(bytes32 transactionHash, bool repost) external;
    function reply(uint256 timestamp, bytes32 parentTransactionHash, string message, bytes32[] tags, bool repost) external;
    function report(bytes32 transactionHash) external;
    function withdraw(uint256 amount) external returns(bool);
}

contract RibbitV1 {
    uint32 public version;
    address public owner;
    address public previousContractAddress; 
    Ribbit public previousContract;
    uint256 public donationBar; // in wei
    uint16 public upvoteBar;
    uint8 public developerIncomePercent;                        // 10% by default
    uint16 public reportDownvoteEqNum;                           // 1 report = 1 downvote by default
    mapping (bytes32 => address) public usernameToAddressMap;
    mapping (address => bytes32) public addressToUsernameMap;

    uint64 public accountsNum; // number of accounts
    mapping (address => uint64) public addressToAccountNoMap;
    mapping (uint64 => address) public accountNoToAddressMap;

    /** 
     * 0x0 => earnings in (wei)
     * 0x1 => upvotes 
     * 0x2 => downvotes
     * 0x3 => replies
     * 0x4 => reports
     * 
     * transactionHash => field => value
     */
    mapping (bytes32 => mapping(uint8 => uint256)) public state;

    /**
     * User metadata.
     * For example, user name, profileImage, cover...
     */
    mapping (address => string) public metadataJSONStringMap;
    mapping (address => bytes32) public metadataJSONBytes32Map;
    
    /**
     * uint => block number
     */
    mapping (address => uint256) public currentFeedInfoMap;
    mapping (bytes32 => uint256) public currentTagInfoByTrendMap;

    // 0x0000000000000000000000000000000000000000, 0, 10
    constructor(address _previousContractAddress, uint32 _version, uint8 _developerIncomePercent) public {
        owner = msg.sender;
        version = _version;
        previousContractAddress = _previousContractAddress;
        if (_previousContractAddress != address(0)) {
            previousContract = Ribbit(_previousContractAddress);
        }

        developerIncomePercent = _developerIncomePercent;
    }

    function transferOwnership(address addr) external {
        require(msg.sender == owner);
        owner = addr;
    }

    function transferAccount(address from, address to) external {
        require(msg.sender == owner);
        bytes32 username = getUsernameFromAddress(from);
        usernameToAddressMap[username] = to;
        addressToUsernameMap[to] = username;
        metadataJSONStringMap[to] = getMetadataJSONStringValue(from);

        accountsNum = getAccountsNum() + 1; 
        addressToAccountNoMap[to] = accountsNum;
        accountNoToAddressMap[accountsNum] = to;

        currentFeedInfoMap[to] = uint256(from); // here we save the address of inherited account.
    }

    function getUsernameFromAddress(address addr) public view returns (bytes32) {
        bytes32 username = addressToUsernameMap[addr];
        if (username == 0 && previousContractAddress != address(0)) {
            return previousContract.getUsernameFromAddress(addr);
        } else {
            return username;
        }
    }

    function getAddressFromUsername(bytes32 username) public view returns (address) {
        address addr = usernameToAddressMap[username];
        if (addr == address(0) && previousContractAddress != address(0)) {
            return previousContract.getAddressFromUsername(username);
        } else {
            return addr;
        }
    }

    function getAccountsNum() public view returns (uint64) {
        if (accountsNum == 0 && previousContractAddress != address(0)) {
            return uint64(previousContract.getAccountsNum());
        } else {
            return accountsNum;
        }
    }

    function getAccountNoFromAddress(address addr) public view returns (uint64) {
        uint64 n = addressToAccountNoMap[addr];
        if (n == 0 && previousContractAddress != address(0)) {
            return uint64(previousContract.getAccountNoFromAddress(addr));
        } else {
            return n;
        }
    }

    function getAddressFromAccountNo(uint64 n) public view returns (address) {
        address addr = accountNoToAddressMap[n];
        if (addr == address(0) && previousContractAddress != address(0)) {
            return previousContract.getAddressFromAccountNo(n);
        } else {
            return addr;
        }
    }

    function setUsernameAndMetadataJSONString(bytes32 username, string value) public {
        require(getAddressFromUsername(username) == address(0)); // <= make sure the username is not taken.
        if (getUsernameFromAddress(msg.sender) == 0x0) { // This is a new account
            accountsNum = getAccountsNum() + 1; 
            addressToAccountNoMap[msg.sender] = accountsNum;
            accountNoToAddressMap[accountsNum] = msg.sender;
        }
        usernameToAddressMap[username] = msg.sender;
        addressToUsernameMap[msg.sender] = username;
        metadataJSONStringMap[msg.sender] = value;
    }
    
    function getState(bytes32 transactionHash, uint8 field) external view returns (uint256)  {
        uint256 value = state[transactionHash][field];
        if (previousContractAddress != address(0)) {
            value = value + previousContract.getState(transactionHash, field);
        }
        return value;
    }

    function setMetadataJSONStringValue(string value) external {
        metadataJSONStringMap[msg.sender] = value;
    }
    function getMetadataJSONStringValue(address addr) public view returns (string) {
        bytes memory testValue = bytes(metadataJSONStringMap[addr]);
        if (testValue.length == 0 && previousContractAddress != address(0)) { // read from previousContract
            return previousContract.getMetadataJSONStringValue(addr);
        } else {
            return metadataJSONStringMap[addr];
        }
    }
    function setMetadataJSONBytes32Value(bytes32 value) external {
        metadataJSONBytes32Map[msg.sender] = value;
    }
    function getMetadataJSONBytes32Value(address addr) public view returns (bytes32) {
        return  metadataJSONBytes32Map[addr]; // this function has no previousContract for now
    }
    function getCurrentFeedInfo(address authorAddress) public view returns (uint256) {
        return currentFeedInfoMap[authorAddress];
    }
    function getCurrentTagInfoByTrend(bytes32 tag) public view returns (uint256) {
        return currentTagInfoByTrendMap[tag];
    }
    function setDonationBar(uint256 _donationBar) external {
        require(msg.sender == owner);
        donationBar = _donationBar;
    }
    function setUpvoteBar(uint16 _upvoteBar) external {
        require(msg.sender == owner);
        upvoteBar = _upvoteBar;
    }
    function setDeveloperIncomePercent(uint8 _percent) external {
        require(msg.sender == owner);
        developerIncomePercent = _percent;
    }
    function setReportDownvoteEqNum(uint16 _reportDownvoteEqNum) external {
        require(msg.sender == owner);
        reportDownvoteEqNum = _reportDownvoteEqNum;
    }
    
    // Post Feed 
    event SavePreviousFeedInfoEvent(uint256 previousFeedInfoBN);
    event SavePreviousTagInfoEvent(uint256 previousTagInfoBN, bytes32 tag);
    function post(bytes32 digest, uint8 hashFunction, uint8 size, bytes32[] tags) external {
        emit SavePreviousFeedInfoEvent(currentFeedInfoMap[msg.sender]);
        currentFeedInfoMap[msg.sender] = block.number;

        bytes32 tag;
        uint8 i;
        for (i = 0; i < tags.length; i++) {
            tag = tags[i];
            emit SavePreviousTagInfoEvent(currentTagInfoByTrendMap[tag], tag);
            currentTagInfoByTrendMap[tag] = block.number;
        }
    }

    // Repost Feed => Upvote
    event DonateEvent(uint256 value);
    function upvote(bytes32 parentTransactionHash, bytes32[] tags, bool repost, address authorAddress) external payable {
        bool isDonation = (authorAddress != address(0)); 
        if (isDonation) {
            require(msg.value > donationBar);
            // donate:
            // 0.9 to author
            // 0.1 to developer
            state[parentTransactionHash][0] = state[parentTransactionHash][0] + msg.value;
            emit DonateEvent(msg.value);
            uint256 unit = msg.value / 100;
            authorAddress.transfer(unit * (100 - developerIncomePercent));
            owner.transfer(unit * developerIncomePercent);
        }

        if (repost) {
            emit SavePreviousFeedInfoEvent(currentFeedInfoMap[msg.sender]);
            currentFeedInfoMap[msg.sender] = block.number;
        }

        state[parentTransactionHash][1] = state[parentTransactionHash][1] + 1; // increase number of upvotes.

        bytes32 tag;
        for (uint8 i = 0; i < tags.length; i++) {
            tag = tags[i];
            if (tag >> 160 == 0x0 ||  // it's a user address, notify that user that someone likes his post & reply.
                isDonation ||         // for donation, we pop that to trend directly
                state[parentTransactionHash][1] >= state[parentTransactionHash][2] + upvoteBar   // upvotes >= downvotes.
            ) {
                emit SavePreviousTagInfoEvent(currentTagInfoByTrendMap[tag], tag);
                currentTagInfoByTrendMap[tag] = block.number;
            }
        }
    }

    // Downvote
    // Downvote will affect trend. See function above
    function downvote(bytes32 transactionHash, bool repost) external {
        state[transactionHash][2] = state[transactionHash][2] + 1;
        if (repost) {
            emit SavePreviousFeedInfoEvent(currentFeedInfoMap[msg.sender]);
            currentFeedInfoMap[msg.sender] = block.number;
        }
    }
    
    // Reply
    function reply(bytes32 parentTransactionHash, bytes32 digest, uint8 hashFunction, uint8 size, bytes32[] tags, bool repost) external {
        if (repost) {
            emit SavePreviousFeedInfoEvent(currentFeedInfoMap[msg.sender]);
            currentFeedInfoMap[msg.sender] = block.number;
        }

        state[parentTransactionHash][3] = state[parentTransactionHash][3] + 1; // increase number of replies
        bytes32 tag;
        uint8 i;
        for (i = 0; i < tags.length; i++) {
            tag = tags[i];
            emit SavePreviousTagInfoEvent(currentTagInfoByTrendMap[tag], tag);
            currentTagInfoByTrendMap[tag] = block.number;
        }

        // here we use parentTransactionHash as tag.
        // Drawback: there might be collision with the real tag, but we just ignore it.
        emit SavePreviousTagInfoEvent(currentTagInfoByTrendMap[parentTransactionHash], parentTransactionHash);
        currentTagInfoByTrendMap[parentTransactionHash] = block.number;
    }

    // Report
    function report(bytes32 transactionHash) external {
        state[transactionHash][4] = state[transactionHash][4] + 1;                     // report
        state[transactionHash][2] = state[transactionHash][2] + reportDownvoteEqNum;   // downvote
    }

    // Withdraw funds
    function withdraw(uint256 amount) external returns(bool) {
        require(msg.sender == owner);
        owner.transfer(amount);
        return true;
    }
}