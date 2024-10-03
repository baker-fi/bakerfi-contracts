/**
 * Deployed Contract Addresses
 */

import { Networks } from "./network-deploy-config";

export type BakerDeployConfig = {
    proxyAdmin?: string;
    serviceRegistry: string;
    flashLender: string;
    wstETHUSDOracle:string;
    ethUSDOracle: string;
    strategy:string;
    strategyProxy?: string;
    vault: string;
    vaultProxy?: string;
    settings: string;
    settingsProxy?: string;
    bkr?: string;
    wstETHUSDOracleFeedId?: string;
    ethUSDOracleFeedId?: string;
}

export const deployConfigMap : {[key: string]: BakerDeployConfig} =
{
    "local": {
        proxyAdmin: "0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e",
        serviceRegistry: "0x5bC13d5ce928Ae6e414A831D173E86fD040deBb9",
        flashLender: "0x5Ac32814f9EB4d415779892890a216b244FcB3B5",
        wstETHUSDOracle: "0x2a3a012d97369a5BA925fC1aAAc6c6E9cA985EDd",
        ethUSDOracle: "0xF8D0e82B1EE3EEc7AEcDAa4E1c94E29fe3Db712E",
        settings: "0x26A76D21edD8049fd394786976EF578010569FcB",
        settingsProxy: "0xB7d0add4df75aa719bE464e860C8c40bb7FA2122",
        strategy: "0xc2a603BcFa46e5616CEa164DA6A80cF62E080858",
        strategyProxy: "0xe33CA06EaaAF46A98C5631CF6c847fC50067E727",
        vault: "0x4129eE2030194089cEECc34fE47AfFb381E9e45D",
        vaultProxy: "0xb99b2F8f3d121f2B491Cc61b84689a5638E106B4",
        bkr: "0x9F5c44Edc6AD6F2036aA4ADFA4DA92C78EE1A101",
    },
    "arbitrum": {
        proxyAdmin: "0xa641256b225e215c559cdC58F8757ad7140A2723",
        serviceRegistry: "0x82405993C4473A4364DF9D0C09E1A81Ecef9CA25",
        flashLender: "0x2db37f9DcD838B06a40Dc1aB171a8eBB474ef44C",
        wstETHUSDOracle: "0x63121b44680C502FDeDC725cd7CBcD37E0967d88",
        ethUSDOracle: "0xd0fDAfd2cf24fC4D8B57ffC001d3DC10422d3623",
        strategy: "0x8Fb35FEf7c2fcdfE09b6985f894905b875111a72",
        strategyProxy: "0x40aB23988835bdA372deA30690CCCC3419580548",
        vault: "0x3a6f7a481ad94eb03d229b846002561dc2742449",
        vaultProxy: "0x5c1b2312FaE6c0d61B6A15A8093842E9fE5b1e44",
        settings: "0xb0bbF58c8199F3CA383F0535b6a58A6E5Bbd587B",
        settingsProxy: "0xBd7f910A074D9d35789a47FF0962b5706D7855dF",
        bkr: "0x17f498e79c166abc68ea1cB1a3b5E540279682D8",
    },
    // Use from Block //16398833
    "base": {
        proxyAdmin: "0x796Eb52Bd29D28D6950673F3Fe41aD2025D3d327",
        serviceRegistry: "0x3E2fe09C271B5dbB35C71a13357E5fD924469a68",
        flashLender: "0xdbDA5026367237Def645C17108586BAE80d3173B",
        wstETHUSDOracle: "0x596F76F8583ABA8BD87f0513282145B8Bc4EEce3",
        ethUSDOracle: "0xEA62C6dE7ecBbAB2c43DC7031237ac79E83e3e25",
        strategy: "0x6d6e00c12dd14ec7eb8e98d7059e9481950bdc5b",
        strategyProxy: "0xaf01884b2c52b05252642F7AF5eFa642aF7C36D0",
        vault: "0xa8C8216e586D89703ed2D3Fb589a7A7cCb6F207F",
        vaultProxy: "0x37327c99bBc522e677a97d01021dB20227faF60A",
        settings: "0x395Fb82F6c2538bAf7c1943fd72F060829ffA86F",
        settingsProxy: "0x16CbE59e142DeAd78eeB2AeD6d550771d3Af5d17",
        bkr: "",

    },
    // Use from Block //16398833
    "base_devnet": {
        proxyAdmin: "0x796Eb52Bd29D28D6950673F3Fe41aD2025D3d327",
        serviceRegistry: "0x3E2fe09C271B5dbB35C71a13357E5fD924469a68",
        flashLender: "0xdbDA5026367237Def645C17108586BAE80d3173B",
        wstETHUSDOracle: "0xcc9b1371216a9c50c3F09434A1Ce180Fd55c0E48",
        ethUSDOracle: "0x95CEaB27b604E7f2c916918e0b343793e65699E4",
        strategy: "0x776af1514b080377E828910906057d72f7Df848d",
        strategyProxy: "0xaf01884b2c52b05252642F7AF5eFa642aF7C36D0",
        vault: "0xfAcdC57c56383b835a0C26B71B853b027A2298CC",
        vaultProxy: "0x37327c99bBc522e677a97d01021dB20227faF60A",
        settings: "0xa53d53441f6cefb0bcddd0a3480e8f6bbe90d250",
        settingsProxy: "0x16CbE59e142DeAd78eeB2AeD6d550771d3Af5d17",
        bkr: "",
    }
}

export default deployConfigMap;
