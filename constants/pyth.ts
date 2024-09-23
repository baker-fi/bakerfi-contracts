import { OracleNamesEnum } from './types';

export type FeedsDictionary = { [key: string]: string };

export const feedIds: FeedsDictionary = {
  [OracleNamesEnum.ETH_USD]: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  [OracleNamesEnum.WSTETH_USD]:
    '0x6df640f3b8963d8f8358f791f352b8364513f6ab1cca5ed3f1f7b5448980e784',
  [OracleNamesEnum.CBETH_USD]: '0x15ecddd26d49e1a8f1de9376ebebc03916ede873447c1255d2d5891b92ce5717',
};
