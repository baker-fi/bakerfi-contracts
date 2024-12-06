// SPDX-License-Identifier: MIT
/*
 * This library was adapted from Boring Solidity Rebase Library
 * https://github.com/boringcrypto/BoringSolidity/blob/78f4817d9c0d95fe9c45cd42e307ccd22cf5f4fc/contracts/libraries/BoringRebase.sol
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 */
pragma solidity ^0.8.24;

struct Rebase {
  uint256 elastic;
  uint256 base;
}

/**
 * @title RebaseLibrary
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @dev Library for handling rebase operations. This library was adapted from Boring Solidity Rebase Library
 */
library RebaseLibrary {
  /// @notice Calculates the base value in relationship to `elastic` and `total`.
  function toBase(
    Rebase memory total,
    uint256 elastic,
    bool roundUp
  ) internal pure returns (uint256 base) {
    if (total.elastic == 0 || total.base == 0) {
      base = elastic;
    } else {
      base = (elastic * total.base) / total.elastic;
      if (roundUp && (base * total.elastic) / total.base < elastic) {
        base++;
      }
    }
  }

  /// @notice Calculates the elastic value in relationship to `base` and `total`.
  function toElastic(
    Rebase memory total,
    uint256 base,
    bool roundUp
  ) internal pure returns (uint256 elastic) {
    if (total.base == 0) {
      elastic = base;
    } else {
      elastic = (base * total.elastic) / total.base;
      if (roundUp && (elastic * total.base) / total.elastic < base) {
        elastic++;
      }
    }
  }
}
