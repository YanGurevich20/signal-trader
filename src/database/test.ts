import "reflect-metadata";
import { TwitterUser } from "./entities/TwitterUser";
import { database } from "./database";

export const main = async () => {
  const userRepository = await database.getRepository(TwitterUser);
  const user = new TwitterUser();
  user.handle = "test";
  user.display_name = "Test User";
  user.follower_count = 100;
  user.following_count = 100;
  user.tweet_count = 100;
  user.is_verified = true;
  await userRepository.save(user);
  const users = await userRepository.find();
  console.log(users);
};

main();
