pragma solidity ^0.4.22;
// https://medium.com/daox/three-methods-to-transfer-funds-in-ethereum-by-means-of-solidity-5719944ed6e9

contract Ribbit {
    uint public version;
    address public owner;
    address public previousContractAddress; 
    Ribbit public previousContract;
    uint public donationBar; // in wei
    uint public upvoteBar;
    uint public developerIncomePercent; // 10% by default
    mapping (bytes32 => address) public usernameToAddressMap;  // @shd101wyy and @Shd101wyy are the same
    mapping (address => bytes32) public addressToUsernameMap;

    uint public accountsNum; // number of accounts
    mapping (address => uint) public addressToAccountNoMap;
    mapping (uint => address) accountNoToAddressMap;

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
     * 0x0 => likes
     * 0x1 => dislikes
     * 0x2 => reports
     * tagHash => field => value
     */
    mapping (bytes32 => mapping(uint => uint)) public tagState;

    /**
     * 0x0 => likes
     * 0x1 => dislikes
     * 0x2 => reports
     * userAddress => field => value
     */
    mapping (address => mapping(uint => uint)) public userState;

    /**
     * User metadata.
     * For example, user name, profileImage, cover...
     */
    mapping (address => string) public metaDataJSONStringMap;  
    
    /**
     * uint[2] here 
     *     [0] => block.number
     *     [1] => hash (sha256 hash) || timestamp
     */
    mapping (address => uint[2]) public currentFeedInfoMap;
    mapping (bytes32 => uint[2]) public currentTagInfoByTimeMap;
    mapping (bytes32 => uint[2]) public currentTagInfoByTrendMap;

    constructor(address _previousContractAddress, uint _version, uint _developerIncomePercent) public {
        owner = msg.sender;
        version = _version;
        previousContractAddress = _previousContractAddress;
        if (_previousContractAddress != address(0)) {
            previousContract = Ribbit(_previousContractAddress);
        }

        developerIncomePercent = _developerIncomePercent;
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

    function setUsernameAndMetaDataJSONString(bytes32 username, string value) external {
        require(getAddressFromUsername(username) == address(0)); // <= make sure the username is not taken.
        if (getUsernameFromAddress(msg.sender) == 0x0) { // This is a new account
            accountsNum += 1; 
            addressToAccountNoMap[msg.sender] = accountsNum;
            accountNoToAddressMap[accountsNum] = msg.sender;
        }
        usernameToAddressMap[username] = msg.sender;
        addressToUsernameMap[msg.sender] = username;
        metaDataJSONStringMap[msg.sender] = value;
    }
    
    function getState(bytes32 transactionHash, uint field) external view returns (uint)  {
        uint value = state[transactionHash][field];
        if (previousContractAddress != address(0)) {
            value = value + previousContract.getState(transactionHash, field);
        }
        return value;
    }
    function getUserState(address userAddress, uint field) external view returns (uint) {
        uint value = userState[userAddress][field];
        if (previousContractAddress != address(0)) {
            value = value + previousContract.getUserState(userAddress, field);
        }
        return value;
    }
    function getTagState(bytes32 tag, uint field) external view returns (uint) {
        uint value = tagState[tag][field];
        if (previousContractAddress != address(0)) {
            value = value + previousContract.getTagState(tag, field);
        }
        return value;
    }
    function setMetaDataJSONStringValue(string value) external {
        metaDataJSONStringMap[msg.sender] = value;
    }
    function getMetaDataJSONStringValue(address addr) external view returns (string) {
        bytes memory testValue = bytes(metaDataJSONStringMap[addr]);
        if (testValue.length == 0 && previousContractAddress != address(0)) { // read from previousContract
            return previousContract.getMetaDataJSONStringValue(addr);
        } else {
            return metaDataJSONStringMap[addr];
        }
    }
    function getCurrentFeedInfo(address authorAddress) external view returns (uint[2]) {
        if (currentFeedInfoMap[authorAddress][0] == 0 && previousContractAddress != address(0)) { // read from previousContract
            return previousContract.getCurrentFeedInfo(authorAddress);
        } else {
            return currentFeedInfoMap[authorAddress];
        }
    }
    function getCurrentTagInfoByTime(bytes32 tag) external view returns (uint[2]) {
        if (currentTagInfoByTimeMap[tag][0] == 0 && previousContractAddress != address(0)) { // read from previousContract
            return previousContract.getCurrentTagInfoByTime(tag);
        } else {
            return currentTagInfoByTimeMap[tag];
        }
    }
    function getCurrentTagInfoByTrend(bytes32 tag) external view returns (uint[2]) {
        if (currentTagInfoByTrendMap[tag][0] == 0 && previousContractAddress != address(0)) { // read from previousContract
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
    
    // Post Feed 
    event SavePreviousFeedInfoEvent(uint[2] previousFeedInfo);
    event SavePreviousTagInfoByTimeEvent(uint[2] previousTagInfo, bytes32 tag);
    event SavePreviousTagInfoByTrendEvent(uint[2] previousTagInfo, bytes32 tag);
    function post(uint timestamp, string message, uint messageHash, bytes32 previousFeedTransactionHash, bytes32[] tags) external {
        emit SavePreviousFeedInfoEvent(currentFeedInfoMap[msg.sender]);
        uint blockNumber = block.number;
        currentFeedInfoMap[msg.sender][0] = blockNumber;
        currentFeedInfoMap[msg.sender][1] = messageHash;

        bytes32 tag;
        uint i;
        for (i = 0; i < tags.length; i++) {
            tag = tags[i];
            emit SavePreviousTagInfoByTimeEvent(currentTagInfoByTimeMap[tag], tag);
            currentTagInfoByTimeMap[tag][0] = blockNumber;
            currentTagInfoByTimeMap[tag][1] = messageHash;
            
            if (tag >> 160 != 0x0) { // this tag is not a user address.
                emit SavePreviousTagInfoByTrendEvent(currentTagInfoByTrendMap[tag], tag);
                currentTagInfoByTrendMap[tag][0] = blockNumber;
                currentTagInfoByTrendMap[tag][1] = messageHash;
            }
        }
    }

    // Repost Feed => Upvote
    event DonateEvent(uint value);
    function upvote(uint timestamp, bytes32 parentTransactionHash, bytes32 previousFeedTransactionHash, bytes32[] tags, address authorAddress) external payable {
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

        emit SavePreviousFeedInfoEvent(currentFeedInfoMap[msg.sender]);
        uint blockNumber = block.number;
        currentFeedInfoMap[msg.sender][0] = blockNumber;
        currentFeedInfoMap[msg.sender][1] = timestamp;

        state[parentTransactionHash][1] = state[parentTransactionHash][1] + 1; // increase number of upvotes.

        bytes32 tag;
        for (uint i = 0; i < tags.length; i++) {
            tag = tags[i];
            if (tag >> 160 == 0) { // it's a user address, notify that user that someone likes his post & reply.
                emit SavePreviousTagInfoByTimeEvent(currentTagInfoByTimeMap[tag], tag);
                currentTagInfoByTimeMap[tag][0] = blockNumber;
                currentTagInfoByTimeMap[tag][1] = timestamp;
            } else if ( isDonation ||                                                        // for donation, we pop that to trend directly
                        state[parentTransactionHash][1] >= state[parentTransactionHash][2] + upvoteBar   // upvotes >= downvotes.
            ) {
                emit SavePreviousTagInfoByTrendEvent(currentTagInfoByTrendMap[tag], tag);
                currentTagInfoByTrendMap[tag][0] = blockNumber;
                currentTagInfoByTrendMap[tag][1] = timestamp;
            }
        }
    }

    // Downvote
    // Downvote will affect trend. See function above
    function downvote(bytes32 transactionHash) external {
        state[transactionHash][2] = state[transactionHash][2] + 1;
    }
    
    // Reply
    // mode:
    //  0x0: do nothing
    //  0x1: upvote
    //  0x2: downvote
    //  0x3: donate
    function reply(uint timestamp, bytes32 parentTransactionHash, bytes32 previousReplyTransactionHash, string message, uint messageHash, bytes32[] tags, uint8 mode, address authorAddress) external payable {
        if (authorAddress != address(0)) {
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

        uint blockNumber = block.number;
        state[parentTransactionHash][3] = state[parentTransactionHash][3] + 1; // increase number of replies

        if (mode == 1 || mode == 3) { // upvote or donate
            state[parentTransactionHash][1] = state[parentTransactionHash][1] + 1; // increase number of upvotes
            emit SavePreviousFeedInfoEvent(currentFeedInfoMap[msg.sender]);        // display in timeline
            currentFeedInfoMap[msg.sender][0] = blockNumber;
            currentFeedInfoMap[msg.sender][1] = messageHash;
        } else if (mode == 2) {
            state[parentTransactionHash][2] = state[parentTransactionHash][2] + 1; // increase number of downvotes
        }

        bytes32 tag;
        for (uint i = 0; i < tags.length; i++) {
            tag = tags[i];
            if (tag >> 160 == 0) { // it's a user address
                emit SavePreviousTagInfoByTimeEvent(currentTagInfoByTimeMap[tag], tag);
                currentTagInfoByTimeMap[tag][0] = blockNumber;
                currentTagInfoByTimeMap[tag][1] = messageHash;
            } else if (mode == 3 ||  // is donation.
                      (mode != 2 && state[parentTransactionHash][1] >= state[parentTransactionHash][2] + upvoteBar)   // not downvote, and upvotes >= downvotes.
            ){
                emit SavePreviousTagInfoByTrendEvent(currentTagInfoByTrendMap[tag], tag);
                currentTagInfoByTrendMap[tag][0] = blockNumber;
                currentTagInfoByTrendMap[tag][1] = messageHash;
            }
        }

        // here we use parentTransactionHash as tag.
        // Drawback: there might be collision with the real tag, but we just ignore it.
        emit SavePreviousTagInfoByTimeEvent(currentTagInfoByTimeMap[parentTransactionHash], parentTransactionHash);
        currentTagInfoByTimeMap[parentTransactionHash][0] = blockNumber;
        currentTagInfoByTimeMap[parentTransactionHash][1] = messageHash;

        emit SavePreviousTagInfoByTrendEvent(currentTagInfoByTrendMap[parentTransactionHash], parentTransactionHash);
        currentTagInfoByTrendMap[parentTransactionHash][0] = blockNumber;
        currentTagInfoByTrendMap[parentTransactionHash][1] = messageHash;
    }

    // Report
    function report(bytes32 transactionHash) external {
        state[transactionHash][4] = state[transactionHash][4] + 1;
    }

    // Upvote tag
    function upvoteTag(bytes32 tag) external {
        tagState[tag][0] = tagState[tag][0] + 1;
    }

    // Downvote tag
    function downvoteTag(bytes32 tag) external {
        tagState[tag][1] = tagState[tag][1] + 1;
    }

    // Report tag
    function reportTag(bytes32 tag) external {
        tagState[tag][2] = tagState[tag][2] + 1;
    }

    // Upvote user
    function upvoteUser(address userAddress) external {
        userState[userAddress][0] = userState[userAddress][0] + 1;
    }

    // Downvote user
    function downvoteUser(address userAddress) external {
        userState[userAddress][1] = userState[userAddress][1] + 1;
    }
    
    // Report user
    function reportUser(address userAddress) external {
        userState[userAddress][2] = userState[userAddress][2] + 1;
    }    
}