pragma solidity ^0.4.22;
// https://medium.com/daox/three-methods-to-transfer-funds-in-ethereum-by-means-of-solidity-5719944ed6e9

contract Ribbit {
    uint public version;
    address public owner;
    address public previousContractAddress; 
    Ribbit public previousContract;
    uint public donationBar; // in wei
    uint public upvoteBar;
    uint public developerIncomePercent;                        // 10% by default
    uint public reportDownvoteEqNum;                           // 1 report = 1 downvote by default
    mapping (bytes32 => address) public usernameToAddressMap;
    mapping (address => bytes32) public addressToUsernameMap;

    uint public accountsNum; // number of accounts
    mapping (address => uint) public addressToAccountNoMap;
    mapping (uint => address) public accountNoToAddressMap;

    /** 
     * 0x0 => earnings in (wei)
     * 0x1 => upvotes 
     * 0x2 => downvotes
     * 0x3 => replies
     * 0x4 => reports
     * 
     * transactionHash => field => value
     */
    mapping (bytes32 => mapping(uint => uint)) public state;

    /**
     * User metadata.
     * For example, user name, profileImage, cover...
     */
    mapping (address => string) public metadataJSONStringMap;  
    
    /**
     * uint => block number
     */
    mapping (address => uint) public currentFeedInfoMap;
    mapping (bytes32 => uint) public currentTagInfoByTimeMap;
    mapping (bytes32 => uint) public currentTagInfoByTrendMap;

    // 0x0000000000000000000000000000000000000000, 0, 10
    constructor(address _previousContractAddress, uint _version, uint _developerIncomePercent) public {
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

        currentFeedInfoMap[to] = uint(from); // here we save the address inherited account.
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

    function getAccountsNum() public view returns (uint) {
        if (accountsNum == 0 && previousContractAddress != address(0)) {
            return previousContract.getAccountsNum();
        } else {
            return accountsNum;
        }
    }

    function getAccountNoFromAddress(address addr) public view returns (uint) {
        uint n = addressToAccountNoMap[addr];
        if (n == 0 && previousContractAddress != address(0)) {
            return previousContract.getAccountNoFromAddress(addr);
        } else {
            return n;
        }
    }

    function getAddressFromAccountNo(uint n) public view returns (address) {
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
    
    function getState(bytes32 transactionHash, uint field) external view returns (uint)  {
        uint value = state[transactionHash][field];
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
    function getCurrentFeedInfo(address authorAddress) external view returns (uint) {
        if (currentFeedInfoMap[authorAddress] == 0 && previousContractAddress != address(0)) { // read from previousContract
            return previousContract.getCurrentFeedInfo(authorAddress);
        } else {
            return currentFeedInfoMap[authorAddress];
        }
    }
    function getCurrentTagInfoByTime(bytes32 tag) external view returns (uint) {
        if (currentTagInfoByTimeMap[tag] == 0 && previousContractAddress != address(0)) { // read from previousContract
            return previousContract.getCurrentTagInfoByTime(tag);
        } else {
            return currentTagInfoByTimeMap[tag];
        }
    }
    function getCurrentTagInfoByTrend(bytes32 tag) external view returns (uint) {
        if (currentTagInfoByTrendMap[tag] == 0 && previousContractAddress != address(0)) { // read from previousContract
            return previousContract.getCurrentTagInfoByTrend(tag);
        } else {
            return currentTagInfoByTrendMap[tag];
        }
    }

    function setDonationBar(uint _donationBar) external {
        require(msg.sender == owner);
        donationBar = _donationBar;
    }

    function setUpvoteBar(uint _upvoteBar) external {
        require(msg.sender == owner);
        upvoteBar = _upvoteBar;
    }

    function setDeveloperIncomePercent(uint _percent) external {
        require(msg.sender == owner);
        developerIncomePercent = _percent;
    }

    function setReportDownvoteEqNum(uint _reportDownvoteEqNum) external {
        require(msg.sender == owner);
        reportDownvoteEqNum = _reportDownvoteEqNum;
    }
    
    // Post Feed 
    event SavePreviousFeedInfoEvent(uint previousFeedInfoBN);
    event SavePreviousTagInfoByTimeEvent(uint previousTagInfoBN, bytes32 tag);
    event SavePreviousTagInfoByTrendEvent(uint previousTagInfoBN, bytes32 tag);
    function post(uint timestamp, string message, bytes32[] tags) external {
        emit SavePreviousFeedInfoEvent(currentFeedInfoMap[msg.sender]);
        currentFeedInfoMap[msg.sender] = block.number;

        bytes32 tag;
        uint i;
        for (i = 0; i < tags.length; i++) {
            tag = tags[i];
            emit SavePreviousTagInfoByTimeEvent(currentTagInfoByTimeMap[tag], tag);
            currentTagInfoByTimeMap[tag] = block.number;
            
            if (tag >> 160 != 0x0) { // this tag is not a user address.
                emit SavePreviousTagInfoByTrendEvent(currentTagInfoByTrendMap[tag], tag);
                currentTagInfoByTrendMap[tag] = block.number;
            }
        }
    }

    // Repost Feed => Upvote
    event DonateEvent(uint value);
    function upvote(uint timestamp, bytes32 parentTransactionHash, bytes32[] tags, bool repost, address authorAddress) external payable {
        bool isDonation = (authorAddress != address(0)); 
        if (isDonation) {
            require(msg.value > donationBar);
            // donate:
            // 0.9 to author
            // 0.1 to developer
            state[parentTransactionHash][0] = state[parentTransactionHash][0] + msg.value;
            emit DonateEvent(msg.value);
            uint unit = msg.value / 100;
            authorAddress.transfer(unit * (100 - developerIncomePercent));
            owner.transfer(unit * developerIncomePercent);
        }

        if (repost) {
            emit SavePreviousFeedInfoEvent(currentFeedInfoMap[msg.sender]);
            currentFeedInfoMap[msg.sender] = block.number;
        }

        state[parentTransactionHash][1] = state[parentTransactionHash][1] + 1; // increase number of upvotes.

        bytes32 tag;
        for (uint i = 0; i < tags.length; i++) {
            tag = tags[i];
            if (tag >> 160 == 0x0) { // it's a user address, notify that user that someone likes his post & reply.
                emit SavePreviousTagInfoByTimeEvent(currentTagInfoByTimeMap[tag], tag);
                currentTagInfoByTimeMap[tag] = block.number;
            } else if ( isDonation ||                                                        // for donation, we pop that to trend directly
                        state[parentTransactionHash][1] >= state[parentTransactionHash][2] + upvoteBar   // upvotes >= downvotes.
            ) {
                emit SavePreviousTagInfoByTrendEvent(currentTagInfoByTrendMap[tag], tag);
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
    function reply(uint timestamp, bytes32 parentTransactionHash, string message, bytes32[] tags, bool repost) external {
        if (repost) {
            emit SavePreviousFeedInfoEvent(currentFeedInfoMap[msg.sender]);
            currentFeedInfoMap[msg.sender] = block.number;
        }

        state[parentTransactionHash][3] = state[parentTransactionHash][3] + 1; // increase number of replies
        bytes32 tag;
        uint i;
        for (i = 0; i < tags.length; i++) {
            tag = tags[i];
            emit SavePreviousTagInfoByTimeEvent(currentTagInfoByTimeMap[tag], tag);
            currentTagInfoByTimeMap[tag] = block.number;
            
            if (tag >> 160 != 0x0) { // this tag is not a user address.
                emit SavePreviousTagInfoByTrendEvent(currentTagInfoByTrendMap[tag], tag);
                currentTagInfoByTrendMap[tag] = block.number;
            }
        }

        // here we use parentTransactionHash as tag.
        // Drawback: there might be collision with the real tag, but we just ignore it.
        emit SavePreviousTagInfoByTimeEvent(currentTagInfoByTimeMap[parentTransactionHash], parentTransactionHash);
        currentTagInfoByTimeMap[parentTransactionHash] = block.number;

        emit SavePreviousTagInfoByTrendEvent(currentTagInfoByTrendMap[parentTransactionHash], parentTransactionHash);
        currentTagInfoByTrendMap[parentTransactionHash] = block.number;
    }

    // Report
    function report(bytes32 transactionHash) external {
        state[transactionHash][4] = state[transactionHash][4] + 1;                     // report
        state[transactionHash][2] = state[transactionHash][2] + reportDownvoteEqNum;   // downvote
    }

    // Withdraw funds
    function withdraw(uint amount) external returns(bool) {
        require(msg.sender == owner);
        owner.transfer(amount);
        return true;
    }
}