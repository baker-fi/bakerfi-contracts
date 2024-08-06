// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;
import { IPyth } from "../interfaces/pyth/IPyth.sol";
import "../interfaces/pyth/PythStructs.sol";

/**
 *
 * @title Pyth Mock Contract to test with Pyth Oracles
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice Deploys ETH and harvests yield
 *
 */
contract PythMock is IPyth {
  bytes32 constant WSTETH_USD_ORACLE_FEED_ID =
    bytes32(hex"6df640f3b8963d8f8358f791f352b8364513f6ab1cca5ed3f1f7b5448980e784");
  bytes32 constant WETH_USD_ORACLE_FEED_ID =
    bytes32(hex"ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace");
  bytes32 constant CBETH_USD_ORACLE_FEED_ID =
    bytes32(hex"15ecddd26d49e1a8f1de9376ebebc03916ede873447c1255d2d5891b92ce5717");

  // Mapping from Ids to Prices
  mapping(bytes32 => PythStructs.Price) private _prices;
  uint256 private _updateFee;

  constructor() {
    // Set the Initial Values for WSETH/USD
    PythStructs.Price storage wstETHOracle = _prices[WSTETH_USD_ORACLE_FEED_ID];
    wstETHOracle.price = 267451;
    wstETHOracle.expo = -2;
    wstETHOracle.conf = 0;
    wstETHOracle.publishTime = block.timestamp;
    // Set the Initial Values for WETH/USD
    PythStructs.Price storage wETHOracle = _prices[WETH_USD_ORACLE_FEED_ID];
    wETHOracle.price = 231542;
    wETHOracle.expo = -2;
    wETHOracle.conf = 0;
    wETHOracle.publishTime = block.timestamp;
    // Set the Initial Values for CBETH/USD
    PythStructs.Price storage cbETHOracle = _prices[CBETH_USD_ORACLE_FEED_ID];
    cbETHOracle.price = 244991;
    cbETHOracle.expo = -2;
    cbETHOracle.conf = 0;
    cbETHOracle.publishTime = block.timestamp;
  }

  function getValidTimePeriod() external view override returns (uint validTimePeriod) {
    return block.timestamp;
  }

  function getPrice(bytes32 id) external view override returns (PythStructs.Price memory price) {
    require(_prices[id].price >= 0, "Invalid Price Feed");
    return _prices[id];
  }

  function getEmaPrice(bytes32 id) external view override returns (PythStructs.Price memory price) {
    require(_prices[id].price >= 0, "Invalid Price Feed");
    return _prices[id];
  }

  function getPriceUnsafe(
    bytes32 id
  ) external view override returns (PythStructs.Price memory price) {
    require(_prices[id].price >= 0, "Invalid Price Feed");
    return _prices[id];
  }

  function getPriceNoOlderThan(
    bytes32 id,
    uint age
  ) external view override returns (PythStructs.Price memory price) {
    require(_prices[id].price >= 0, "Invalid Price Feed");
    require(block.timestamp - _prices[id].publishTime <= age, "Old Price");
    return _prices[id];
  }

  function getEmaPriceUnsafe(
    bytes32 id
  ) external view override returns (PythStructs.Price memory price) {
    require(_prices[id].price >= 0, "Invalid Price Feed");
    return _prices[id];
  }

  function getEmaPriceNoOlderThan(
    bytes32 id,
    uint age
  ) external view override returns (PythStructs.Price memory price) {
    require(_prices[id].price >= 0, "Invalid Price Feed");
    require(_prices[id].publishTime >= age, "Old Price");
    return _prices[id];
  }

  function updatePriceFeeds(bytes[] calldata updateData) external payable override {
    _parseUpdatesInternal(updateData);
  }

  function updatePriceFeedsIfNecessary(
    bytes[] calldata updateData,
    bytes32[] calldata,
    uint64[] calldata
  ) external payable override {
    _parseUpdatesInternal(updateData);
  }

  function getUpdateFee(bytes[] calldata) external view override returns (uint feeAmount) {
    return uint(_updateFee);
  }

  function parsePriceFeedUpdates(
    bytes[] calldata updateData,
    bytes32[] calldata,
    uint64,
    uint64
  ) external payable override returns (PythStructs.PriceFeed[] memory priceFeeds) {
    return _parseUpdatesInternal(updateData);
  }

  function parsePriceFeedUpdatesUnique(
    bytes[] calldata updateData,
    bytes32[] calldata,
    uint64,
    uint64
  ) external payable override returns (PythStructs.PriceFeed[] memory priceFeeds) {
    return _parseUpdatesInternal(updateData);
  }

  function _parseUpdatesInternal(
    bytes[] calldata updateData
  ) internal returns (PythStructs.PriceFeed[] memory feeds) {
    feeds = new PythStructs.PriceFeed[](updateData.length);

    require(msg.value >= _updateFee, "No Fee");
    for (uint i = 0; i < updateData.length; i++) {
      // Decode the Pyth Update Data
      (feeds[i]) = abi.decode(updateData[i], (PythStructs.PriceFeed));

      if (_prices[feeds[i].id].price != 0) {
        _prices[feeds[i].id].price = feeds[i].price.price;
        _prices[feeds[i].id].expo = feeds[i].price.expo;
        _prices[feeds[i].id].conf = feeds[i].price.conf;
        _prices[feeds[i].id].publishTime = block.timestamp;

        emit PriceFeedUpdate(
          feeds[i].id,
          uint64(feeds[i].price.publishTime),
          feeds[i].price.price,
          feeds[i].price.conf
        );
      }
    }
  }
}
