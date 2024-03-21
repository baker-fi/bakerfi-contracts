// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

struct Rebase {
    uint256 elastic;
    uint256 base;
}

library RebaseLibrary {
    /// @notice Calculates the base value in relationship to `elastic` and `total`.
    function toBase(
        Rebase memory total,
        uint256 elastic,
        bool roundUp
    ) internal pure returns (uint256 base) {
        if (total.elastic == 0) {
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

contract TestRebaseLibrary {
    using RebaseLibrary for Rebase;

    function toBase(Rebase memory total, uint256 elastic, bool roundUp) public pure returns (uint) {
        return total.toBase(elastic, roundUp);
    }

    function toElastic(
        Rebase memory total,
        uint256 base,
        bool roundUp
    ) public pure returns (uint256 elastic) {
        return total.toElastic(base, roundUp);
    }
}
