export interface Settings {
  postAsIPFSHash: boolean;
  postToRibbitTopic: boolean;
  followingUsernames: {
    /**
     * username that you are following
     */
    username: string;
    /**
     * when you started following this user
     */
    timestamp: number;
    /**
     * order of this username
     */
    order?: number;
  }[];
  followingTopics: {
    /**
     * topic and you are following
     */
    topic: string;
    /**
     * when you started following this topic
     */
    timestamp: number;
    /**
     * order of this topic
     */
    order?: number;
  }[];
  /**
   * Language for Ribbit web interface.
   */
  language: string;
}
