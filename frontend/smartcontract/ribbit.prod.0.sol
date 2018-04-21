pragma solidity ^0.4.0;
// https://medium.com/daox/three-methods-to-transfer-funds-in-ethereum-by-means-of-solidity-5719944ed6e9

contract Ribbit {
    address public owner;
    address public previousContractAddress; 
    /**
     * 0x0 => earnings
     * 0x1 => likes 
     * 0x2 => dislikes
     * 0x3 => reports
     * 0x4 => replies
     * 0x5 => reposts
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
     * For example, user displayName, profileImage, cover...
     */
    mapping (address => string) public metaDataJSONStringMap;  
    
    /**
     * uint[2] here 
     *     [0] => block.number
     *     [1] => hash (sha256 hash) || transactionHash if block.number == 0
     */
    mapping (address => uint[2]) public currentFeedInfoMap;
    mapping (bytes32 => uint[2]) public currentReplyInfoMap;
    // mapping (address => uint[2]) public currentMentionInfoMap; // => combined with currentTagInfoByTimeMap;
    mapping (bytes32 => uint[2]) public currentTagInfoByTimeMap;
    mapping (bytes32 => uint[2]) public currentTagInfoByTrendMap;

    constructor(address previousContractAddr) public {
        owner = msg.sender;
        previousContractAddress = previousContractAddr;
    }
    /*
    // These two functions are not safe
    function updateState(bytes32 transactionHash, uint field, uint value) external {
        state[transactionHash][field] = state[transactionHash][field] + value;
    }
    function multipleState(bytes32 transactionHash, uint[] fieldsAndValues) external {
        for (uint i = 0; i < fieldsAndValues.length; i += 2) {
            state[transactionHash][fieldsAndValues[i]] = state[transactionHash][fieldsAndValues[i]] + fieldsAndValues[i+1];
        }
    }
    function increaseStateFieldsByOne(bytes32 transactionHash, uint[] fields) external {
        for (uint i = 0; i < fields.length; i++) {
            uint field = fields[i];
            state[transactionHash][field] = state[transactionHash][field] + 1;
        } 
    }
    */
    function getState(bytes32 transactionHash, uint field) external constant returns (uint)  {
        return state[transactionHash][field];
    }
    function setMetaDataJSONStringMap(string value) external {
        metaDataJSONStringMap[msg.sender] = value;
    }
    function getMetaDataJSONStringValue(address addr) external constant returns (string) {
        return metaDataJSONStringMap[addr];
    }
    function getCurrentFeedInfo(address authorAddress) external constant returns (uint[2]) {
        return currentFeedInfoMap[authorAddress];
    }
    function getCurrentTagInfoByTime(bytes32 tag) external constant returns (uint[2]) {
        return currentTagInfoByTimeMap[tag];
    }
    function getCurrentTagInfoByTrend(bytes32 tag) external constant returns (uint[2]) {
        return currentTagInfoByTrendMap[tag];
    }
    function getCurrentReplyInfo(bytes32 parentTransactionHash) external constant returns (uint[2]) {
        return currentReplyInfoMap[parentTransactionHash];
    }
    
    // Post Feed 
    event PostEvent(uint[2] previousFeedTransactionInfo);
    event SavePreviousTagInfoByTimeEvent(bytes32 tag, uint[2] previousTagInfoByTime);
    event SavePreviousTagInfoByTrendEvent(bytes32 tag, uint[2] previousTagInfoByTrend);
    event SavePreviousMentionEvent(address mention, uint[2] previousMentionInfo);
    function post(uint version, uint timestamp, string message, uint messageHash, bytes32 previousFeedTransactionHash, bytes32[] tags) external {
        emit PostEvent(currentFeedInfoMap[msg.sender]);
        uint blockNumber = block.number;
        currentFeedInfoMap[msg.sender][0] = blockNumber;
        currentFeedInfoMap[msg.sender][1] = messageHash;

        bytes32 tag;
        uint i;
        for (i = 0; i < tags.length; i++) {
            tag = tags[i];
            emit SavePreviousTagInfoByTimeEvent(tag, currentTagInfoByTimeMap[tag]);
            currentTagInfoByTimeMap[tag][0] = blockNumber;
            currentTagInfoByTimeMap[tag][1] = messageHash;
            
            if (tag >> 20 != 0x0) { // this tag is not a user address.
                emit SavePreviousTagInfoByTrendEvent(tag, currentTagInfoByTrendMap[tag]);
                currentTagInfoByTrendMap[tag][0] = blockNumber;
                currentTagInfoByTrendMap[tag][1] = messageHash;
            }
        }
    }

    // Repost Feed
    event RepostEvent(uint[2] previousFeedTransactionInfo);
    function repost(uint version, uint timestamp, bytes32 parentTransactionHash, uint parentTransactionBlockNumber, uint parentTransactionMessageHash, bytes32 previousFeedTransactionHash, bytes32[] tags) external {
        emit RepostEvent(currentFeedInfoMap[msg.sender]);
        // We can see the sender of feedInfo is not from msg.sender
        // So this is a repost.
        currentFeedInfoMap[msg.sender][0] = parentTransactionBlockNumber;
        currentFeedInfoMap[msg.sender][1] = parentTransactionMessageHash;
        state[parentTransactionHash][5] = state[parentTransactionHash][5] + 1; // increase number of reposts.

        bytes32 tag;
        for (uint i = 0; i < tags.length; i++) {
            tag = tags[i];
            if (currentTagInfoByTrendMap[tag][1] != parentTransactionMessageHash) { // not the same post.  
                emit SavePreviousTagInfoByTrendEvent(tag, currentTagInfoByTrendMap[tag]);
                currentTagInfoByTrendMap[tag][0] = parentTransactionBlockNumber;
                currentTagInfoByTrendMap[tag][1] = parentTransactionMessageHash;
            }
        }
    }
    
    // Reply Feed
    event ReplyEvent(uint[2] previousReplyInfo);
    function reply(uint version, uint timestamp, bytes32 parentTransactionHash, uint parentTransactionBlockNumber, uint parentTransactionMessageHash, string message, uint messageHash, bytes32 previousReplyTransactionHash, bytes32[] tags) external {
        emit ReplyEvent(currentReplyInfoMap[parentTransactionHash]);
        uint blockNumber = block.number;
        currentReplyInfoMap[parentTransactionHash][0] = blockNumber;   
        currentReplyInfoMap[parentTransactionHash][1] = messageHash;
        state[parentTransactionHash][4] = state[parentTransactionHash][4] + 1; // increase number of replies
        
        bytes32 tag;
        for (uint i = 0; i < tags.length; i++) {
            tag = tags[i];
            if (currentTagInfoByTrendMap[tag][1] != parentTransactionMessageHash) { // not the same post.  
                emit SavePreviousTagInfoByTrendEvent(tag, currentTagInfoByTrendMap[tag]);
                currentTagInfoByTrendMap[tag][0] = parentTransactionBlockNumber;
                currentTagInfoByTrendMap[tag][1] = parentTransactionMessageHash;
            }
            if (tag >> 20 == 0) { // it's a user address
                currentTagInfoByTimeMap[tag][0] = blockNumber;
                currentTagInfoByTimeMap[tag][1] = messageHash;
            }
        }
    }

    // Repost and Reply
    event RepostAndReplyEvent(uint[2] previousFeedTransactionInfo, uint[2] previousReplyInfo);
    function repostAndReply(uint version, uint timestamp, bytes32 parentTransactionHash, uint parentTransactionBlockNumber, uint parentTransactionMessageHash, string message, uint messageHash, bytes32 previousReplyTransactionHash, bytes32[] tags) external {
        emit RepostAndReplyEvent(currentFeedInfoMap[msg.sender], currentReplyInfoMap[parentTransactionHash]);
        uint blockNumber = block.number;
        
        currentReplyInfoMap[parentTransactionHash][0] = blockNumber;   
        currentReplyInfoMap[parentTransactionHash][1] = messageHash;
        state[parentTransactionHash][4] = state[parentTransactionHash][4] + 1; // increase number of replies
    
        currentFeedInfoMap[msg.sender][0] = blockNumber;
        currentFeedInfoMap[msg.sender][1] = messageHash;
        state[parentTransactionHash][5] = state[parentTransactionHash][5] + 1; // increase number of reposts.

        bytes32 tag;
        for (uint i = 0; i < tags.length; i++) {
            tag = tags[i];
            if (currentTagInfoByTrendMap[tag][1] != parentTransactionMessageHash) { // not the same post.  
                emit SavePreviousTagInfoByTrendEvent(tag, currentTagInfoByTrendMap[tag]);
                currentTagInfoByTrendMap[tag][0] = parentTransactionBlockNumber;
                currentTagInfoByTrendMap[tag][1] = parentTransactionMessageHash;
            }

            if (tag >> 20 == 0) { // it's a user address
                currentTagInfoByTimeMap[tag][0] = blockNumber;
                currentTagInfoByTimeMap[tag][1] = messageHash;
            }
        }
    }

    // Send ether 
    function sendEther(bytes32 transactionHash, address postAutherAddress, uint amount1, address appAuthorAddress, uint amount2) payable external {
        state[transactionHash][0] = state[transactionHash][0] + amount1 + amount2;
        if (amount1 > 0) {
            postAutherAddress.transfer(amount1);
        }
        if (amount2 > 0) {
            appAuthorAddress.transfer(amount2);
        }
    }

    // Like
    function like(bytes32 transactionHash) external {
        state[transactionHash][1] = state[transactionHash][1] + 1;
    }

    // Dislike
    function dislike(bytes32 transactionHash) external {
        state[transactionHash][2] = state[transactionHash][2] + 1;
    }

    // Report
    function report(bytes32 transactionHash) external {
        state[transactionHash][3] = state[transactionHash][3] + 1;
    }

    // Like tag
    function likeTag(bytes32 tag) external {
        tagState[tag][0] = tagState[tag][0] + 1;
    }

    // Dislike tag
    function dislikeTag(bytes32 tag) external {
        tagState[tag][1] = tagState[tag][1] + 1;
    }

    // Report tag
    function reportTag(bytes32 tag) external {
        tagState[tag][2] = tagState[tag][2] + 1;
    }

    // Like user
    function likeUser(address userAddress) external {
        userState[userAddress][0] = userState[userAddress][0] + 1;
    }

    // Dislike user
    function dislikeUser(address userAddress) external {
        userState[userAddress][1] = userState[userAddress][1] + 1;
    }
    
    // Report user
    function reportUser(address userAddress) external {
        userState[userAddress][2] = userState[userAddress][2] + 1;
    }
    
}