/**
 * Deployed Contract Addresses
 */

import { BakerDeployConfig } from "./types";

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
        proxyAdmin: "0xB94Fc2d1DC579d93d145E01A1AD8b29C2B4B23Cb",
        serviceRegistry: "0xcF9B92716438a62047Fd701E6653dF80Bbb497E3",
        flashLender: "0xF9D7292762C64e9A33DFb3CDc5cEC72C706Ee4Fb",
        wstETHUSDOracle: "0xbbdc137c52891E65A46473bc5FbA500AF2214ca9",
        ethUSDOracle: "0xE5873ea8B9BBcd7ed61A0feAC3f5e2c94b0086a4",
        strategy: "0x0D01EdB9af465d8518999d2a9547526D0A887842",
        strategyProxy: "0x065Db5690D8aa165d73C03150e91E1E4C0898533",
        vault: "0xa5cAc66dF7f33cbA29b08976519636BA448438e4",
        vaultProxy: "0x4c6d58749126FEBb1D28E8B8FdE97DC3107996d3",
        settings: "0x777d272404f5629e372deD32CEf606AAEBC144Fb",
        settingsProxy: "0x130aedd5A36F2D4D21D353C5e593Eab7Ed2eF8d6",
        bkr: "0x17f498e79c166abc68ea1cB1a3b5E540279682D8",
    },
    // Use from Block //16398833
    "base": {
        proxyAdmin: "0x796Eb52Bd29D28D6950673F3Fe41aD2025D3d327",
        serviceRegistry: "0x3E2fe09C271B5dbB35C71a13357E5fD924469a68",
        flashLender: "0xdbDA5026367237Def645C17108586BAE80d3173B",
        wstETHUSDOracle: "0xcc9b1371216a9c50c3F09434A1Ce180Fd55c0E48",
        ethUSDOracle: "0x95CEaB27b604E7f2c916918e0b343793e65699E4",
        strategy: "0x9d6df3F3d508870dFc80b7e11b6b38798d98C809",
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
