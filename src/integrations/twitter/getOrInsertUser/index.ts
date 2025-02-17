import { database } from "@/database/database";
import { TwitterUser } from "@/database/entities/TwitterUser";
import { getUserInfo } from "../getUserInfo";

export const getOrInsertUser = async (handle: string): Promise<TwitterUser> => {
  const userRepository = await database.getRepository(TwitterUser);
  const user = await userRepository.findOne({ where: { handle } });
  if (user) {
    return user;
  }
  const userInfo = await getUserInfo(handle);
  const newUser = new TwitterUser();
  newUser.handle = handle;
  newUser.display_name = userInfo.username;
  newUser.follower_count = userInfo.followers;
  newUser.following_count = userInfo.following;
  newUser.tweet_count = userInfo.tweets;
  await userRepository.save(newUser);
  return newUser;
};
