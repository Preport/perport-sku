# Perport Sku

Improved sku (stock keeping unit), schema and parser for Team Fortress 2 items.

Somewhat backwards compatible with older sku versions.

Sku includes paint, spells, parts, sheen and killstreaker.

##

**Expect breaking changes till v1.**

Also feel free to create pull requests for optimizations.

## Features

- Parse items from TF2 attributes.
- Parse items from Steam API.
- Compare skus for equality/equivalence. (strict/lax equals)
- Compare skus while ignoring certain attributes. (ie. paint, killstreaks)

## Sku Structure

### Structure of the sku is

DEFINDEX;QUALITY(;norm)(;uUNUSUAL)(;australium)(;uncraftable)(;wWEAR)(;pkPAINTKIT)(;strange)(;kt-KILLSTREAKTIER)(;td-TARGET)(;festive)(;nRARECRAFTNUMBER)(;cCRATE)(;od-OUTPUT)(;oq-OUTPUTQUALITY)(;pPAINT)(;sp[SPELL])(;pt[PART])(;shSHEEN)(;ksKILLSTREAKER)

Where SPELL and PART are arrays ie ;sp1006,8900;pt38,40

;norm is reserved for future use

### Example for a long sku that has every attribute would be

5021;63;u44;australium;uncraftable;w3;pk2023;strange;kt-97;td-71;festive;n3169;c6931;od-24;oq-467;p3188496;sp45,24;pt20,17;sh3161;ks74135 (this item doesn't exist irl)

### Example for a shorteest sku that has no attribute would be

0;6 (which only has defindex and quality)

### The regex below can be used to validate strings for skus

/^(\d+);(\d+)(;norm)?(?:;u(\d+))?(;australium)?(;uncraftable)?(?:;w(\d+))?(?:;pk(\d+))?(;strange)?(?:;kt-(\d+))?(?:;td-(\d+))?(;festive)?(?:;n(\d+))?(?:;c(\d+))?(?:;od-(\d+))?(?:;oq-(\d+))?(?:;p(\d+))?(?:;sp([\d,]+))?(?:;pt([\d,]+))?(?:;sh(\d+))?(?:;ks(\d+))?$/
